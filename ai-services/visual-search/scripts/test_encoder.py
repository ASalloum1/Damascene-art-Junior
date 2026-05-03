"""
Quick smoke test for DinoV2Encoder.

Run from project root:
    python scripts/test_encoder.py
"""
import time
import requests
from io import BytesIO
from PIL import Image

from app.core.dinov2_encoder import DinoV2Encoder


def main():
    # Initialize encoder (loads model, takes a few seconds)
    print("Initializing encoder...")
    start = time.time()
    encoder = DinoV2Encoder()
    print(f"Encoder ready in {time.time() - start:.2f}s")
    print(f"  Model: {encoder.model_name}")
    print(f"  Device: {encoder.device}")
    print(f"  Embedding dim: {encoder.embedding_dim}")
    print()

    # Download a test image
    print("Downloading test image...")
    url = "http://images.cocodataset.org/val2017/000000039769.jpg"
    response = requests.get(url)
    image = Image.open(BytesIO(response.content))
    print(f"Image size: {image.size}, mode: {image.mode}")
    print()

    # Test 1: encode a PIL Image
    print("Test 1: encode PIL Image")
    start = time.time()
    embedding = encoder.encode(image)
    elapsed = (time.time() - start) * 1000
    print(f"  Time: {elapsed:.2f} ms")
    print(f"  Shape: {embedding.shape}")
    print(f"  Dtype: {embedding.dtype}")
    print(f"  L2 norm: {(embedding ** 2).sum() ** 0.5:.6f}  (should be ~1.0)")
    print(f"  First 5 values: {embedding[:5]}")
    print()

    # Test 2: encode bytes
    print("Test 2: encode raw bytes")
    image_bytes = response.content
    embedding_from_bytes = encoder.encode(image_bytes)
    same = (embedding == embedding_from_bytes).all()
    print(f"  Same as PIL result: {same}")
    print()

    # Test 3: encode batch
    print("Test 3: encode batch of 4 images")
    start = time.time()
    batch = encoder.encode_batch([image, image, image, image])
    elapsed = (time.time() - start) * 1000
    print(f"  Time: {elapsed:.2f} ms total ({elapsed/4:.2f} ms per image)")
    print(f"  Shape: {batch.shape}")
    print(f"  All identical (same input): {(batch[0] == batch[1]).all()}")


if __name__ == "__main__":
    main()