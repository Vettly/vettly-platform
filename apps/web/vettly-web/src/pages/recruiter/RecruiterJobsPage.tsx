import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDeleteJob, useMyJobs, useUpdateJobStatus } from "../../api/job/job.api";
import { useMyOrganization } from "../../api/organization/organization.api";
import { JobFormModal } from "./components/JobFormModal";
import { EmptyState } from "../../components/EmptyState";
import { PillBadge } from "../../components/PillBadge";
import { JOB_STATUS_LABELS, JOB_STATUS_TONES } from "../../utils/tones";
import { formatRelative } from "../../utils/format";
import { ROUTES } from "../../router/routes";
import type { JobStatus, JobSummary } from "../../types/job.types";

const NEXT_STATUS: Record<string, { label: string; status: string; icon: string } | undefined> = {
  draft: { label: "Publish", status: "open", icon: "publish" },
  open: { label: "Close", status: "closed", icon: "block" },
  closed: { label: "Reopen", status: "open", icon: "publish" },
  archived: undefined,
};

const FILTERS: { label: string; value: JobStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Draft", value: "draft" },
  { label: "Closed", value: "closed" },
  { label: "Archived", value: "archived" },
];

const TABLE_COLUMNS = "1.8fr 1.2fr 90px 100px 80px 140px";

function chipClasses(active: boolean): string {
  return active
    ? "text-[12.5px] font-semibold text-on-secondary-fixed bg-secondary-fixed-dim px-3.5 py-1.5 rounded-lg transition-colors"
    : "text-[12.5px] font-medium text-on-surface-variant bg-surface-container-high border border-outline-variant px-3.5 py-1.5 rounded-lg hover:bg-surface-container-highest transition-colors";
}

function JobRow({
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
  const tone = JOB_STATUS_TONES[job.status as JobStatus];
  const nextStatus = NEXT_STATUS[job.status];

  return (
    <div
      className="grid items-center gap-2 px-5 h-[62px] border-b border-outline-variant/60 last:border-b-0 hover:bg-surface-container-highest transition-colors"
      style={{ gridTemplateColumns: TABLE_COLUMNS }}
    >
      <Link to={ROUTES.RECRUITER_JOB_PIPELINE(job.id)} className="min-w-0 pr-2">
        <p className="text-[13.5px] font-medium font-body text-on-surface truncate hover:underline">
          {job.title}
        </p>
        <p className="text-[11.5px] font-body text-on-surface-variant truncate capitalize">
          {job.jobType.replace("-", " ")}
          {job.workArrangement ? ` · ${job.workArrangement}` : ""}
        </p>
      </Link>
      <span className="text-[12.5px] font-body text-on-surface-variant truncate pr-2">
        {job.location ?? "—"}
      </span>
      <span className="font-mono text-[12.5px] font-semibold text-on-surface">
        {job.applicantCount}
      </span>
      <div>
        {tone && <PillBadge tone={tone} label={JOB_STATUS_LABELS[job.status as JobStatus] ?? job.status} />}
      </div>
      <span className="font-mono text-xs text-on-surface-variant">
        {formatRelative(job.createdAt)}
      </span>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => onEdit(job)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
          title="Edit"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>edit</span>
        </button>
        {nextStatus && (
          <button
            type="button"
            onClick={() => onChangeStatus(job.id, nextStatus.status)}
            disabled={isUpdatingStatus}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors disabled:opacity-50"
            title={nextStatus.label}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>{nextStatus.icon}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(job.id)}
          disabled={isDeleting}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors disabled:opacity-50"
          title="Delete"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>delete</span>
        </button>
        <Link
          to={ROUTES.RECRUITER_JOB_PIPELINE(job.id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
          title="View pipeline"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_right</span>
        </Link>
      </div>
    </div>
  );
}

export default function RecruiterJobsPage() {
  const { data: jobs, isLoading } = useMyJobs();
  const { data: organization, isLoading: isOrgLoading } = useMyOrganization();
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();
  const location = useLocation();
  const navigate = useNavigate();

  const hasOrganization = !isOrgLoading && !!organization;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobSummary | null>(null);
  const [filter, setFilter] = useState<JobStatus | "all">("all");

  useEffect(() => {
    const state = location.state as { openCreateModal?: boolean } | null;
    if (state?.openCreateModal && hasOrganization) {
      setEditingJob(null);
      setModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, hasOrganization, navigate]);

  const sorted = [...(jobs ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const filtered = filter === "all" ? sorted : sorted.filter((j) => j.status === filter);

  const openCreateModal = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const openEditModal = (job: JobSummary) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingJob(null);
  };

  const handleChangeStatus = (id: string, status: string) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success("Job status updated"),
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this job? This cannot be undone.")) return;
    deleteJob.mutate(id, {
      onSuccess: () => toast.success("Job deleted"),
      onError: () => toast.error("Failed to delete job"),
    });
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[23px] font-semibold font-headline text-on-surface tracking-tight">
            Jobs
          </h1>
          <p className="text-on-surface-variant font-body text-sm mt-1">
            Create, publish, and manage your job postings.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={!hasOrganization}
          title={hasOrganization ? undefined : "Set up an organization before posting jobs"}
          className="flex items-center justify-center gap-2 h-[46px] px-4 rounded-[10px] bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[13.5px] hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50 disabled:hover:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
          Post a Job
        </button>
      </div>

      {/* Organization required notice */}
      {!isOrgLoading && !organization && (
        <div className="flex items-center gap-3 bg-surface-container-high border border-outline-variant rounded-xl px-4 py-3 text-sm font-body">
          <span className="material-symbols-outlined shrink-0 text-secondary-fixed-dim" style={{ fontSize: "20px" }}>
            info
          </span>
          <p className="flex-1 text-on-surface-variant">
            You need to set up an organization before you can post jobs.
          </p>
          <Link
            to={ROUTES.RECRUITER_ORGANIZATION}
            className="font-bold font-label text-xs text-secondary-fixed-dim hover:underline shrink-0"
          >
            Set up now
          </Link>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex items-center gap-2.5">
        {FILTERS.map((f) => (
          <button key={f.value} type="button" onClick={() => setFilter(f.value)} className={chipClasses(filter === f.value)}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-[12.5px] font-body text-on-surface-variant">
          {filtered.length} job{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Jobs table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-xl h-[62px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="work_off"
          title="No jobs found"
          description={
            hasOrganization
              ? "Post your first job to start building your candidate pipeline."
              : "Set up your organization, then post your first job."
          }
        />
      ) : (
        <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div
                className="grid items-center px-5 py-2.5 text-[10.5px] tracking-wide uppercase text-on-surface-variant/60 border-b border-outline-variant/60"
                style={{ gridTemplateColumns: TABLE_COLUMNS }}
              >
                <span>Role</span>
                <span>Location</span>
                <span>Applicants</span>
                <span>Status</span>
                <span>Posted</span>
                <span className="text-right">Actions</span>
              </div>
              {filtered.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  onEdit={openEditModal}
                  onChangeStatus={handleChangeStatus}
                  onDelete={handleDelete}
                  isUpdatingStatus={updateStatus.isPending}
                  isDeleting={deleteJob.isPending}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {modalOpen && <JobFormModal job={editingJob} onClose={closeModal} />}
    </div>
  );
}
