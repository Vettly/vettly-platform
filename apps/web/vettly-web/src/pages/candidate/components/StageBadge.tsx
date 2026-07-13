import type { PipelineStageName } from "../../../types/job.types";
import { PIPELINE_LABELS, PIPELINE_TONES } from "../../../utils/tones";
import { PillBadge } from "../../../components/PillBadge";

interface StageBadgeProps {
  stage: PipelineStageName;
}

export function StageBadge({ stage }: Readonly<StageBadgeProps>) {
  const tone = PIPELINE_TONES[stage];
  const label = PIPELINE_LABELS[stage] ?? stage;

  if (!tone) {
    return <PillBadge tone={{ color: "var(--color-on-surface-variant)", bg: "var(--color-surface-container-high)" }} label={label} />;
  }

  return <PillBadge tone={tone} label={label} />;
}
