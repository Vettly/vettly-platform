import { useState } from "react";
import { Link } from "react-router-dom";
import { useApplications } from "../../api/candidate/candidate.api";
import { useApplicationStage, useJob } from "../../api/job/job.api";
import { PillBadge } from "../../components/PillBadge";
import { PIPELINE_LABELS, PIPELINE_ORDER, PIPELINE_TONES } from "../../utils/tones";
import { formatRelative } from "../../utils/format";
import { ROUTES } from "../../router/routes";
import type { Application, ApplicationStatus } from "../../types/candidate.types";
import type { PipelineStageName } from "../../types/job.types";

function nextStepLabel(stage: PipelineStageName): string {
  if (stage === "rejected") return "Not selected";
  if (stage === "hired") return "Hired";
  const next = PIPELINE_ORDER[PIPELINE_ORDER.indexOf(stage) + 1];
  return PIPELINE_LABELS[next];
}

function chipClasses(active: boolean): string {
  return active
    ? "text-[12.5px] font-semibold text-on-secondary-fixed bg-secondary-fixed-dim px-3.5 py-1.5 rounded-lg transition-colors"
    : "text-[12.5px] font-medium text-on-surface-variant bg-surface-container-high border border-outline-variant px-3.5 py-1.5 rounded-lg hover:bg-surface-container-highest transition-colors";
}

function ApplicationRow({ app }: Readonly<{ app: Application }>) {
  const { data: job } = useJob(app.jobId);
  const { data: pipelineStage } = useApplicationStage(app.jobId, app.id);
  const stage: PipelineStageName = pipelineStage?.stage ?? "applied";
  const tone = PIPELINE_TONES[stage];
  const initial = (job?.companyName ?? job?.title ?? "?").charAt(0).toUpperCase();

  return (
    <Link
      to={ROUTES.CANDIDATE_APPLICATION_DETAIL(app.id)}
      className="bg-surface-container-high border border-outline-variant rounded-xl w-full flex items-center gap-3.5 px-4.5 py-4 text-left hover:bg-surface-container-highest transition-colors"
    >
      <div
        className="w-11 h-11 rounded-[11px] flex items-center justify-center text-base font-bold shrink-0"
        style={{ background: "rgba(244,163,64,.14)", color: "#F4A340" }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold font-headline text-on-surface truncate">
          {job ? job.title : `Job #${app.jobId.slice(0, 8)}…`}
        </div>
        <div className="text-xs font-body text-on-surface-variant mt-0.5 truncate">
          {job?.companyName ?? "—"}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-1.5 text-[12.5px] font-body text-on-surface-variant min-w-47.5">
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
          arrow_forward
        </span>
        {nextStepLabel(stage)}
      </div>
      <span className="font-mono text-[13px] font-semibold text-[#46D39A] w-13.5 text-right shrink-0">
        {app.matchScore == null ? "—" : `${Math.round(app.matchScore)}%`}
      </span>
      <div className="shrink-0">
        <PillBadge tone={tone} label={PIPELINE_LABELS[stage]} />
      </div>
      <span className="font-mono text-xs text-on-surface-variant w-10 text-right shrink-0 hidden sm:inline">
        {formatRelative(app.updatedAt)}
      </span>
      <span className="material-symbols-outlined text-on-surface-variant shrink-0" style={{ fontSize: "20px" }}>
        chevron_right
      </span>
    </Link>
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
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "closed", label: "Closed" },
  ];

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4">
      {/* Filter chips */}
      <div className="flex items-center gap-2.5">
        {tabs.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setTab(key)} className={chipClasses(tab === key)}>
            {label}
          </button>
        ))}
        <span className="ml-auto text-[12.5px] font-body text-on-surface-variant">
          {sorted.length} application{sorted.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Applications list */}
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-xl h-18" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "48px" }}>
            work_off
          </span>
          <p className="text-base font-semibold font-headline text-on-surface">
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
        <div className="flex flex-col gap-2.5">
          {sorted.map((app) => (
            <ApplicationRow key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
}
