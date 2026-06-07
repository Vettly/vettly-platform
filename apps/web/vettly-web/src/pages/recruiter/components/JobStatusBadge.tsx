import type { JobStatus } from "../../../types/job.types";

const STATUS_CONFIG: Record<JobStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-surface-container-high text-on-surface-variant",
  },
  open: {
    label: "Open",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  closed: {
    label: "Closed",
    className: "bg-error-container text-on-error-container",
  },
  archived: {
    label: "Archived",
    className: "bg-secondary-container text-on-secondary-container",
  },
};

export function JobStatusBadge({ status }: Readonly<{ status: string }>) {
  const config = STATUS_CONFIG[status as JobStatus] ?? {
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
