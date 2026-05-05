"""
Visual search service — orchestrates the encoder and FAISS index.

This is the business-logic layer between FastAPI routes and the underlying
ML components. Routes should call this service, not the encoder/index directly.
"""
from pathlib import Path
from typing import List, NamedTuple, Union

import numpy as np
from PIL import Image

from app.core.base_encoder import BaseEncoder
from app.core.faiss_index import FaissIndex, SearchResult


class IndexStats(NamedTuple):
    """Snapshot of the current index state."""
    total_vectors: int
    embedding_dim: int
    model_name: str
    device: str


class VisualSearchService:
    """
    High-level visual search operations.

    Wraps an encoder and a FAISS index, providing add/search/remove
    operations that handle image preprocessing and result formatting.
    """

    def __init__(
        self,
        encoder: BaseEncoder,
        index: FaissIndex,
        index_path: Path,
    ):
        """
        Args:
            encoder: a BaseEncoder instance (e.g., DinoV2Encoder).
            index: a FaissIndex instance.
            index_path: where to persist the index on save().
        """
        if encoder.embedding_dim != index.embedding_dim:
            raise ValueError(
                f"Dimension mismatch: encoder={encoder.embedding_dim}, "
                f"index={index.embedding_dim}"
            )
        self._encoder = encoder
        self._index = index
        self._index_path = index_path

    # --- Indexing ---

    def add_image(
        self,
        image: Union[Image.Image, bytes, str, Path],
        item_id: int,
    ) -> None:
        """
        Encode and add a single image to the index.

        Args:
            image: PIL Image, raw bytes, or file path.
            item_id: integer identifier (e.g., product_image_id from DB).
        """
        embedding = self._encoder.encode(image)  # shape: (D,)
        # FAISS requires 2D arrays
        embeddings_batch = embedding.reshape(1, -1)
        ids = np.array([item_id], dtype=np.int64)
        self._index.add(embeddings_batch, ids)

    def add_images_batch(
        self,
        images: List[Union[Image.Image, bytes, str, Path]],
        item_ids: List[int],
    ) -> None:
        """
        Encode and add multiple images at once.

        Args:
            images: list of images (any supported type).
            item_ids: list of integer IDs, same length as images.
        """
        if len(images) != len(item_ids):
            raise ValueError(
                f"Length mismatch: {len(images)} images vs {len(item_ids)} IDs"
            )
        if len(images) == 0:
            return

        embeddings = self._encoder.encode_batch(images)  # (N, D)
        ids = np.array(item_ids, dtype=np.int64)
        self._index.add(embeddings, ids)

    def remove_image(self, item_id: int) -> bool:
        """
        Remove a single image from the index by its ID.

        Returns:
            True if removed, False if the ID was not in the index.
        """
        ids = np.array([item_id], dtype=np.int64)
        removed_count = self._index.remove(ids)
        return removed_count > 0

    # --- Searching ---

    def search(
        self,
        image: Union[Image.Image, bytes, str, Path],
        k: int = 10,
    ) -> List[SearchResult]:
        """
        Find the k most visually similar images to the query.

        Args:
            image: query image (any supported type).
            k: number of results to return.

        Returns:
            List of SearchResult, ordered by similarity (descending).
            Empty list if the index is empty.
        """
        if self._index.is_empty:
            return []

        query_embedding = self._encoder.encode(image)
        return self._index.search(query_embedding, k=k)

    # --- Persistence & introspection ---

    def save(self) -> None:
        """Persist the index to disk at the configured path."""
        self._index.save(self._index_path)

    def get_stats(self) -> IndexStats:
        """Return a snapshot of the current index state."""
        return IndexStats(
            total_vectors=self._index.size,
            embedding_dim=self._index.embedding_dim,
            model_name=self._encoder.model_name,
            device=self._encoder.device,
        )