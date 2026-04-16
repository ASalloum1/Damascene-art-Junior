from openai import OpenAI

from app.config import settings
from app.prompts import get_system_prompt


class LLMService:
    """Handles LLM API calls using OpenAI-compatible endpoints (Skywork, OpenRouter, etc.)."""

    def __init__(self):
        if not settings.LLM_API_KEY:
            print("WARNING: LLM_API_KEY not set. LLM calls will fail.")
            self.client = None
            return

        self.client = OpenAI(
            base_url=settings.LLM_BASE_URL,
            api_key=settings.LLM_API_KEY,
        )
        self.model = settings.LLM_MODEL
        print(f"LLM configured: {self.model} via {settings.LLM_BASE_URL}")

    def _detect_language(self, text: str) -> str:
        """Simple language detection based on Arabic character presence."""
        arabic_chars = sum(1 for c in text if "\u0600" <= c <= "\u06FF")
        return "ar" if arabic_chars > len(text) * 0.3 else "en"

    def _build_context_block(self, contexts: list[dict], language: str) -> str:
        """Format retrieved KB contexts for the prompt."""
        if not contexts:
            return "No relevant context found."

        parts = []
        for ctx in contexts:
            if language == "ar":
                parts.append(
                    f"س: {ctx['question_ar']}\n"
                    f"ج: {ctx['answer_ar']}"
                )
            else:
                parts.append(
                    f"Q: {ctx['question_en']}\n"
                    f"A: {ctx['answer_en']}"
                )
        return "\n---\n".join(parts)

    async def generate_response(
        self,
        user_message: str,
        contexts: list[dict],
        conversation_history: list[dict] = None,
    ) -> str:
        """Generate a response using the LLM with RAG context."""
        if not self.client:
            return "عذراً، الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً."

        language = self._detect_language(user_message)
        system_prompt = get_system_prompt(language)
        context_block = self._build_context_block(contexts, language)

        # Build the system message with context
        context_label = "السياق المتاح" if language == "ar" else "Available context"
        system_with_context = f"{system_prompt}\n\n## {context_label}:\n{context_block}"

        # Build message history for OpenAI-style API
        messages = [{"role": "system", "content": system_with_context}]

        # Add conversation history (last 30 turns = 60 messages)
        if conversation_history:
            for msg in conversation_history[-30:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role in ("user", "assistant") and content:
                    messages.append({"role": role, "content": content})

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                top_p=0.8,
                max_tokens=1024,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"LLM API error: {e}")
            if language == "ar":
                return "نعتذر، حدث خطأ تقني. يرجى المحاولة مرة أخرى أو التواصل مع فريقنا مباشرة."
            return "We apologize for the technical difficulty. Please try again or contact our team directly."


# Singleton instance
llm_service = LLMService()
