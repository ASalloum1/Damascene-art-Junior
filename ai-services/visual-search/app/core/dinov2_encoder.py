"""
DINOv2 image encoder implementation.

Wraps Hugging Face's transformers library to provide a clean, batched,
device-agnostic interface for generating image embeddings.

Usage:
    encoder = DinoV2Encoder()
    embedding = encoder.encode("path/to/image.jpg")
    # embedding.shape == (1024,)
"""
from io import BytesIO
from pathlib import Path
from typing import List, Union

import numpy as np
import torch
from PIL import Image
from transformers import AutoModel, AutoImageProcessor

from app.core.base_encoder import BaseEncoder


# Type alias for any acceptable image input
ImageInput = Union[Image.Image, str, Path, bytes]


class DinoV2Encoder(BaseEncoder):
    """
    DINOv2 encoder using Hugging Face transformers.

    Loads the model once on initialization and reuses it across all encode calls.
    Outputs are L2-normalized so that inner product equals cosine similarity.
    """

    def __init__(
        self,
        model_name: str = "facebook/dinov2-large",
        device: str = "auto",
    ):
        """
        Initialize the encoder.

        Args:
            model_name: HuggingFace model identifier.
                Default: "facebook/dinov2-large" (1024-dim embeddings).
            device: "cuda", "cpu", or "auto" (uses CUDA if available).
        """
        self._model_name = model_name
        self._device = self._resolve_device(device)

        print(f"[DinoV2Encoder] Loading {model_name} on {self._device}...")
        self._processor = AutoImageProcessor.from_pretrained(model_name)
        self._model = AutoModel.from_pretrained(model_name)
        self._model = self._model.to(self._device)
        self._model.eval()  # Inference mode: disables dropout, batch norm updates
        print(f"[DinoV2Encoder] Ready.")

        # Cache embedding dimension by inspecting the model config
        self._embedding_dim = self._model.config.hidden_size  # 1024 for large

    @staticmethod
    def _resolve_device(device: str) -> str:
        """Resolve 'auto' to 'cuda' or 'cpu' based on availability."""
        if device == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        if device == "cuda" and not torch.cuda.is_available():
            raise RuntimeError(
                "CUDA requested but not available. "
                "Use device='cpu' or device='auto'."
            )
        return device

    # --- BaseEncoder interface implementation ---

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def embedding_dim(self) -> int:
        return self._embedding_dim

    @property
    def device(self) -> str:
        return self._device

    def encode(self, image: ImageInput) -> np.ndarray:
        """
        Encode a single image to a 1D embedding vector.

        Returns:
            np.ndarray of shape (embedding_dim,), dtype float32, L2-normalized.
        """
        embeddings = self.encode_batch([image])
        return embeddings[0]  # (embedding_dim,)

    def encode_batch(self, images: List[ImageInput]) -> np.ndarray:
        """
        Encode multiple images at once.

        Returns:
            np.ndarray of shape (batch_size, embedding_dim), dtype float32,
            row-wise L2-normalized.
        """
        if len(images) == 0:
            return np.empty((0, self._embedding_dim), dtype=np.float32)

        # Convert all inputs to PIL Images
        pil_images = [self._to_pil(img) for img in images]

        # Preprocess (resize, normalize) and stack into batch tensor
        inputs = self._processor(images=pil_images, return_tensors="pt")
        inputs = {k: v.to(self._device) for k, v in inputs.items()}

        # Forward pass without gradient computation (faster, less memory)
        with torch.no_grad():
            outputs = self._model(**inputs)

        # DINOv2's pooler_output is the [CLS] token representation —
        # a single vector summarizing the entire image.
        embeddings = outputs.pooler_output  # shape: (batch_size, embedding_dim)

        # L2-normalize each row so that ||v|| = 1.
        # This makes inner product equal to cosine similarity in FAISS.
        embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)

        # Move to CPU and convert to numpy (FAISS requires numpy float32)
        return embeddings.cpu().numpy().astype(np.float32)

    # --- Helpers ---

    @staticmethod
    def _to_pil(image: ImageInput) -> Image.Image:
        """Convert any supported input type to a PIL Image in RGB mode."""
        if isinstance(image, Image.Image):
            pil = image
        elif isinstance(image, (str, Path)):
            pil = Image.open(image)
        elif isinstance(image, bytes):
            pil = Image.open(BytesIO(image))
        else:
            raise TypeError(
                f"Unsupported image type: {type(image).__name__}. "
                "Expected PIL.Image, str, Path, or bytes."
            )

        # DINOv2 expects RGB. Convert grayscale, RGBA, etc. to RGB.
        if pil.mode != "RGB":
            pil = pil.convert("RGB")

        return pil