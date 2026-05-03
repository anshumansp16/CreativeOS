from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # API Keys
    openai_api_key: str = ""
    claude_api_key: str = ""

    # ChromaDB
    chroma_host: str = "localhost"
    chroma_port: int = 8000
    chroma_collection: str = "creatoros_knowledge"

    # Ollama
    ollama_host: str = "localhost"
    ollama_port: int = 11434

    # Embedding Configuration
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536

    # RAG Configuration
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k_results: int = 5

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
