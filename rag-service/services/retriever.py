import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Optional
import logging

from config import get_settings
from models.schemas import DocumentType, RetrievedChunk
from services.embeddings import embedding_service

logger = logging.getLogger(__name__)
settings = get_settings()


class RetrieverService:
    def __init__(self):
        self._client = None
        self._collection = None

    def _get_client(self):
        """Lazy initialization of ChromaDB client."""
        if self._client is None:
            try:
                self._client = chromadb.HttpClient(
                    host=settings.chroma_host,
                    port=settings.chroma_port,
                    tenant="default_tenant",
                    database="default_database",
                )
            except Exception as e:
                logger.error(f"Failed to create ChromaDB client: {e}")
                raise
        return self._client

    def _get_collection(self):
        """Get or create the knowledge base collection."""
        if self._collection is None:
            client = self._get_client()
            self._collection = client.get_or_create_collection(
                name=settings.chroma_collection,
                metadata={"hnsw:space": "cosine"}
            )
        return self._collection

    async def query(
        self,
        query_text: str,
        top_k: int = 5,
        doc_types: Optional[List[DocumentType]] = None
    ) -> List[RetrievedChunk]:
        """Query the knowledge base for relevant chunks."""
        try:
            collection = self._get_collection()

            # Generate query embedding
            query_embedding = await embedding_service.get_single_embedding(query_text)

            # Build where filter if doc_types specified
            where_filter = None
            if doc_types:
                where_filter = {
                    "doc_type": {"$in": [dt.value for dt in doc_types]}
                }

            # Query ChromaDB
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where_filter,
                include=["documents", "metadatas", "distances"]
            )

            # Parse results into chunks
            chunks = []
            if results and results["documents"] and results["documents"][0]:
                for i, doc in enumerate(results["documents"][0]):
                    metadata = results["metadatas"][0][i] if results["metadatas"] else {}
                    distance = results["distances"][0][i] if results["distances"] else 1.0

                    # Convert distance to similarity score (cosine distance to similarity)
                    similarity = 1 - distance

                    chunks.append(RetrievedChunk(
                        content=doc,
                        doc_title=metadata.get("title", "Unknown"),
                        doc_type=DocumentType(metadata.get("doc_type", "reference")),
                        relevance_score=round(similarity, 4),
                        metadata=metadata
                    ))

            logger.info(f"Retrieved {len(chunks)} chunks for query: {query_text[:50]}...")
            return chunks

        except Exception as e:
            logger.error(f"Retrieval error: {e}")
            return []

    async def get_collection_stats(self) -> dict:
        """Get statistics about the knowledge base collection."""
        try:
            collection = self._get_collection()
            count = collection.count()
            return {
                "collection_name": settings.chroma_collection,
                "document_count": count
            }
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {"error": str(e)}

    def check_connection(self) -> bool:
        """Check if ChromaDB is accessible."""
        try:
            client = self._get_client()
            client.heartbeat()
            return True
        except Exception as e:
            logger.error(f"ChromaDB connection error: {e}")
            return False


# Singleton instance
retriever_service = RetrieverService()
