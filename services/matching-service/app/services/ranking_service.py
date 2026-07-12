import logging

from fastapi import HTTPException, status

from ..clients.candidate_client import CandidateServiceClient
from ..clients.job_client import JobServiceClient
from ..embedding import cosine_sim_matrix, embed
from ..schemas import CandidateRankResult, RankCandidatesRequest, RankCandidatesResponse

logger = logging.getLogger(__name__)


def _build_job_text(job) -> str:
    skill_names = ", ".join(s.name for s in job.skills)
    return f"{job.title}. {job.description} Required skills: {skill_names}"


def _build_candidate_text(profile) -> str:
    skill_names = ", ".join(s.name for s in profile.skills)
    return f"{profile.headline or ''}. {profile.bio or ''} Skills: {skill_names}"


async def rank_candidates(
    req: RankCandidatesRequest,
    token: str,
    candidate_client: CandidateServiceClient,
    job_client: JobServiceClient,
) -> RankCandidatesResponse:
    job = await job_client.get_job(token, req.jobId)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    job_text = _build_job_text(job)

    ok_refs = []
    ok_texts = []
    results: list[CandidateRankResult] = []

    for ref in req.candidates:
        profile = await candidate_client.get_profile(token, ref.candidateId)
        if profile is None:
            logger.warning("Skipping candidate %s: profile unavailable", ref.candidateId)
            results.append(
                CandidateRankResult(
                    candidateId=ref.candidateId,
                    applicationId=ref.applicationId,
                    fitScore=None,
                    status="skipped",
                    reason="candidate not found or candidate-service unavailable",
                )
            )
            continue

        ok_refs.append(ref)
        ok_texts.append(_build_candidate_text(profile))

    if ok_texts:
        job_emb = embed([job_text])
        candidate_emb = embed(ok_texts)
        sim = cosine_sim_matrix(job_emb, candidate_emb)[0]

        for ref, score in zip(ok_refs, sim):
            fit_score = round(max(0.0, min(1.0, float(score))) * 100, 1)
            results.append(
                CandidateRankResult(
                    candidateId=ref.candidateId,
                    applicationId=ref.applicationId,
                    fitScore=fit_score,
                    status="ok",
                )
            )

    results.sort(
        key=lambda r: (r.status != "ok", -(r.fitScore or 0), str(r.candidateId))
    )

    return RankCandidatesResponse(jobId=req.jobId, results=results)
