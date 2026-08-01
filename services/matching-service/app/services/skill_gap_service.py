import logging

from fastapi import HTTPException, status

from ..clients.candidate_client import CandidateServiceClient
from ..clients.job_client import JobServiceClient
from ..config import settings
from ..embedding import cosine_sim_matrix, embed
from ..schemas import SkillGapItem, SkillGapRequest, SkillGapResponse

logger = logging.getLogger(__name__)


async def compute_skill_gap(
    req: SkillGapRequest,
    token: str,
    candidate_client: CandidateServiceClient,
    job_client: JobServiceClient,
) -> SkillGapResponse:
    job = await job_client.get_job(token, req.jobId)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    profile = await candidate_client.get_profile(token, req.candidateId)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    job_skills = job.skills
    candidate_skills = profile.skills

    if not job_skills:
        return SkillGapResponse(
            jobId=req.jobId,
            candidateId=req.candidateId,
            matchedSkills=[],
            missingSkills=[],
            matchPercentage=100.0,
        )

    if not candidate_skills:
        missing = [
            SkillGapItem(skillName=s.name, isRequired=s.is_required) for s in job_skills
        ]
        return SkillGapResponse(
            jobId=req.jobId,
            candidateId=req.candidateId,
            matchedSkills=[],
            missingSkills=missing,
            matchPercentage=0.0,
        )

    job_skill_names = [s.name for s in job_skills]
    candidate_skill_names = [s.name for s in candidate_skills]

    job_emb = embed(job_skill_names)
    candidate_emb = embed(candidate_skill_names)
    sim = cosine_sim_matrix(job_emb, candidate_emb)

    matched: list[SkillGapItem] = []
    missing: list[SkillGapItem] = []

    for i, job_skill in enumerate(job_skills):
        row = sim[i]
        best_idx = int(row.argmax())
        best_sim = float(row[best_idx])

        if best_sim >= settings.skill_match_threshold:
            matched.append(
                SkillGapItem(
                    skillName=job_skill.name,
                    isRequired=job_skill.is_required,
                    matchedCandidateSkill=candidate_skill_names[best_idx],
                    similarity=round(best_sim, 4),
                )
            )
        else:
            missing.append(
                SkillGapItem(skillName=job_skill.name, isRequired=job_skill.is_required)
            )

    match_percentage = round(len(matched) / len(job_skills) * 100, 1)

    return SkillGapResponse(
        jobId=req.jobId,
        candidateId=req.candidateId,
        matchedSkills=matched,
        missingSkills=missing,
        matchPercentage=match_percentage,
    )
