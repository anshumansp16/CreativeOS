import httpx
from openai import OpenAI
from typing import List
import logging

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class EmbeddingService:
    def __init__(self):
        self.openai_client = None
        if settings.openai_api_key:
            self.openai_client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.embedding_model
        self.dimension = settings.embedding_dimension

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts using OpenAI or Ollama fallback."""
        if self.openai_client:
            return await self._openai_embeddings(texts)
        else:
            return await self._ollama_embeddings(texts)

    async def _openai_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using OpenAI text-embedding-3-small."""
        try:
            response = self.openai_client.embeddings.create(
                model=self.model,
                input=texts,
            )
            embeddings = [item.embedding for item in response.data]
            logger.info(f"Generated {len(embeddings)} embeddings via OpenAI")
            return embeddings
        except Exception as e:
            logger.error(f"OpenAI embedding error: {e}")
            # Fallback to Ollama
            return await self._ollama_embeddings(texts)

    async def _ollama_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using Ollama (nomic-embed-text or similar)."""
        embeddings = []
        ollama_url = f"http://{settings.ollama_host}:{settings.ollama_port}/api/embeddings"

        async with httpx.AsyncClient(timeout=60.0) as client:
            for text in texts:
                try:
                    response = await client.post(
                        ollama_url,
                        json={
                            "model": "nomic-embed-text",
                            "prompt": text
                        }
                    )
                    response.raise_for_status()
                    data = response.json()
                    embeddings.append(data["embedding"])
                except Exception as e:
                    logger.error(f"Ollama embedding error: {e}")
                    # Return zero vector as fallback
                    embeddings.append([0.0] * self.dimension)

        logger.info(f"Generated {len(embeddings)} embeddings via Ollama")
        return embeddings

    async def get_single_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text."""
        embeddings = await self.get_embeddings([text])
        return embeddings[0] if embeddings else [0.0] * self.dimension


# Singleton instance
embedding_service = EmbeddingService()
