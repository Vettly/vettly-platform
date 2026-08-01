from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_secret: str = Field(alias="JWT_SECRET")
    jwt_issuer: str = Field(default="vettly-auth-service", alias="JWT_ISSUER")
    jwt_audience: str = Field(default="vettly-platform", alias="JWT_AUDIENCE")
    candidate_service_base_url: str = Field(alias="CANDIDATE_SERVICE_BASE_URL")
    job_service_base_url: str = Field(alias="JOB_SERVICE_BASE_URL")
    cors_allowed_origin: str = Field(default="", alias="CORS_ALLOWED_ORIGIN")
    embedding_model_name: str = Field(default="all-MiniLM-L6-v2", alias="EMBEDDING_MODEL_NAME")
    skill_match_threshold: float = Field(default=0.6, alias="SKILL_MATCH_THRESHOLD")

    class Config:
        env_file = ".env"
        populate_by_name = True


settings = Settings()
