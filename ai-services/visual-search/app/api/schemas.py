"""
Pydantic schemas for API request and response bodies.

These define the JSON shape of every endpoint, with automatic validation
and OpenAPI documentation.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


# === Index management ===

class IndexAddRequest(BaseModel):
    """Form fields for POST /index/add (image is sent separately as multipart)."""
    item_id: int = Field(
        ...,
        description="Integer identifier (typically product_image_id from DB).",
        examples=[42],
    )


class IndexAddResponse(BaseModel):
    """Response for POST /index/add."""
    item_id: int
    indexed: bool = Field(..., description="True if successfully added.")
    total_vectors: int = Field(..., description="Index size after this operation.")


class IndexStatsResponse(BaseModel):
    """Response for GET /index/stats."""
    total_vectors: int
    embedding_dim: int
    model_name: str
    device: str


class IndexDeleteResponse(BaseModel):
    """Response for DELETE /index/{item_id}."""
    item_id: int
    removed: bool
    total_vectors: int


# === Search ===

class SearchHit(BaseModel):
    """A single search result item."""
    item_id: int
    score: float = Field(
        ...,
        description="Cosine similarity in range [-1, 1]. Higher = more similar.",
    )
    rank: int = Field(..., description="1-based position in the result list.")


class SearchResponse(BaseModel):
    """Response for POST /search."""
    query_processed: bool
    results_count: int
    results: List[SearchHit]
    response_time_ms: float = Field(
        ..., description="Total inference + search time in milliseconds."
    )


# === Errors ===

class ErrorResponse(BaseModel):
    """Standard error envelope."""
    detail: str
    error_code: Optional[str] = None