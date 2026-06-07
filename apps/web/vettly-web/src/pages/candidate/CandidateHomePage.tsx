import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useApplications, useProfile } from "../../api/candidate/candidate.api";
import { useJob } from "../../api/job/job.api";
import { StatusBadge } from "./components/StatusBadge";
import { StatCard } from "../../components/StatCard";
import { computeCompleteness } from "./utils";
import { formatDate } from "../../utils/format";
import { ROUTES } from "../../router/routes";
import type { ApplicationStatus } from "../../types/candidate.types";

function JobTitle({ jobId }: Readonly<{ jobId: string }>) {
  const { data: job } = useJob(jobId);
  return (
    <div className="min-w-0">
      <p className="text-sm font-bold font-body text-on-surface truncate">
        {job ? job.title : `Job #${jobId.slice(0, 8)}…`}
      </p>
      {job?.companyName && (
        <p className="text-xs font-body text-on-surface-variant truncate">{job.companyName}</p>
      )}
    </div>
  );
}

export default function CandidateHomePage() {
  const { user } = useAuthStore();
  const profileQuery = useProfile();
  const applicationsQuery = useApplications();

  const isLoading = profileQuery.isLoading || applicationsQuery.isLoading;

  const profile = profileQuery.data;
  const applications = applicationsQuery.data ?? [];

  const activeApplications = applications.filter(
    (a) => !["rejected", "accepted"].includes(a.status as string)
  );

  const { pct, checks } = computeCompleteness(profile);

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const completenessItems = [
    { key: "headline", label: "Add a headline" },
    { key: "bio", label: "Write your bio" },
    { key: "experience", label: "Add work experience" },
    { key: "education", label: "Add education" },
    { key: "skills", label: "Add skills" },
    { key: "resume", label: "Upload a resume" },
  ];

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
          Here's what's happening with your job search today.
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
          <StatCard
            icon="work_history"
            label="Active Applications"
            value={activeApplications.length}
          />
          <StatCard
            icon="visibility"
            label="Profile Views"
            value="—"
            sub="Coming soon"
          />
          <StatCard
            icon="person_check"
            label="Profile Complete"
            value={`${pct}%`}
            sub={pct < 100 ? `${6 - Object.values(checks).filter(Boolean).length} items remaining` : "All done!"}
          />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-surface-container rounded-2xl border border-outline-variant">
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: "20px" }}>
                work
              </span>
              <h2 className="font-headline font-bold text-on-surface">Recent Applications</h2>
            </div>
            <Link
              to={ROUTES.CANDIDATE_APPLICATIONS}
              className="text-xs font-bold font-label text-secondary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface-container-high animate-pulse rounded-xl h-14" />
                ))}
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "40px" }}>
                  work_off
                </span>
                <p className="text-sm font-body text-on-surface-variant">No applications yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container-low"
                  >
                    <div className="min-w-0 flex-1">
                      <JobTitle jobId={app.jobId} />
                      <p className="text-xs text-on-surface-variant font-body">
                        {formatDate(app.appliedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {app.matchScore != null && (
                        <span className="text-xs font-bold font-label text-secondary">
                          {Math.round(app.matchScore)}%
                        </span>
                      )}
                      <StatusBadge status={app.status as ApplicationStatus} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: completeness + quick actions */}
        <div className="space-y-6">
          {/* Profile completeness */}
          {isLoading ? (
            <div className="bg-surface-container rounded-2xl border border-outline-variant p-6 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface-container-high animate-pulse rounded-lg h-8" />
              ))}
            </div>
          ) : pct < 100 ? (
            <div className="bg-surface-container rounded-2xl border border-outline-variant">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-outline-variant">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: "20px" }}>
                  tune
                </span>
                <h2 className="font-headline font-bold text-on-surface">Profile Completeness</h2>
              </div>
              <div className="px-6 pb-2 pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold font-label text-secondary shrink-0">{pct}%</span>
                </div>
                <div className="divide-y divide-outline-variant">
                  {completenessItems.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3 py-2.5">
                      <span
                        className={`material-symbols-outlined shrink-0 ${checks[key] ? "text-secondary" : "text-on-surface-variant"}`}
                        style={{ fontSize: "18px" }}
                      >
                        {checks[key] ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span className={`font-body text-sm flex-1 ${checks[key] ? "text-on-surface line-through opacity-60" : "text-on-surface"}`}>
                        {label}
                      </span>
                      {!checks[key] && (
                        <Link
                          to={ROUTES.CANDIDATE_PROFILE}
                          className="text-xs font-bold font-label text-secondary hover:underline shrink-0"
                        >
                          Add
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container rounded-2xl border border-outline-variant p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "26px" }}>
                  verified
                </span>
              </div>
              <div>
                <p className="font-headline font-bold text-on-surface">Profile Complete!</p>
                <p className="text-sm font-body text-on-surface-variant mt-1">
                  Your profile is fully set up. Keep it up to date to attract the best opportunities.
                </p>
              </div>
              <Link
                to={ROUTES.CANDIDATE_PROFILE}
                className="text-xs font-bold font-label text-secondary hover:underline"
              >
                Review profile
              </Link>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-3">
            <Link
              to={ROUTES.CANDIDATE_PROFILE}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-3 rounded-xl hover:opacity-90 transition-opacity font-bold font-body text-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
              Edit Profile
            </Link>
            <Link
              to={ROUTES.CANDIDATE_APPLICATIONS}
              className="flex-1 flex items-center justify-center gap-2 border border-outline-variant text-on-surface px-4 py-3 rounded-xl hover:bg-surface-container transition-colors font-bold font-body text-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>work</span>
              Applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
