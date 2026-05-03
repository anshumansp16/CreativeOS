from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class DocumentType(str, Enum):
    SCRIPT = "script"
    NOTES = "notes"
    BRAND_VOICE = "brand_voice"
    REFERENCE = "reference"


class IngestRequest(BaseModel):
    content: str = Field(..., description="Document content to ingest")
    title: str = Field(..., description="Document title/identifier")
    doc_type: DocumentType = Field(default=DocumentType.REFERENCE, description="Type of document")
    metadata: Optional[dict] = Field(default=None, description="Additional metadata")


class IngestResponse(BaseModel):
    success: bool
    message: str
    doc_id: str
    chunks_created: int


class QueryRequest(BaseModel):
    query: str = Field(..., description="Query to search for relevant context")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results to return")
    doc_types: Optional[List[DocumentType]] = Field(default=None, description="Filter by document types")


class RetrievedChunk(BaseModel):
    content: str
    doc_title: str
    doc_type: DocumentType
    relevance_score: float
    metadata: Optional[dict] = None


class QueryResponse(BaseModel):
    query: str
    chunks: List[RetrievedChunk]
    total_results: int


class HealthResponse(BaseModel):
    status: str
    chroma_connected: bool
    ollama_connected: bool
    embedding_model: str


class IngestFileRequest(BaseModel):
    file_path: str = Field(..., description="Path to file in knowledge-base directory")
    doc_type: DocumentType = Field(default=DocumentType.REFERENCE)
