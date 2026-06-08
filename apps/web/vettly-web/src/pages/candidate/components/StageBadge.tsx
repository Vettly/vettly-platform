import type { PipelineStageName } from "../../../types/job.types";

const STAGE_CONFIG: Record<PipelineStageName, { label: string; className: string }> = {
  applied: {
    label: "Applied",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  screening: {
    label: "Screening",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  matched: {
    label: "Matched",
    className: "bg-secondary-container text-on-secondary-container",
  },
  interview: {
    label: "Interview",
    className: "bg-secondary-container text-on-secondary-container",
  },
  offer: {
    label: "Offer",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  hired: {
    label: "Hired",
    className: "bg-secondary text-on-secondary",
  },
  rejected: {
    label: "Rejected",
    className: "bg-error-container text-on-error-container",
  },
};

interface StageBadgeProps {
  stage: PipelineStageName;
}

export function StageBadge({ stage }: StageBadgeProps) {
  const config = STAGE_CONFIG[stage] ?? {
    label: stage,
    className: "bg-surface-container-high text-on-surface-variant",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-label ${config.className}`}
    >
      {config.label}
    </span>
  );
}
