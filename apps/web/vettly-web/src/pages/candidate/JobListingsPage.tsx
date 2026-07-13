import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useJob, useJobs } from "../../api/job/job.api";
import { useApplications, useApplyToJob, useResumes } from "../../api/candidate/candidate.api";
import { useNavBadgeStore } from "../../stores/navBadgeStore";
import { formatRelative, formatSalary } from "../../utils/format";
import { ROUTES } from "../../router/routes";
import type { JobSummary } from "../../types/job.types";

const FILTER_TAGS = ["All", "Remote", "Full-time", "Contract"] as const;
type FilterTag = (typeof FILTER_TAGS)[number];

function matchesFilterTag(job: JobSummary, tag: FilterTag): boolean {
  if (tag === "All") return true;
  if (tag === "Remote") {
    return job.workArrangement === "remote" || job.location?.toLowerCase() === "remote";
  }
  if (tag === "Full-time") return job.jobType === "full-time";
  return job.jobType === "contract";
}

function companyInitial(job: Pick<JobSummary, "title" | "companyName">): string {
  return (job.companyName ?? job.title).charAt(0).toUpperCase();
}

function chipClasses(active: boolean): string {
  return active
    ? "text-[12.5px] font-semibold text-on-secondary-fixed bg-secondary-fixed-dim px-3.5 py-1.5 rounded-lg transition-colors"
    : "text-[12.5px] font-medium text-on-surface-variant bg-surface-container-high border border-outline-variant px-3.5 py-1.5 rounded-lg hover:bg-surface-container-highest transition-colors";
}

