"""
FastAPI application entry point.

Run locally with:
    uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Then visit:
    http://127.0.0.1:8000          → root health check
    http://127.0.0.1:8000/docs     → Swagger UI (interactive API docs)
    http://127.0.0.1:8000/redoc    → ReDoc (alternative API docs)
"""
from fastapi import FastAPI

from app.config import settings


# --- Create the FastAPI application instance ---
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc UI
)


# --- Routes ---

@app.get("/", tags=["meta"])
def read_root() -> dict:
    """
    Root endpoint — basic service identification.

    Returns service name, version, and a welcome message.
    Use this to quickly verify the service is reachable.
    """
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["meta"])
def health_check() -> dict:
    """
    Health check endpoint — used by load balancers and monitoring.

    Returns a simple "ok" status if the service is up.
    Later, this will also check model and FAISS index readiness.
    """
    return {
        "status": "ok",
        "environment": settings.environment,
    }