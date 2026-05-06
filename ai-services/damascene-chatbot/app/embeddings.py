import json
import logging
import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer

from app.config import settings

# chromadb 0.6.x still invokes posthog with a broken signature even when
# telemetry is disabled, producing harmless "Failed to send telemetry event"
# log noise on every client/collection/query call. Silence that one logger.
logging.getLogger("chromadb.telemetry.product.posthog").setLevel(logging.CRITICAL)

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Handles embedding generation and ChromaDB operations."""

    def __init__(self):
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}...")
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded.")

        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_DB_PATH,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name=settings.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            f"ChromaDB collection '{settings.COLLECTION_NAME}' ready. "
            f"Documents: {self.collection.count()}"
        )

    def embed_query(self, text: str) -> list[float]:
        """Embed a user query using the e5 'query:' prefix."""
        embedding = self.model.encode(
            f"query: {text}",
            normalize_embeddings=True,
        )
        return embedding.tolist()

    def embed_passage(self, text: str) -> list[float]:
        """Embed a KB passage using the e5 'passage:' prefix."""
        embedding = self.model.encode(
            f"passage: {text}",
            normalize_embeddings=True,
        )
        return embedding.tolist()

    def search(self, query: str, top_k: int = None) -> list[dict]:
        """Search the vector DB for relevant QA pairs."""
        if top_k is None:
            top_k = settings.TOP_K

        if self.collection.count() == 0:
            return []

        query_embedding = self.embed_query(query)

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
        )

        contexts = []
        if results and results["metadatas"]:
            for meta, distance in zip(
                results["metadatas"][0],
                results["distances"][0],
            ):
                contexts.append({
                    "question_ar": meta.get("question_ar", ""),
                    "answer_ar": meta.get("answer_ar", ""),
                    "question_en": meta.get("question_en", ""),
                    "answer_en": meta.get("answer_en", ""),
                    "category": meta.get("category", ""),
                    "similarity": round(1 - distance, 3),
                })

        return contexts

    def ingest_knowledge_base(self, kb_path: str = None):
        """Load the KB JSON and ingest into ChromaDB."""
        if kb_path is None:
            kb_path = settings.KB_FILE_PATH

        with open(kb_path, "r", encoding="utf-8") as f:
            kb_data = json.load(f)

        # Check if already ingested
        if self.collection.count() >= len(kb_data):
            logger.info(f"KB already ingested ({self.collection.count()} documents). Skipping.")
            return

        # Clear existing data for fresh ingestion
        if self.collection.count() > 0:
            logger.info("Clearing existing collection for re-ingestion...")
            self.client.delete_collection(settings.COLLECTION_NAME)
            self.collection = self.client.get_or_create_collection(
                name=settings.COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )

        logger.info(f"Ingesting {len(kb_data)} QA pairs...")

        batch_size = 64
        for i in range(0, len(kb_data), batch_size):
            batch = kb_data[i : i + batch_size]

            ids = []
            documents = []
            embeddings = []
            metadatas = []

            for item in batch:
                # Combine both languages for bilingual search
                combined = (
                    f"{item['question_ar']} {item['answer_ar']} "
                    f"{item['question_en']} {item['answer_en']}"
                )

                ids.append(item["id"])
                documents.append(combined)
                embeddings.append(self.embed_passage(combined))
                metadatas.append({
                    "category": item["category"],
                    "question_ar": item["question_ar"],
                    "answer_ar": item["answer_ar"],
                    "question_en": item["question_en"],
                    "answer_en": item["answer_en"],
                    "tags": ",".join(item.get("tags", [])),
                })

            self.collection.add(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
            )

            progress = min(i + batch_size, len(kb_data))
            logger.info(f"Ingested {progress}/{len(kb_data)}")

        logger.info(f"Ingestion complete. Total documents: {self.collection.count()}")


# Singleton instance
embedding_service = EmbeddingService()