function ApplyButton({
  isApplied,
  isApplying,
  onApply,
  className,
}: Readonly<{
  isApplied: boolean;
  isApplying: boolean;
  onApply: () => void;
  className: string;
}>) {
  let label = "Apply";
  if (isApplied) label = "Applied";
  else if (isApplying) label = "Applying…";

  return (
    <button
      type="button"
      onClick={onApply}
      disabled={isApplied || isApplying}
      className={`flex items-center justify-center gap-1.5 font-semibold text-[13px] rounded-[9px] transition-opacity disabled:cursor-default ${
        isApplied
          ? "bg-surface-container-highest text-[#46D39A] border border-[#2A4A3A]"
          : "bg-secondary-fixed-dim text-on-secondary-fixed border border-secondary-fixed-dim hover:opacity-90 disabled:opacity-60"
      } ${className}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>
        {isApplied ? "check" : "send"}
      </span>
      {label}
    </button>
  );
}

function StatBox({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex-1 bg-surface-container-highest border border-outline-variant rounded-[10px] p-3">
      <div className="text-[10.5px] font-label text-on-surface-variant uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold font-headline text-on-surface mt-1.5">{value}</div>
    </div>
  );
}

function JobCard({
  job,
  isApplied,
  isApplying,
  onApply,
  onOpenDetails,
}: Readonly<{
  job: JobSummary;
  isApplied: boolean;
  isApplying: boolean;
  onApply: () => void;
  onOpenDetails: () => void;
}>) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl p-4.5 flex flex-col gap-3.5">
      <div className="flex items-start gap-3">
        <div
          className="w-10.5 h-10.5 rounded-[11px] flex items-center justify-center text-base font-bold shrink-0"
          style={{ background: "rgba(244,163,64,.14)", color: "#F4A340" }}
        >
          {companyInitial(job)}
        </div>
        <button type="button" onClick={onOpenDetails} className="flex-1 min-w-0 text-left">
          <div className="text-[15px] font-semibold font-headline text-on-surface truncate hover:underline">
            {job.title}
          </div>
          <div className="text-[12.5px] font-body text-on-surface-variant mt-0.5 truncate">
            {job.companyName ?? "—"}
            {job.location ? ` · ${job.location}` : ""}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3.5 text-xs font-body text-on-surface">
        {salary && (
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "15px" }}>
              payments
            </span>
            {salary}
          </span>
        )}
        <span className="flex items-center gap-1.5 capitalize">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "15px" }}>
            schedule
          </span>
          {job.jobType.replace("-", " ")}
        </span>
      </div>

      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((skill) => (
            <span
              key={skill.id}
              className="text-[11px] font-body text-on-surface-variant bg-surface-container-highest border border-outline-variant rounded-full px-2.5 py-1"
            >
              {skill.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2.5 border-t border-outline-variant/60 pt-3.5">
        <ApplyButton isApplied={isApplied} isApplying={isApplying} onApply={onApply} className="flex-1 h-10" />
        <button
          type="button"
          onClick={onOpenDetails}
          className="flex items-center justify-center h-10 px-4 rounded-[9px] bg-surface-container-highest border border-outline-variant text-on-surface-variant font-semibold text-[13px] hover:bg-surface-container-low transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  );
}

function JobDetailModal({
  jobId,
  isApplied,
  isApplying,
  onApply,
  onClose,
}: Readonly<{
  jobId: string;
  isApplied: boolean;
  isApplying: boolean;
  onApply: () => void;
  onClose: () => void;
}>) {
  const { data: job, isLoading } = useJob(jobId);
  const salary = job ? formatSalary(job.salaryMin, job.salaryMax) : null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-10">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-140 max-h-full bg-surface-container-high border border-outline rounded-2xl overflow-hidden flex flex-col">
        {isLoading || !job ? (
          <div className="p-8 space-y-3">
            <div className="h-6 bg-surface-container-highest animate-pulse rounded-lg w-2/3" />
            <div className="h-4 bg-surface-container-highest animate-pulse rounded-lg w-1/2" />
            <div className="h-32 bg-surface-container-highest animate-pulse rounded-lg" />
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-outline-variant flex gap-3.5 items-start">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                style={{ background: "rgba(244,163,64,.14)", color: "#F4A340" }}
              >
                {companyInitial(job)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold font-headline text-on-surface">{job.title}</div>
                <div className="text-[13px] font-body text-on-surface-variant mt-1">
                  {[job.companyName, job.location, job.jobType.replace("-", " ")]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "22px" }}>
                  close
                </span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-4.5">
              <div className="flex gap-2.5">
                {salary && <StatBox label="Salary" value={salary} />}
                <StatBox label="Posted" value={`${formatRelative(job.createdAt)} ago`} />
                {job.workArrangement && <StatBox label="Arrangement" value={job.workArrangement} />}
              </div>
              {job.skills.length > 0 && (
                <div>
                  <div className="text-[11px] font-label text-on-surface-variant uppercase tracking-wide mb-2.5">
                    Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="text-[11.5px] font-body text-on-surface-variant bg-surface-container-highest border border-outline-variant rounded-full px-2.5 py-1"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-[13.5px] leading-7 font-body text-on-surface-variant whitespace-pre-line">
                {job.description}
              </div>
              {job.benefits && (
                <div>
                  <div className="text-[11px] font-label text-on-surface-variant uppercase tracking-wide mb-2.5">
                    Benefits
                  </div>
                  <div className="text-[13.5px] leading-7 font-body text-on-surface-variant whitespace-pre-line">
                    {job.benefits}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4.5 border-t border-outline-variant flex gap-2.5">
              <ApplyButton isApplied={isApplied} isApplying={isApplying} onApply={onApply} className="flex-1 h-11.5 text-sm" />
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center h-11.5 px-4.5 rounded-[10px] bg-surface-container-highest border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container-low transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function JobListingsPage() {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<FilterTag>("All");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [detailsJobId, setDetailsJobId] = useState<string | null>(null);

  const { data: jobs, isLoading } = useJobs({ search: search || undefined });
  const { data: applications } = useApplications();
  const { data: resumes } = useResumes();
  const applyToJob = useApplyToJob();

  useEffect(() => {
    useNavBadgeStore.getState().markViewed("candidateFindJobs");
  }, []);

  const appliedJobIds = new Set(applications?.map((a) => a.jobId) ?? []);
  const primaryResume = resumes?.find((r) => r.isPrimary) ?? resumes?.[0];
  const jobList = (jobs ?? []).filter((job) => matchesFilterTag(job, filterTag));

  const handleApply = (jobId: string) => {
    if (!primaryResume) {
      toast.error(
        <span>
          Upload a resume first.{" "}
          <Link to={ROUTES.CANDIDATE_PROFILE} className="underline font-bold">
            Go to profile
          </Link>
        </span>
      );
      return;
    }

    setApplyingId(jobId);
    applyToJob.mutate(
      { jobId, resumeId: primaryResume.id },
      {
        onSuccess: () => toast.success("Application submitted!"),
        onError: () => toast.error("Failed to apply. Please try again."),
        onSettled: () => setApplyingId(null),
      }
    );
  };

  let results;
  if (isLoading) {
    results = (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-container-high animate-pulse rounded-xl h-44" />
        ))}
      </div>
    );
  } else if (jobList.length === 0) {
    results = (
      <div className="text-center py-20 space-y-3">
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "48px" }}>
          work_off
        </span>
        <p className="text-base font-semibold font-headline text-on-surface">No jobs found</p>
        <p className="text-on-surface-variant font-body text-sm">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  } else {
    results = (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {jobList.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isApplied={appliedJobIds.has(job.id)}
            isApplying={applyingId === job.id}
            onApply={() => handleApply(job.id)}
            onOpenDetails={() => setDetailsJobId(job.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <span
          className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
          style={{ fontSize: "20px" }}
        >
          search
        </span>
        <input
          type="text"
          placeholder="Search by title or keyword…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high rounded-xl border border-outline-variant text-sm font-body text-on-surface placeholder:text-on-surface-variant outline-none focus:border-secondary-fixed-dim transition-colors"
        />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2.5">
        {FILTER_TAGS.map((tag) => (
          <button key={tag} type="button" onClick={() => setFilterTag(tag)} className={chipClasses(filterTag === tag)}>
            {tag}
          </button>
        ))}
        <span className="ml-auto text-[12.5px] font-body text-on-surface-variant">
          {jobList.length} role{jobList.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Results */}
      {results}

      {detailsJobId && (
        <JobDetailModal
          jobId={detailsJobId}
          isApplied={appliedJobIds.has(detailsJobId)}
          isApplying={applyingId === detailsJobId}
          onApply={() => handleApply(detailsJobId)}
          onClose={() => setDetailsJobId(null)}
        />
      )}
    </div>
  );
}
