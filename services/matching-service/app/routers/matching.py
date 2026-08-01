from fastapi import APIRouter, Depends, Request

from ..auth import AuthContext, require_recruiter
from ..clients.candidate_client import CandidateServiceClient
from ..clients.job_client import JobServiceClient
from ..schemas import (
    RankCandidatesRequest,
    RankCandidatesResponse,
    SkillGapRequest,
    SkillGapResponse,
)
from ..services.ranking_service import rank_candidates as rank_candidates_service
from ..services.skill_gap_service import compute_skill_gap as compute_skill_gap_service

router = APIRouter(prefix="/api/matching", tags=["matching"])


def get_candidate_client(request: Request) -> CandidateServiceClient:
    return request.app.state.candidate_client


def get_job_client(request: Request) -> JobServiceClient:
    return request.app.state.job_client


@router.post("/rank-candidates", response_model=RankCandidatesResponse)
async def rank_candidates(
    req: RankCandidatesRequest,
    ctx: AuthContext = Depends(require_recruiter),
    candidate_client: CandidateServiceClient = Depends(get_candidate_client),
    job_client: JobServiceClient = Depends(get_job_client),
) -> RankCandidatesResponse:
    return await rank_candidates_service(req, ctx.token, candidate_client, job_client)


@router.post("/skill-gap", response_model=SkillGapResponse)
async def skill_gap(
    req: SkillGapRequest,
    ctx: AuthContext = Depends(require_recruiter),
    candidate_client: CandidateServiceClient = Depends(get_candidate_client),
    job_client: JobServiceClient = Depends(get_job_client),
) -> SkillGapResponse:
    return await compute_skill_gap_service(req, ctx.token, candidate_client, job_client)
