from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import logging

from config import get_settings
from models.schemas import (
    IngestRequest,
    IngestResponse,
    QueryRequest,
    QueryResponse,
    HealthResponse,
    IngestFileRequest
)
from services.ingestion import ingestion_service
from services.retriever import retriever_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="CreatorOS RAG Service",
    description="RAG backend for AI content creation with ChromaDB",
    version="1.0.0"
)

# CORS middleware for N8N access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check health status of the RAG service and dependencies."""
    chroma_ok = retriever_service.check_connection()

    # Check Ollama connection
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"http://{settings.ollama_host}:{settings.ollama_port}/api/tags"
            )
            ollama_ok = response.status_code == 200
    except Exception:
        pass

    return HealthResponse(
        status="healthy" if chroma_ok else "degraded",
        chroma_connected=chroma_ok,
        ollama_connected=ollama_ok,
        embedding_model=settings.embedding_model
    )


@app.post("/ingest", response_model=IngestResponse)
async def ingest_document(request: IngestRequest):
    """Ingest a document into the knowledge base."""
    result = await ingestion_service.ingest_document(
        content=request.content,
        title=request.title,
        doc_type=request.doc_type,
        metadata=request.metadata
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result


@app.post("/ingest-file", response_model=IngestResponse)
async def ingest_file(request: IngestFileRequest):
    """Ingest a file from the knowledge-base directory."""
    result = await ingestion_service.ingest_file(
        file_path=request.file_path,
        doc_type=request.doc_type
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result


@app.post("/ingest-all")
async def ingest_all_files():
    """Ingest all files from the knowledge-base directory."""
    results = await ingestion_service.ingest_all_files()
    successful = sum(1 for r in results if r.success)

    return {
        "total_files": len(results),
        "successful": successful,
        "failed": len(results) - successful,
        "results": [r.model_dump() for r in results]
    }


@app.post("/query", response_model=QueryResponse)
async def query_knowledge_base(request: QueryRequest):
    """Query the knowledge base for relevant context."""
    chunks = await retriever_service.query(
        query_text=request.query,
        top_k=request.top_k,
        doc_types=request.doc_types
    )

    return QueryResponse(
        query=request.query,
        chunks=chunks,
        total_results=len(chunks)
    )


@app.get("/stats")
async def get_stats():
    """Get statistics about the knowledge base."""
    return await retriever_service.get_collection_stats()


@app.delete("/clear")
async def clear_collection():
    """Clear all documents from the knowledge base. Use with caution."""
    try:
        client = retriever_service._get_client()
        client.delete_collection(settings.chroma_collection)
        retriever_service._collection = None
        return {"message": "Collection cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
