import re
from datetime import datetime
import gender_guesser.detector as gender


_detector = gender.Detector()


def detect(candidate_name: str, resume_text: str) -> tuple[bool, list[str]]:
    flags: list[str] = []

    first_name = candidate_name.strip().split()[0] if candidate_name.strip() else ""
    if first_name:
        result = _detector.get_gender(first_name.capitalize())
        if result not in ("unknown", "andy"):
            flags.append("gender_signal")

    years = re.findall(r"\b(19|20)\d{2}\b", resume_text)
    cutoff = datetime.utcnow().year - 40
    if any(int(y) < cutoff for y in years):
        flags.append("age_signal")

    return (len(flags) > 0, flags)
