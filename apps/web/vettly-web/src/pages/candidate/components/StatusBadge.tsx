import type { ApplicationStatus } from "../../../types/candidate.types";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_TONES } from "../../../utils/tones";
import { PillBadge } from "../../../components/PillBadge";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: Readonly<StatusBadgeProps>) {
  const tone = APPLICATION_STATUS_TONES[status];
  const label = APPLICATION_STATUS_LABELS[status] ?? status;

  if (!tone) {
    return <PillBadge tone={{ color: "var(--color-on-surface-variant)", bg: "var(--color-surface-container-high)" }} label={label} />;
  }

  return <PillBadge tone={tone} label={label} />;
}
