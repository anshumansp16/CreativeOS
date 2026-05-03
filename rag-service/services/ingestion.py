import os
import uuid
import hashlib
from typing import List, Tuple
import logging

from config import get_settings
from models.schemas import DocumentType, IngestResponse
from services.embeddings import embedding_service
from services.retriever import retriever_service

logger = logging.getLogger(__name__)
settings = get_settings()


class IngestionService:
    def __init__(self):
        self.chunk_size = settings.chunk_size
        self.chunk_overlap = settings.chunk_overlap

    def _chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks."""
        chunks = []
        words = text.split()

        if len(words) <= self.chunk_size:
            return [text.strip()] if text.strip() else []

        start = 0
        while start < len(words):
            end = start + self.chunk_size
            chunk = " ".join(words[start:end])
            chunks.append(chunk.strip())
            start = end - self.chunk_overlap

        return [c for c in chunks if c]

    def _generate_doc_id(self, title: str, content: str) -> str:
        """Generate a deterministic document ID."""
        hash_input = f"{title}:{content[:200]}"
        return hashlib.md5(hash_input.encode()).hexdigest()[:12]

    async def ingest_document(
        self,
        content: str,
        title: str,
        doc_type: DocumentType,
        metadata: dict = None
    ) -> IngestResponse:
        """Ingest a document into the knowledge base."""
        try:
            collection = retriever_service._get_collection()
            doc_id = self._generate_doc_id(title, content)

            # Chunk the content
            chunks = self._chunk_text(content)

            if not chunks:
                return IngestResponse(
                    success=False,
                    message="No content to ingest",
                    doc_id=doc_id,
                    chunks_created=0
                )

            # Generate embeddings for all chunks
            embeddings = await embedding_service.get_embeddings(chunks)

            # Prepare data for ChromaDB
            ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
            metadatas = [
                {
                    "title": title,
                    "doc_type": doc_type.value,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    **(metadata or {})
                }
                for i in range(len(chunks))
            ]

            # Add to ChromaDB
            collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=chunks,
                metadatas=metadatas
            )

            logger.info(f"Ingested '{title}' with {len(chunks)} chunks")

            return IngestResponse(
                success=True,
                message=f"Successfully ingested '{title}'",
                doc_id=doc_id,
                chunks_created=len(chunks)
            )

        except Exception as e:
            logger.error(f"Ingestion error: {e}")
            return IngestResponse(
                success=False,
                message=f"Ingestion failed: {str(e)}",
                doc_id="",
                chunks_created=0
            )

    async def ingest_file(
        self,
        file_path: str,
        doc_type: DocumentType
    ) -> IngestResponse:
        """Ingest a file from the knowledge-base directory."""
        base_path = "/app/data/knowledge-base"
        full_path = os.path.join(base_path, file_path)

        if not os.path.exists(full_path):
            return IngestResponse(
                success=False,
                message=f"File not found: {file_path}",
                doc_id="",
                chunks_created=0
            )

        try:
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()

            title = os.path.basename(file_path)

            return await self.ingest_document(
                content=content,
                title=title,
                doc_type=doc_type,
                metadata={"source_file": file_path}
            )

        except Exception as e:
            logger.error(f"File ingestion error: {e}")
            return IngestResponse(
                success=False,
                message=f"Failed to ingest file: {str(e)}",
                doc_id="",
                chunks_created=0
            )

    async def ingest_all_files(self) -> List[IngestResponse]:
        """Ingest all files from the knowledge-base directory."""
        base_path = "/app/data/knowledge-base"
        results = []

        type_mapping = {
            "scripts": DocumentType.SCRIPT,
            "notes": DocumentType.NOTES,
        }

        # Ingest brand-voice.md if exists
        brand_voice_path = os.path.join(base_path, "brand-voice.md")
        if os.path.exists(brand_voice_path):
            result = await self.ingest_file("brand-voice.md", DocumentType.BRAND_VOICE)
            results.append(result)

        # Ingest files from subdirectories
        for subdir, doc_type in type_mapping.items():
            subdir_path = os.path.join(base_path, subdir)
            if os.path.exists(subdir_path):
                for filename in os.listdir(subdir_path):
                    if filename.endswith((".md", ".txt")):
                        file_path = os.path.join(subdir, filename)
                        result = await self.ingest_file(file_path, doc_type)
                        results.append(result)

        return results


# Singleton instance
ingestion_service = IngestionService()
