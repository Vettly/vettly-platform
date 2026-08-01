from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.clients.candidate_client import CandidateServiceClient
from app.clients.job_client import JobServiceClient
from app.config import settings
from app.embedding import load_model
from app.routers.matching import router as matching_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    app.state.candidate_client = CandidateServiceClient(settings.candidate_service_base_url)
    app.state.job_client = JobServiceClient(settings.job_service_base_url)
    yield
    await app.state.candidate_client.aclose()
    await app.state.job_client.aclose()


app = FastAPI(title="Vettly Matching Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_allowed_origin] if settings.cors_allowed_origin else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matching_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
