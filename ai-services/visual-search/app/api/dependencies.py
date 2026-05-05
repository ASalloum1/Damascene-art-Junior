"""
FastAPI dependency injection helpers.

Routes use these to obtain shared resources like the VisualSearchService.
"""
from fastapi import Request, HTTPException, status

from app.core.visual_search_service import VisualSearchService


def get_service(request: Request) -> VisualSearchService:
    """
    Retrieve the VisualSearchService singleton from app.state.

    Raised if the service was not initialized (lifespan startup failed).
    """
    service = getattr(request.app.state, "service", None)
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Visual search service is not initialized.",
        )
    return service