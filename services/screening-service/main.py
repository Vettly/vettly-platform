import asyncio
import logging
import os

import httpx
from fastapi import BackgroundTasks, FastAPI

from models.schemas import BatchPreviewRequest, JobPreviewInfo, ScreenResumeRequest, ScreeningResult
from services import bias_detector, pdf_extractor, resume_screener, r2_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Vettly Screening Service")

JOB_SERVICE_URL = os.environ.get("SCREENING_JOB_SERVICE_URL", "http://localhost:5052")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/screen-resume", status_code=202)
async def screen_resume(req: ScreenResumeRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(_run_screening, req)
    return {"message": "screening started", "application_id": req.application_id}


def _run_screening(req: ScreenResumeRequest) -> None:
    try:
        job = _fetch_job(req.job_id)
        if job is None:
            logger.error("Job %s not found — skipping screening for application %s",
                         req.job_id, req.application_id)
            return

        job_description: str = job.get("description", "")
        required_skills: list[str] = [
            s["name"] for s in job.get("skills", []) if s.get("isRequired")
        ]
        optional_skills: list[str] = [
            s["name"] for s in job.get("skills", []) if not s.get("isRequired")
        ]

        pdf_bytes = r2_client.download_pdf(req.resume_s3_key)
        resume_text = pdf_extractor.extract_text(pdf_bytes)

        scores = resume_screener.score(resume_text, job_description, required_skills, optional_skills)
        bias_flagged, bias_flags = bias_detector.detect(req.candidate_name, resume_text)

        result = ScreeningResult(
            ai_score=scores["ai_score"],
            match_score=scores["match_score"],
            skill_gap=scores["skill_gap"],
            bias_flagged=bias_flagged,
            bias_flags=bias_flags,
        )

        response = httpx.patch(req.callback_url, json={
            "aiScore":     result.ai_score,
            "matchScore":  result.match_score,
            "skillGap":    result.skill_gap,
            "biasFlagged": result.bias_flagged,
            "biasFlags":   result.bias_flags,
        }, timeout=10)
        response.raise_for_status()
        logger.info("Screening complete for application %s — score %.1f",
                    req.application_id, result.ai_score)

    except Exception:
        logger.exception("Screening failed for application %s", req.application_id)


@app.post("/batch-preview")
async def batch_preview(req: BatchPreviewRequest):
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(None, _run_batch_preview, req)
    return results


def _run_batch_preview(req: BatchPreviewRequest) -> list[dict]:
    try:
        pdf_bytes = r2_client.download_pdf(req.resume_s3_key)
        resume_text = pdf_extractor.extract_text(pdf_bytes)
    except Exception:
        logger.exception("Failed to download/extract resume for batch preview")
        return []

    jobs_dicts = [j.model_dump() for j in req.jobs]
    results = resume_screener.batch_score(resume_text, jobs_dicts)
    logger.info("Batch preview complete: %d jobs scored", len(results))
    return results


def _fetch_job(job_id: str) -> dict | None:
    try:
        response = httpx.get(f"{JOB_SERVICE_URL}/api/jobs/{job_id}", timeout=10)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception:
        logger.exception("Failed to fetch job %s", job_id)
        return None
