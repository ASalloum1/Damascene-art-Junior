"""
Abstract base class for image encoders.

This defines the interface that any encoder (DINOv2, CLIP, etc.) must implement.
The application code should depend on this abstraction, not on concrete implementations.
"""
from abc import ABC, abstractmethod
from typing import List, Union
from pathlib import Path

import numpy as np
from PIL import Image


class BaseEncoder(ABC):
    """
    Abstract base class for image-to-vector encoders.

    All encoders must:
    - Accept PIL Images, file paths, or bytes as input.
    - Return a numpy array of float32 with shape (embedding_dim,) for single images,
      or (batch_size, embedding_dim) for batches.
    - Be deterministic: same input → same output.
    """

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Identifier for the underlying model (e.g., 'facebook/dinov2-large')."""
        ...

    @property
    @abstractmethod
    def embedding_dim(self) -> int:
        """Dimensionality of the output vector (e.g., 1024 for DINOv2-large)."""
        ...

    @property
    @abstractmethod
    def device(self) -> str:
        """The device the model is currently running on ('cuda' or 'cpu')."""
        ...

    @abstractmethod
    def encode(
        self,
        image: Union[Image.Image, str, Path, bytes],
    ) -> np.ndarray:
        """
        Encode a single image to an embedding vector.

        Args:
            image: PIL Image, file path (str or Path), or raw image bytes.

        Returns:
            1D numpy array of float32 with shape (embedding_dim,).
        """
        ...

    @abstractmethod
    def encode_batch(
        self,
        images: List[Union[Image.Image, str, Path, bytes]],
    ) -> np.ndarray:
        """
        Encode multiple images at once for efficiency.

        Args:
            images: list of PIL Images, paths, or bytes.

        Returns:
            2D numpy array of float32 with shape (batch_size, embedding_dim).
        """
        ...