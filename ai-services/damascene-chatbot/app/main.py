import logging

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel, Field

from app.config import settings
from app.embeddings import embedding_service
from app.llm import llm_service

logger = logging.getLogger(__name__)


# ── App Setup ──────────────────────────────────────────────

app = FastAPI(
    title="Damascene Art Chatbot API",
    description="RAG-powered bilingual chatbot for Damascene Art",
    version="1.0.0",
)

# CORS: when origins contains "*", credentials must be False per the CORS spec
# (browsers reject the wildcard+credentials combination).
_allow_credentials = "*" not in settings.CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Auth ──────────────────────────────────────────────────

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_api_key(api_key: str | None = Depends(_api_key_header)) -> None:
    """Enforce X-API-Key header when settings.API_KEY is set; no-op otherwise."""
    if not settings.API_KEY:
        return
    if api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


# ── Models ─────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    session_id: str = Field(..., min_length=1)
    conversation_history: list[dict] = Field(default_factory=list, max_length=20)


class ChatResponse(BaseModel):
    response: str
    session_id: str


class HealthResponse(BaseModel):
    status: str
    kb_size: int
    model: str


# ── Endpoints ──────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(require_api_key)])
async def chat(request: ChatRequest):
    """Main chat endpoint — receives a message, retrieves context, generates response."""
    try:
        contexts = embedding_service.search(request.message)

        response_text = await llm_service.generate_response(
            user_message=request.message,
            contexts=contexts,
            conversation_history=request.conversation_history,
        )

        return ChatResponse(
            response=response_text,
            session_id=request.session_id,
        )

    except Exception:
        logger.exception("Chat error in /chat endpoint")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        kb_size=embedding_service.collection.count(),
        model=settings.LLM_MODEL,
    )


@app.post("/ingest", dependencies=[Depends(require_api_key)])
async def ingest():
    """Trigger KB ingestion (admin endpoint)."""
    try:
        embedding_service.ingest_knowledge_base()
        return {
            "status": "ok",
            "documents": embedding_service.collection.count(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search", dependencies=[Depends(require_api_key)])
async def search(query: str, top_k: int = 5):
    """Debug endpoint — search the KB without generating a response."""
    results = embedding_service.search(query, top_k=top_k)
    return {"query": query, "results": results}
