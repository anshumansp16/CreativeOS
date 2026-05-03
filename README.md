# CreatorOS

Local-first AI content creation system using N8N, ChromaDB, Claude/Ollama.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    N8N      │────▶│ RAG Service │────▶│  ChromaDB   │
│  (Workflows)│     │  (FastAPI)  │     │  (Vectors)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│ Claude API  │     │   Ollama    │
│ (Sonnet/    │     │ (Local LLM) │
│  Haiku)     │     │             │
└─────────────┘     └─────────────┘
```

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys
nano .env
```

Required API keys:
- `CLAUDE_API_KEY` - For script generation (Claude Sonnet)
- `OPENAI_API_KEY` - For embeddings (text-embedding-3-small)

### 2. Start Services

```bash
# Start all services
docker compose up -d

# Watch logs
docker compose logs -f

# Check status
docker compose ps
```

### 3. Pull Ollama Model

```bash
# Pull llama3.1 for local inference
docker exec -it creatoros-ollama ollama pull llama3.1:8b

# Optional: Pull embedding model
docker exec -it creatoros-ollama ollama pull nomic-embed-text
```

### 4. Ingest Knowledge Base

```bash
# Ingest brand-voice.md
curl -X POST http://localhost:8080/ingest-file \
  -H "Content-Type: application/json" \
  -d '{"file_path": "brand-voice.md", "doc_type": "brand_voice"}'

# Or ingest all files
curl -X POST http://localhost:8080/ingest-all
```

### 5. Import N8N Workflows

1. Open N8N at http://localhost:5678
2. Login with credentials from `.env`
3. Go to Workflows → Import
4. Import files from `n8n/workflows/`:
   - `idea-generator.json`
   - `script-generator.json`
   - `description-generator.json`

## Services

| Service | Port | Description |
|---------|------|-------------|
| N8N | 5678 | Workflow orchestration |
| RAG Service | 8080 | FastAPI RAG backend |
| ChromaDB | 8000 | Vector database |
| Ollama | 11434 | Local LLM inference |

## API Endpoints

### RAG Service (port 8080)

```bash
# Health check
curl http://localhost:8080/health

# Query knowledge base
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"query": "brand voice", "top_k": 5}'

# Ingest document
curl -X POST http://localhost:8080/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your document content",
    "title": "Document Title",
    "doc_type": "notes"
  }'

# Get stats
curl http://localhost:8080/stats
```

### N8N Webhooks

```bash
# Generate script
curl -X POST http://localhost:5678/webhook/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "How to use AI for productivity",
    "style": "educational",
    "duration": "medium"
  }'

# Generate description
curl -X POST http://localhost:5678/webhook/generate-description \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Video Title",
    "script_summary": "Brief summary",
    "timestamps": ["0:00 Intro", "1:00 Main"],
    "tags": ["ai", "productivity"]
  }'
```

## Project Structure

```
creative/
├── docker-compose.yml      # Stack definition
├── .env                    # API keys (gitignored)
├── .env.example            # Template
│
├── n8n/
│   ├── workflows/          # Exportable workflows
│   └── data/               # N8N data (gitignored)
│
├── rag-service/            # FastAPI backend
│   ├── main.py             # API endpoints
│   ├── services/           # Business logic
│   └── data/knowledge-base/# Source documents
│
├── prompts/                # Prompt templates
│   ├── script-generator.md
│   ├── idea-ranker.md
│   └── description-generator.md
│
├── chroma-data/            # Vector storage (gitignored)
└── ollama-models/          # Model cache (gitignored)
```

## Cost Estimate

| Task | Model | Cost |
|------|-------|------|
| Script generation | Claude Sonnet | ~$0.50/script |
| Description/tags | Claude Haiku | ~$0.02/desc |
| Idea ranking | Ollama (local) | Free |
| Embeddings | text-embedding-3-small | ~$0.02/1M tokens |

**Monthly @ 8 videos: ~$10-15**

## Troubleshooting

### Services not starting
```bash
# Check logs
docker compose logs <service-name>

# Restart specific service
docker compose restart rag-service
```

### ChromaDB connection issues
```bash
# Check if ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat
```

### Ollama model not found
```bash
# List available models
docker exec creatoros-ollama ollama list

# Pull model
docker exec creatoros-ollama ollama pull llama3.1:8b
```

## Adding Knowledge

Add your content to the knowledge base:

1. **Scripts**: Add past scripts to `rag-service/data/knowledge-base/scripts/`
2. **Notes**: Add notes to `rag-service/data/knowledge-base/notes/`
3. **Brand Voice**: Update `brand-voice.md` with your style

Then ingest:
```bash
curl -X POST http://localhost:8080/ingest-all
```

## Cloud Migration

This setup is designed for easy cloud migration:

- **Docker Compose** → Kubernetes (minimal changes)
- **ChromaDB** → Pinecone/Weaviate (same interface via LangChain)
- **RAG Service** → Railway/Render (containerized)
- **N8N** → N8N Cloud (export/import workflows)
