"""
Smoke test for VisualSearchService.

Run from project root:
    python -m scripts.test_service
"""
import os
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")

import requests
from io import BytesIO
from pathlib import Path
from PIL import Image

from app.core.dinov2_encoder import DinoV2Encoder
from app.core.faiss_index import FaissIndex
from app.core.visual_search_service import VisualSearchService


def main():
    EMBEDDING_DIM = 1024
    INDEX_PATH = Path("data/faiss_index/_test_service.faiss")

    print("=== Setting up service ===")
    encoder = DinoV2Encoder()
    index = FaissIndex(embedding_dim=EMBEDDING_DIM)
    service = VisualSearchService(
        encoder=encoder,
        index=index,
        index_path=INDEX_PATH,
    )
    print(f"  Service ready (encoder on {encoder.device})")
    print()

    print("=== Downloading 3 test images ===")
    # Two cats (similar) + one different scene
    urls = [
        "http://images.cocodataset.org/val2017/000000039769.jpg",  # cats
        "http://images.cocodataset.org/val2017/000000000139.jpg",  # living room
        "http://images.cocodataset.org/val2017/000000000285.jpg",  # bear
    ]
    images = []
    for url in urls:
        response = requests.get(url)
        images.append(Image.open(BytesIO(response.content)))
        print(f"  Downloaded: {url.split('/')[-1]} ({images[-1].size})")
    print()

    print("=== Adding images to index ===")
    service.add_images_batch(images, item_ids=[101, 102, 103])
    stats = service.get_stats()
    print(f"  Total vectors: {stats.total_vectors}")
    print(f"  Model: {stats.model_name}")
    print(f"  Device: {stats.device}")
    assert stats.total_vectors == 3
    print("  PASS")
    print()

    print("=== Search: query with image #1 (cats) ===")
    results = service.search(images[0], k=3)
    print(f"  Returned {len(results)} results:")
    for r in results:
        print(f"    rank={r.rank}  id={r.item_id}  score={r.score:.4f}")
    assert results[0].item_id == 101  # The image itself
    assert abs(results[0].score - 1.0) < 1e-4
    print("  PASS — top match is the query itself")
    print()

    print("=== Save and verify ===")
    service.save()
    print(f"  Saved to {INDEX_PATH}")
    print(f"  File size: {INDEX_PATH.stat().st_size:,} bytes")
    INDEX_PATH.unlink()
    print("  (cleaned up)")
    print()

    print("=== Remove an image ===")
    removed = service.remove_image(102)
    print(f"  Removed id=102: {removed}")
    print(f"  New total: {service.get_stats().total_vectors}")
    assert removed
    assert service.get_stats().total_vectors == 2
    print("  PASS")
    print()

    print("All service tests passed ✓")


if __name__ == "__main__":
    main()