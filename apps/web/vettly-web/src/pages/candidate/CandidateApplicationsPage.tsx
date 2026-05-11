import { useState } from "react";
import { useApplications } from "../../api/candidate/candidate.api";
import { useJob } from "../../api/job/job.api";
import { StatusBadge } from "./components/StatusBadge";
import { formatDate } from "../../utils/format";
import type { Application, ApplicationStatus } from "../../types/candidate.types";

function JobTitle({ jobId }: Readonly<{ jobId: string }>) {
  const { data: job } = useJob(jobId);
  return (
    <div>
      <p className="font-bold font-body text-on-surface">
        {job ? job.title : `Job #${jobId.slice(0, 8)}…`}
      </p>
      {job?.companyName && (
        <p className="text-xs font-body text-on-surface-variant">{job.companyName}</p>
      )}
    </div>
  );
}

type FilterTab = "all" | "active" | "closed";

const ACTIVE_STATUSES: ApplicationStatus[] = ["applied", "reviewing", "interview"];
const CLOSED_STATUSES: ApplicationStatus[] = ["rejected", "accepted"];

function filterApplications(apps: Application[], tab: FilterTab): Application[] {
  if (tab === "active") return apps.filter((a) => ACTIVE_STATUSES.includes(a.status));
  if (tab === "closed") return apps.filter((a) => CLOSED_STATUSES.includes(a.status));
  return apps;
}

export default function CandidateApplicationsPage() {
  const [tab, setTab] = useState<FilterTab>("all");
  const { data: applications, isLoading } = useApplications();

  const all = applications ?? [];
  const filtered = filterApplications(all, tab);
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  );

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: all.length },
    {
      key: "active",
      label: "Active",
      count: all.filter((a) => ACTIVE_STATUSES.includes(a.status)).length,
    },
    {
      key: "closed",
      label: "Closed",
      count: all.filter((a) => CLOSED_STATUSES.includes(a.status)).length,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold font-headline text-on-surface">
          My Applications
        </h1>
        <p className="text-on-surface-variant font-body text-sm mt-1">
          Track and manage all your job applications.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 mb-6 w-fit">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold font-label transition-colors
              ${
                tab === key
                  ? "bg-surface-container text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }
            `}
          >
            {label}
            <span
              className={`
                text-xs px-1.5 py-0.5 rounded-full font-label
                ${tab === key ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"}
              `}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Applications list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface-container-high animate-pulse rounded-2xl h-24"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <span
            className="material-symbols-outlined text-on-surface-variant"
            style={{ fontSize: "64px" }}
          >
            work_off
          </span>
          <p className="text-xl font-bold font-headline text-on-surface">
            No applications
            {tab !== "all" ? ` in "${tab}"` : " yet"}
          </p>
          <p className="text-on-surface-variant font-body text-sm">
            {tab === "all"
              ? "Start applying to jobs to see them here."
              : "Try switching to a different tab."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((app) => (
            <div
              key={app.id}
              className="bg-surface-container rounded-2xl border border-outline-variant p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Job icon */}
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-on-surface-variant"
                  style={{ fontSize: "22px" }}
                >
                  work
                </span>
              </div>

              {/* Job info */}
              <div className="flex-1 min-w-0">
                <JobTitle jobId={app.jobId} />
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-on-surface-variant font-body">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px" }}
                    >
                      calendar_today
                    </span>
                    Applied {formatDate(app.appliedAt)}
                  </span>
                  {app.matchScore != null && (
                    <span className="flex items-center gap-1 text-xs font-bold font-label text-secondary">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "14px" }}
                      >
                        psychology
                      </span>
                      AI Match {Math.round(app.matchScore)}%
                    </span>
                  )}
                  {app.biasFlagged && (
                    <span className="flex items-center gap-1 text-xs font-label text-error">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "14px" }}
                      >
                        flag
                      </span>
                      Bias flagged
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="shrink-0">
                <StatusBadge status={app.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
