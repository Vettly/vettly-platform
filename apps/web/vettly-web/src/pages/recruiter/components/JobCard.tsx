import { Link } from "react-router-dom";
import { JobStatusBadge } from "./JobStatusBadge";
import { formatDate, formatSalary } from "../../../utils/format";
import { ROUTES } from "../../../router/routes";
import type { JobSummary } from "../../../types/job.types";

const NEXT_STATUS: Record<string, { label: string; status: string } | undefined> = {
  draft: { label: "Publish", status: "open" },
  open: { label: "Close", status: "closed" },
  closed: { label: "Reopen", status: "open" },
  archived: undefined,
};

export function JobCard({
  job,
  onEdit,
  onChangeStatus,
  onDelete,
  isUpdatingStatus,
  isDeleting,
}: Readonly<{
  job: JobSummary;
  onEdit: (job: JobSummary) => void;
  onChangeStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
}>) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const nextStatus = NEXT_STATUS[job.status];

  return (
    <div className="bg-surface-container rounded-2xl border border-outline-variant p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-headline font-bold text-on-surface text-base leading-snug">
              {job.title}
            </h3>
            <JobStatusBadge status={job.status} />
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {job.location && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant font-body">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  location_on
                </span>
                {job.location}
              </span>
            )}
            {salary && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant font-body">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  payments
                </span>
                {salary}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs font-bold font-label text-secondary">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                group
              </span>
              {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
            </span>
            {job.workArrangement && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant font-body capitalize">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  home_work
                </span>
                {job.workArrangement}
              </span>
            )}
            {job.applicationDeadline && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant font-body">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                  event
                </span>
                Closes {formatDate(job.applicationDeadline)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-outline-variant">
        <Link
          to={ROUTES.RECRUITER_JOB_PIPELINE(job.id)}
          className="flex items-center gap-1.5 text-xs font-bold font-label text-secondary hover:underline px-1"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            view_kanban
          </span>
          Pipeline
        </Link>
        <button
          onClick={() => onEdit(job)}
          className="flex items-center gap-1.5 text-xs font-bold font-label text-on-surface-variant hover:text-on-surface px-1"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            edit
          </span>
          Edit
        </button>
        {nextStatus && (
          <button
            onClick={() => onChangeStatus(job.id, nextStatus.status)}
            disabled={isUpdatingStatus}
            className="flex items-center gap-1.5 text-xs font-bold font-label text-on-surface-variant hover:text-on-surface px-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              {nextStatus.status === "open" ? "publish" : "block"}
            </span>
            {nextStatus.label}
          </button>
        )}
        <button
          onClick={() => onDelete(job.id)}
          disabled={isDeleting}
          className="flex items-center gap-1.5 text-xs font-bold font-label text-error hover:underline px-1 disabled:opacity-50 ml-auto"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            delete
          </span>
          Delete
        </button>
      </div>
    </div>
  );
}
