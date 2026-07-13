import logging
from uuid import UUID

import httpx

from .dtos import ProfileDto

logger = logging.getLogger(__name__)


class CandidateServiceClient:
    def __init__(self, base_url: str):
        self._client = httpx.AsyncClient(base_url=base_url, timeout=10.0)

    async def get_profile(self, token: str, candidate_id: UUID) -> ProfileDto | None:
        try:
            resp = await self._client.get(
                f"/api/candidates/{candidate_id}/profile",
                headers={"Authorization": f"Bearer {token}"},
            )
        except httpx.RequestError:
            logger.warning("candidate-service unreachable for candidate %s", candidate_id)
            return None

        if resp.status_code != 200:
            logger.warning(
                "candidate-service returned %s for candidate %s", resp.status_code, candidate_id
            )
            return None

        return ProfileDto.model_validate(resp.json())

    async def aclose(self) -> None:
        await self._client.aclose()
