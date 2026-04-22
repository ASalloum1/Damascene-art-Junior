from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import settings
from app.embeddings import embedding_service
from app.llm import llm_service


# ── App Setup ──────────────────────────────────────────────

app = FastAPI(
    title="Damascene Art Chatbot API",
    description="RAG-powered bilingual chatbot for Damascene Art",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main chat endpoint — receives a message, retrieves context, generates response."""
    try:
        # Step 1: Search vector DB for relevant context
        contexts = embedding_service.search(request.message)

        # Step 2: Generate response with Gemini
        response_text = await llm_service.generate_response(
            user_message=request.message,
            contexts=contexts,
            conversation_history=request.conversation_history,
        )

        return ChatResponse(
            response=response_text,
            session_id=request.session_id,
        )

    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        kb_size=embedding_service.collection.count(),
        model=settings.GEMINI_MODEL,
    )


@app.post("/ingest")
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


@app.post("/search")
async def search(query: str, top_k: int = 5):
    """Debug endpoint — search the KB without generating a response."""
    results = embedding_service.search(query, top_k=top_k)
    return {"query": query, "results": results}
