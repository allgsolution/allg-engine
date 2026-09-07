from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./allg.db"
    redis_url: str = "redis://localhost:6379/0"
    ollama_url: str = "http://localhost:11434"
    s3_endpoint: str = "http://localhost:9000"
    jwt_secret: str = "change-me"
    jwt_alg: str = "HS256"
    openai_api_key: str = ""
    class Config:
        env_file = ".env"
settings = Settings()
