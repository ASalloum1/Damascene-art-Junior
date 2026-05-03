"""
HTTP routes for the visual search API.

All routes are mounted under /api/v1.
"""
import time
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)

from app.api.dependencies import get_service
from app.api.schemas import (
    IndexAddResponse,
    IndexDeleteResponse,
    IndexStatsResponse,
    SearchHit,
    SearchResponse,
)
from app.core.visual_search_service import VisualSearchService


# Type alias to keep route signatures readable
ServiceDep = Annotated[VisualSearchService, Depends(get_service)]


router = APIRouter(prefix="/api/v1", tags=["visual-search"])


# === Indexing ===

@router.post(
    "/index/add",
    response_model=IndexAddResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Index a product image",
)
async def add_to_index(
    service: ServiceDep,
    item_id: Annotated[int, Form(description="Integer ID for this image.")],
    file: Annotated[UploadFile, File(description="Image file to encode.")],
):
    """
    Encode an image with DINOv2 and add its embedding to the FAISS index
    under the given `item_id`.

    The `item_id` should typically be the `product_image_id` from the
    `product_images` table in the application database.
    """
    _validate_image_upload(file)
    image_bytes = await file.read()

    try:
        service.add_image(image_bytes, item_id=item_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index image: {e}",
        )

    stats = service.get_stats()
    return IndexAddResponse(
        item_id=item_id,
        indexed=True,
        total_vectors=stats.total_vectors,
    )


@router.get(
    "/index/stats",
    response_model=IndexStatsResponse,
    summary="Get index statistics",
)
def index_stats(service: ServiceDep):
    """Return current index size, embedding dimension, model, and device."""
    stats = service.get_stats()
    return IndexStatsResponse(
        total_vectors=stats.total_vectors,
        embedding_dim=stats.embedding_dim,
        model_name=stats.model_name,
        device=stats.device,
    )


@router.delete(
    "/index/{item_id}",
    response_model=IndexDeleteResponse,
    summary="Remove an image from the index",
)
def remove_from_index(item_id: int, service: ServiceDep):
    """
    Remove the embedding associated with `item_id` from the index.

    Returns `removed: false` if the ID was not present (idempotent).
    """
    removed = service.remove_image(item_id)
    return IndexDeleteResponse(
        item_id=item_id,
        removed=removed,
        total_vectors=service.get_stats().total_vectors,
    )


# === Search ===

@router.post(
    "/search",
    response_model=SearchResponse,
    summary="Find visually similar images",
)
async def search_similar(
    service: ServiceDep,
    file: Annotated[UploadFile, File(description="Query image.")],
    k: Annotated[int, Form(ge=1, le=100, description="Top K results.")] = 10,
):
    """
    Encode the uploaded image and return the K most visually similar items
    from the index, ordered by cosine similarity (descending).

    Returns an empty result list if the index is empty.
    """
    _validate_image_upload(file)
    image_bytes = await file.read()

    start = time.perf_counter()
    try:
        results = service.search(image_bytes, k=k)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {e}",
        )
    elapsed_ms = (time.perf_counter() - start) * 1000

    hits = [
        SearchHit(item_id=r.item_id, score=r.score, rank=r.rank)
        for r in results
    ]
    return SearchResponse(
        query_processed=True,
        results_count=len(hits),
        results=hits,
        response_time_ms=round(elapsed_ms, 2),
    )


# === Validation helpers ===

ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def _validate_image_upload(file: UploadFile) -> None:
    """Reject obviously bad uploads before reading bytes."""
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported content type: {file.content_type}. "
                f"Allowed: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
            ),
        )
    if file.size is not None and file.size > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds maximum size of {MAX_IMAGE_SIZE_BYTES // (1024*1024)} MB.",
        )