# Damascene Art — Chatbot RAG Service

A bilingual (Arabic/English) RAG-powered chatbot API for the Damascene Art e-commerce platform.

## Architecture

```
Customer → Laravel API → RAG Service (FastAPI) → Gemini API
                              ↕
                         ChromaDB (Vector DB)
                              ↑
                     Knowledge Base (2,035 QA pairs)
```

## Quick Start

### 1. Install dependencies

```bash
cd damascene-rag-service
pip install -r requirements.txt
```

> **Note:** First run will download the embedding model (~2.2 GB). This is a one-time download.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_key_here
```

Get your API key from: https://aistudio.google.com/apikey

### 3. Place the knowledge base file

Copy `damascene_knowledge_base.json` into the project root directory.

### 4. Ingest the knowledge base

```bash
python scripts/ingest.py
```

This embeds all 2,035 QA pairs into ChromaDB. Takes ~5-10 minutes on CPU.

### 5. Start the server

```bash
python scripts/run.py
```

Server starts at `http://localhost:8000`.

### 6. Test it

```bash
# Health check
curl http://localhost:8000/health

# Chat (Arabic)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "ما هي طريقة العناية بالصندوق الخشبي المطعم بالصدف؟", "session_id": "test-1"}'

# Chat (English)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Do you ship internationally?", "session_id": "test-2"}'

# Debug: search KB without generating response
curl -X POST "http://localhost:8000/search?query=shipping+to+europe&top_k=3"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Main chat endpoint |
| GET | `/health` | Health check + KB size |
| POST | `/ingest` | Trigger KB ingestion |
| POST | `/search` | Debug: search KB only |

### POST /chat

**Request:**
```json
{
  "message": "هل تشحنون للخارج؟",
  "session_id": "unique-session-id",
  "conversation_history": [
    {"role": "user", "content": "مرحبا"},
    {"role": "assistant", "content": "أهلاً وسهلاً! كيف يمكنني مساعدتك؟"}
  ]
}
```

**Response:**
```json
{
  "response": "نعم، نوفّر خدمة الشحن إلى جميع أنحاء العالم...",
  "session_id": "unique-session-id"
}
```

## Project Structure

```
damascene-rag-service/
├── app/
│   ├── __init__.py
│   ├── config.py          # Environment configuration
│   ├── embeddings.py      # ChromaDB + embedding model
│   ├── llm.py             # Gemini API integration
│   ├── prompts.py         # System prompts (AR/EN)
│   └── main.py            # FastAPI app + endpoints
├── scripts/
│   ├── ingest.py          # KB ingestion script
│   └── run.py             # Server start script
├── .env.example
├── requirements.txt
├── damascene_knowledge_base.json  # Place here
└── README.md
```

## Laravel Integration

Add to your Laravel backend:

```php
// app/Services/ChatbotService.php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class ChatbotService
{
    private string $ragUrl;

    public function __construct()
    {
        $this->ragUrl = config('services.chatbot.url', 'http://localhost:8000');
    }

    public function chat(string $message, string $sessionId, array $history = []): array
    {
        $response = Http::timeout(15)
            ->post("{$this->ragUrl}/chat", [
                'message'              => $message,
                'session_id'           => $sessionId,
                'conversation_history' => $history,
            ]);

        if ($response->failed()) {
            return [
                'response'   => 'نعتذر، حدث خطأ تقني. يرجى المحاولة مرة أخرى.',
                'session_id' => $sessionId,
            ];
        }

        return $response->json();
    }
}
```

```php
// config/services.php — add:
'chatbot' => [
    'url' => env('CHATBOT_SERVICE_URL', 'http://localhost:8000'),
],
```

```php
// routes/api.php
Route::post('/chat', [ChatController::class, 'send'])
    ->middleware(['throttle:10,1']);
```
