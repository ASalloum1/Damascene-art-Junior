"""
Application configuration management.

Uses pydantic-settings to load configuration from environment variables
and .env files with type validation.
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Project root directory (the visual-search/ folder)
BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All settings have sensible defaults for local development.
    Override them by setting environment variables or via a .env file.
    """

    # --- Application metadata ---
    app_name: str = "Damascene Art Visual Search"
    app_version: str = "0.1.0"
    app_description: str = (
        "Visual similarity search service for Damascene art products "
        "powered by DINOv2 embeddings and FAISS index."
    )

    # --- Server configuration ---
    host: str = "127.0.0.1"
    port: int = 8000

    # --- Environment ---
    environment: str = "development"  # development | staging | production
    debug: bool = True

    # --- Model configuration ---
    # The DINOv2 model identifier on Hugging Face Hub
    model_name: str = "facebook/dinov2-large"
    # Embedding dimension produced by the model (1024 for dinov2-large)
    embedding_dim: int = 1024
    # Device to run the model on: "cuda" or "cpu"
    # Auto-detected at runtime if set to "auto"
    device: str = "auto"

    # --- Paths ---
    # All paths are absolute, computed from BASE_DIR
    faiss_index_path: Path = BASE_DIR / "data" / "faiss_index" / "products.faiss"
    samples_dir: Path = BASE_DIR / "data" / "samples"

    # --- Pydantic settings configuration ---
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        # Ignore extra environment variables instead of raising
        extra="ignore",
        # Disable pydantic's reserved 'model_' namespace check
        # (we use 'model_name' for the DINOv2 model identifier)
        protected_namespaces=(),
    )


# Singleton instance — import this from anywhere in the app
settings = Settings()