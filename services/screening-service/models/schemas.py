from pydantic import BaseModel


class ScreenResumeRequest(BaseModel):
    application_id: str
    resume_s3_key: str
    job_id: str
    candidate_name: str
    callback_url: str


class ScreeningResult(BaseModel):
    ai_score: float
    match_score: float
    skill_gap: list[str]
    bias_flagged: bool
    bias_flags: list[str]


class JobPreviewInfo(BaseModel):
    id: str
    description: str
    required_skills: list[str] = []
    optional_skills: list[str] = []


class BatchPreviewRequest(BaseModel):
    resume_s3_key: str
    jobs: list[JobPreviewInfo]
