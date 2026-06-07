import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useMyJobs } from "../../api/job/job.api";
import { useMyOrganization } from "../../api/organization/organization.api";
import { StatCard } from "../../components/StatCard";
import { SectionCard } from "../../components/SectionCard";
import { EmptyState } from "../../components/EmptyState";
import { JobStatusBadge } from "./components/JobStatusBadge";
import { ROUTES } from "../../router/routes";

export default function RecruiterHomePage() {
  const { user } = useAuthStore();
  const jobsQuery = useMyJobs();
  const orgQuery = useMyOrganization();

  const isLoading = jobsQuery.isLoading || orgQuery.isLoading;
  const jobs = jobsQuery.data ?? [];
  const organization = orgQuery.data;

  const activeJobs = jobs.filter((j) => j.status === "open");
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0);

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome banner */}
      <div className="editorial-gradient rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        <p className="text-xs font-bold font-label tracking-widest uppercase text-white/60 mb-2">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-2xl lg:text-3xl font-extrabold font-headline text-white">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-white/70 mt-1 font-body text-sm">
          Here's an overview of your hiring activity.
        </p>
      </div>

      {/* Stats row */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-2xl h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon="work_outline" label="Active Jobs" value={activeJobs.length} />
          <StatCard icon="group" label="Total Applicants" value={totalApplicants} />
          <StatCard
            icon="apartment"
            label="Organization"
            value={organization?.name ?? "Not set up"}
            sub={organization ? organization.industry ?? undefined : "Set one up to post jobs"}
          />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Recent Jobs"
          icon="work"
          action={
            <Link
              to={ROUTES.RECRUITER_JOBS}
              className="text-xs font-bold font-label text-secondary hover:underline"
            >
              View all
            </Link>
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface-container-high animate-pulse rounded-xl h-14" />
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <EmptyState
              icon="work_off"
              title="No jobs yet"
              description="Post your first job to start hiring."
            />
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={ROUTES.RECRUITER_JOB_PIPELINE(job.id)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold font-body text-on-surface truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-on-surface-variant font-body">
                      {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Quick actions / org status */}
        <div className="space-y-6">
          {!isLoading && !organization && (
            <div className="bg-surface-container rounded-2xl border border-outline-variant p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "26px" }}>
                  apartment
                </span>
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface">Set up your organization</p>
                <p className="text-sm font-body text-on-surface-variant mt-1">
                  You'll need an organization before you can post jobs.
                </p>
              </div>
              <Link
                to={ROUTES.RECRUITER_ORGANIZATION}
                className="text-xs font-bold font-label text-secondary hover:underline"
              >
                Get started
              </Link>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              to={ROUTES.RECRUITER_JOBS}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-3 rounded-xl hover:opacity-90 transition-opacity font-bold font-body text-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
              Post a Job
            </Link>
            <Link
              to={ROUTES.RECRUITER_ORGANIZATION}
              className="flex-1 flex items-center justify-center gap-2 border border-outline-variant text-on-surface px-4 py-3 rounded-xl hover:bg-surface-container transition-colors font-bold font-body text-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>apartment</span>
              Organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
