"""
FastAPI application entry point.

Run locally with:
    uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Then visit:
    http://127.0.0.1:8000          → root health check
    http://127.0.0.1:8000/docs     → Swagger UI
    http://127.0.0.1:8000/redoc    → ReDoc
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router as api_router
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan handler: load the encoder and FAISS index at startup,
    persist the index on shutdown.
    """
    # === Startup ===
    print("=" * 60)
    print(f"Starting {settings.app_name} v{settings.app_version}")
    print("=" * 60)

    # Imports are deferred so that this module can be imported quickly
    # (e.g., for tooling that doesn't need the heavy ML libs).
    from app.core.dinov2_encoder import DinoV2Encoder
    from app.core.faiss_index import FaissIndex
    from app.core.visual_search_service import VisualSearchService

    # 1. Load the encoder (downloads model on first run, then uses cache)
    encoder = DinoV2Encoder(
        model_name=settings.model_name,
        device=settings.device,
    )

    # 2. Load or create the FAISS index
    if settings.faiss_index_path.exists():
        print(f"Loading existing FAISS index from {settings.faiss_index_path}")
        index = FaissIndex.load(
            settings.faiss_index_path,
            embedding_dim=encoder.embedding_dim,
        )
        print(f"  → Index loaded with {index.size} vectors")
    else:
        print("No existing index found — creating empty index.")
        index = FaissIndex(embedding_dim=encoder.embedding_dim)

    # 3. Wire them together in the service and store on app.state
    app.state.service = VisualSearchService(
        encoder=encoder,
        index=index,
        index_path=settings.faiss_index_path,
    )
    print("Service ready. Accepting requests.")
    print("=" * 60)

    yield  # ← server runs here

    # === Shutdown ===
    print("=" * 60)
    print("Shutting down — saving FAISS index...")
    try:
        app.state.service.save()
        print(f"  → Index saved to {settings.faiss_index_path}")
    except Exception as e:
        print(f"  → WARNING: failed to save index: {e}")
    print("=" * 60)


# --- Create the FastAPI application ---
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# --- Mount the API router ---
app.include_router(api_router)


# --- Root + health endpoints (kept here for simplicity) ---

@app.get("/", tags=["meta"])
def read_root() -> dict:
    """Root endpoint — basic service identification."""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["meta"])
def health_check() -> dict:
    """Health check — returns 'ok' if the service is up."""
    return {
        "status": "ok",
        "environment": settings.environment,
    }