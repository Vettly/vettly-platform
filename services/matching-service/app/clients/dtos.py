from uuid import UUID

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class UpstreamModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class SkillDto(UpstreamModel):
    name: str


class JobSkillDto(UpstreamModel):
    name: str
    is_required: bool = False


class ProfileDto(UpstreamModel):
    id: UUID
    headline: str | None = None
    bio: str | None = None
    skills: list[SkillDto] = []


class JobDto(UpstreamModel):
    id: UUID
    title: str
    description: str
    skills: list[JobSkillDto] = []
