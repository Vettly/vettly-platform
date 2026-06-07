import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDeleteJob, useMyJobs, useUpdateJobStatus } from "../../api/job/job.api";
import { useMyOrganization } from "../../api/organization/organization.api";
import { JobCard } from "./components/JobCard";
import { JobFormModal } from "./components/JobFormModal";
import { EmptyState } from "../../components/EmptyState";
import { ROUTES } from "../../router/routes";
import type { JobSummary } from "../../types/job.types";

export default function RecruiterJobsPage() {
  const { data: jobs, isLoading } = useMyJobs();
  const { data: organization, isLoading: isOrgLoading } = useMyOrganization();
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();

  const hasOrganization = !isOrgLoading && !!organization;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobSummary | null>(null);

  const sorted = [...(jobs ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface">
            My Jobs
          </h1>
          <p className="text-on-surface-variant font-body text-sm mt-1">
            Create, publish, and manage your job postings.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={!hasOrganization}
          title={hasOrganization ? undefined : "Set up an organization before posting jobs"}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-bold font-body text-sm shrink-0 disabled:opacity-50 disabled:hover:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
          Post a Job
        </button>
      </div>

      {/* Organization required notice */}
      {!isOrgLoading && !organization && (
        <div className="mb-6 flex items-center gap-3 bg-secondary-container text-on-secondary-container rounded-xl px-4 py-3 text-sm font-body">
          <span className="material-symbols-outlined shrink-0" style={{ fontSize: "20px" }}>
            info
          </span>
          <p className="flex-1">
            You need to set up an organization before you can post jobs.
          </p>
          <Link
            to={ROUTES.RECRUITER_ORGANIZATION}
            className="font-bold font-label text-xs hover:underline shrink-0"
          >
            Set up now
          </Link>
        </div>
      )}

      {/* Jobs list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-2xl h-32" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon="work_off"
          title="No jobs yet"
          description={
            hasOrganization
              ? "Post your first job to start building your candidate pipeline."
              : "Set up your organization, then post your first job."
          }
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((job) => (
            <JobCard
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
      )}

      {modalOpen && <JobFormModal job={editingJob} onClose={closeModal} />}
    </div>
  );
}
