import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # LLM Provider (OpenAI-compatible — works with Skywork, OpenRouter, etc.)
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://skywork-proxy.onrender.com/v1")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-3.1-pro")

    # Embedding
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-large")

    # Storage
    CHROMA_DB_PATH: str = os.getenv("CHROMA_DB_PATH", "./chroma_db")
    KB_FILE_PATH: str = os.getenv("KB_FILE_PATH", "./damascene_knowledge_base.json")

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    TOP_K: int = int(os.getenv("TOP_K", "5"))
    COLLECTION_NAME: str = "damascene_kb"


settings = Settings()
