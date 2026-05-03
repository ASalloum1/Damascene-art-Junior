"""
Smoke test for FaissIndex.

Run from project root:
    python -m scripts.test_faiss
"""
import numpy as np
from pathlib import Path

from app.core.faiss_index import FaissIndex


def main():
    EMBEDDING_DIM = 1024

    print("=== Test 1: Create empty index ===")
    index = FaissIndex(embedding_dim=EMBEDDING_DIM)
    print(f"  size: {index.size}")
    print(f"  is_empty: {index.is_empty}")
    assert index.is_empty
    print("  PASS")
    print()

    print("=== Test 2: Add 100 random vectors ===")
    np.random.seed(42)  # Reproducibility
    embeddings = np.random.randn(100, EMBEDDING_DIM).astype(np.float32)
    # L2-normalize each row (the encoder does this in production)
    embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
    ids = np.arange(1000, 1100, dtype=np.int64)  # IDs 1000..1099

    index.add(embeddings, ids)
    print(f"  size after add: {index.size}")
    assert index.size == 100
    print("  PASS")
    print()

    print("=== Test 3: Search with the first vector itself ===")
    # The closest match should be itself with score ~1.0
    query = embeddings[0]
    results = index.search(query, k=5)
    print(f"  Returned {len(results)} results")
    for r in results:
        print(f"    rank={r.rank}  id={r.item_id}  score={r.score:.4f}")
    assert results[0].item_id == 1000
    assert abs(results[0].score - 1.0) < 1e-5
    print("  PASS — top result is the query itself with score ≈ 1.0")
    print()

    print("=== Test 4: Save and reload ===")
    save_path = Path("data/faiss_index/_test_index.faiss")
    index.save(save_path)
    print(f"  Saved to {save_path}")

    loaded = FaissIndex.load(save_path, embedding_dim=EMBEDDING_DIM)
    print(f"  Loaded — size: {loaded.size}")

    # Search on loaded index, compare to original
    results_loaded = loaded.search(query, k=5)
    same_ids = [r.item_id for r in results] == [r.item_id for r in results_loaded]
    print(f"  Same results as original: {same_ids}")
    assert same_ids
    print("  PASS")

    # Cleanup
    save_path.unlink()
    print("  (test file cleaned up)")
    print()

    print("=== Test 5: Remove some IDs ===")
    to_remove = np.array([1000, 1001, 1002], dtype=np.int64)
    removed_count = index.remove(to_remove)
    print(f"  Removed {removed_count} vectors (expected 3)")
    print(f"  Index size now: {index.size}")
    assert removed_count == 3
    assert index.size == 97
    print("  PASS")
    print()

    print("All FAISS index tests passed ✓")


if __name__ == "__main__":
    main()