import type { ApplicationStatus } from "../../../types/candidate.types";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  applied: {
    label: "Applied",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  reviewing: {
    label: "Reviewing",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  interview: {
    label: "Interview",
    className: "bg-secondary-container text-on-secondary-container",
  },
  rejected: {
    label: "Rejected",
    className: "bg-error-container text-on-error-container",
  },
  accepted: {
    label: "Accepted",
    className: "bg-secondary text-on-secondary",
  },
};

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
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
