import logging
from uuid import UUID

import httpx

from .dtos import JobDto

logger = logging.getLogger(__name__)


class JobServiceClient:
    def __init__(self, base_url: str):
        self._client = httpx.AsyncClient(base_url=base_url, timeout=10.0)

    async def get_job(self, token: str, job_id: UUID) -> JobDto | None:
        try:
            resp = await self._client.get(
                f"/api/jobs/{job_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
        except httpx.RequestError:
            logger.warning("job-service unreachable for job %s", job_id)
            return None

        if resp.status_code != 200:
            logger.warning("job-service returned %s for job %s", resp.status_code, job_id)
            return None

        return JobDto.model_validate(resp.json())

    async def aclose(self) -> None:
        await self._client.aclose()
