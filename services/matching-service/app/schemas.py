from uuid import UUID

from pydantic import BaseModel, Field


class CandidateRef(BaseModel):
    candidateId: UUID
    applicationId: UUID | None = None


class RankCandidatesRequest(BaseModel):
    jobId: UUID
    candidates: list[CandidateRef] = Field(min_length=1)


class CandidateRankResult(BaseModel):
    candidateId: UUID
    applicationId: UUID | None = None
    fitScore: float | None = None
    status: str
    reason: str | None = None


class RankCandidatesResponse(BaseModel):
    jobId: UUID
    results: list[CandidateRankResult]


class SkillGapRequest(BaseModel):
    jobId: UUID
    candidateId: UUID


class SkillGapItem(BaseModel):
    skillName: str
    isRequired: bool
    matchedCandidateSkill: str | None = None
    similarity: float | None = None


class SkillGapResponse(BaseModel):
    jobId: UUID
    candidateId: UUID
    matchedSkills: list[SkillGapItem]
    missingSkills: list[SkillGapItem]
    matchPercentage: float
