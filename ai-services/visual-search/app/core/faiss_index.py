"""
FAISS index wrapper for fast vector similarity search.

Uses IndexIDMap(IndexFlatIP) for exact cosine-similarity search with
custom integer IDs (e.g., product_image_id from the database).

Vectors are assumed to be L2-normalized so that inner product equals
cosine similarity. The encoder enforces this; do not pass raw vectors.
"""
from pathlib import Path
from typing import List, NamedTuple

import faiss
import numpy as np


class SearchResult(NamedTuple):
    """A single search hit: (item_id, similarity_score, rank)."""
    item_id: int
    score: float
    rank: int


class FaissIndex:
    """
    Wrapper around FAISS IndexFlatIP for exact cosine-similarity search.

    Uses IndexIDMap to associate each vector with a custom integer ID
    (intended to be the product_image_id from the database).
    """

    def __init__(self, embedding_dim: int):
        """
        Create an empty in-memory index.

        Args:
            embedding_dim: dimensionality of vectors (e.g., 1024 for DINOv2-large).
        """
        self._embedding_dim = embedding_dim
        # IndexFlatIP = exact inner-product search
        # IndexIDMap = wraps it to allow custom IDs via add_with_ids()
        self._index = faiss.IndexIDMap(faiss.IndexFlatIP(embedding_dim))

    @property
    def embedding_dim(self) -> int:
        return self._embedding_dim

    @property
    def size(self) -> int:
        """Number of vectors currently in the index."""
        return self._index.ntotal

    @property
    def is_empty(self) -> bool:
        return self.size == 0

    def add(self, embeddings: np.ndarray, ids: np.ndarray) -> None:
        """
        Add a batch of vectors to the index.

        Args:
            embeddings: 2D array of shape (n, embedding_dim), dtype float32.
                Must be L2-normalized.
            ids: 1D array of shape (n,), dtype int64. Each ID must be unique
                across the index — duplicates will overwrite silently.
        """
        self._validate_embeddings(embeddings)
        self._validate_ids(ids, expected_length=len(embeddings))

        # FAISS requires contiguous arrays of correct dtype
        embeddings = np.ascontiguousarray(embeddings, dtype=np.float32)
        ids = np.ascontiguousarray(ids, dtype=np.int64)

        self._index.add_with_ids(embeddings, ids)

    def search(
        self,
        query_embedding: np.ndarray,
        k: int = 10,
    ) -> List[SearchResult]:
        """
        Find the k most similar vectors to the query.

        Args:
            query_embedding: 1D array of shape (embedding_dim,) or
                2D array of shape (1, embedding_dim). Must be L2-normalized.
            k: number of nearest neighbors to return.

        Returns:
            List of SearchResult, ordered by similarity descending.
            Length is min(k, current index size).
        """
        if self.is_empty:
            return []

        # Reshape 1D → 2D if needed (FAISS expects batched queries)
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)

        self._validate_embeddings(query_embedding)

        # Cap k at the current index size
        k = min(k, self.size)

        # FAISS search: returns (scores, ids), each of shape (1, k)
        query = np.ascontiguousarray(query_embedding, dtype=np.float32)
        scores, ids = self._index.search(query, k)

        # Build result list (taking the first row since we have 1 query)
        results = []
        for rank, (item_id, score) in enumerate(zip(ids[0], scores[0]), start=1):
            # FAISS returns -1 for missing slots if k > size, but we capped k
            if item_id == -1:
                continue
            results.append(
                SearchResult(
                    item_id=int(item_id),
                    score=float(score),
                    rank=rank,
                )
            )
        return results

    def remove(self, ids: np.ndarray) -> int:
        """
        Remove vectors with the given IDs from the index.

        Args:
            ids: 1D array of int64 IDs.

        Returns:
            Number of vectors actually removed.
        """
        ids = np.ascontiguousarray(ids, dtype=np.int64)
        selector = faiss.IDSelectorBatch(ids)
        return self._index.remove_ids(selector)

    def save(self, path: Path | str) -> None:
        """
        Persist the index to disk.

        Args:
            path: file path. Convention: use .faiss extension.
        """
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self._index, str(path))

    @classmethod
    def load(cls, path: Path | str, embedding_dim: int) -> "FaissIndex":
        """
        Load an index from disk.

        Args:
            path: file path to a previously-saved index.
            embedding_dim: expected dimensionality (for validation).

        Returns:
            FaissIndex instance with the loaded data.
        """
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"FAISS index file not found: {path}")

        instance = cls.__new__(cls)
        instance._embedding_dim = embedding_dim
        instance._index = faiss.read_index(str(path))

        # Sanity check
        if instance._index.d != embedding_dim:
            raise ValueError(
                f"Index dimension mismatch: file has {instance._index.d}, "
                f"expected {embedding_dim}."
            )
        return instance

    # --- Internal validation ---

    def _validate_embeddings(self, embeddings: np.ndarray) -> None:
        if embeddings.ndim != 2:
            raise ValueError(
                f"Expected 2D array, got {embeddings.ndim}D"
            )
        if embeddings.shape[1] != self._embedding_dim:
            raise ValueError(
                f"Expected dim {self._embedding_dim}, got {embeddings.shape[1]}"
            )

    @staticmethod
    def _validate_ids(ids: np.ndarray, expected_length: int) -> None:
        if ids.ndim != 1:
            raise ValueError(f"IDs must be 1D, got {ids.ndim}D")
        if len(ids) != expected_length:
            raise ValueError(
                f"Mismatched lengths: {len(ids)} IDs vs {expected_length} embeddings"
            )