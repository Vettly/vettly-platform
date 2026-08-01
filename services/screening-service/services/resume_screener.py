from sentence_transformers import SentenceTransformer, util

_model = SentenceTransformer("all-MiniLM-L6-v2")


def _skill_ratio(resume_lower: str, required: list[str], optional: list[str]) -> tuple[float, list[str]]:
    skill_gap = [s for s in required if s.lower() not in resume_lower]
    matched_required = len(required) - len(skill_gap)
    required_ratio = matched_required / len(required) if required else 1.0

    matched_optional = sum(1 for s in optional if s.lower() in resume_lower)
    optional_ratio = matched_optional / len(optional) if optional else 1.0

    # Required skills worth 80%, optional a 20% bonus
    ratio = required_ratio * 0.8 + optional_ratio * 0.2
    return ratio, skill_gap


def score(
    resume_text: str,
    job_description: str,
    required_skills: list[str],
    optional_skills: list[str] = [],
) -> dict:
    resume_emb = _model.encode(resume_text, convert_to_tensor=True)
    job_emb = _model.encode(job_description, convert_to_tensor=True)
    similarity = float(util.cos_sim(resume_emb, job_emb).item())
    ai_score = round(max(0.0, min(100.0, similarity * 100)), 2)

    resume_lower = resume_text.lower()
    skill_ratio, skill_gap = _skill_ratio(resume_lower, required_skills, optional_skills)
    match_score = round(ai_score * 0.7 + skill_ratio * 100 * 0.3, 2)

    return {
        "ai_score": ai_score,
        "match_score": match_score,
        "skill_gap": skill_gap,
    }


def batch_score(resume_text: str, jobs: list[dict]) -> list[dict]:
    """Score a resume against multiple jobs in one model pass."""
    resume_emb = _model.encode(resume_text, convert_to_tensor=True)
    descriptions = [j.get("description", "") for j in jobs]
    job_embs = _model.encode(descriptions, convert_to_tensor=True, batch_size=32)

    resume_lower = resume_text.lower()
    results = []
    for i, job in enumerate(jobs):
        similarity = float(util.cos_sim(resume_emb, job_embs[i]).item())
        ai_score = round(max(0.0, min(100.0, similarity * 100)), 2)
        required: list[str] = job.get("required_skills", [])
        optional: list[str] = job.get("optional_skills", [])
        skill_ratio, _ = _skill_ratio(resume_lower, required, optional)
        match_score = round(ai_score * 0.7 + skill_ratio * 100 * 0.3, 2)
        results.append({
            "jobId":      job["id"],
            "aiScore":    ai_score,
            "matchScore": match_score,
        })
    return results
