import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useJobs, type JobFilters } from "../../api/job/job.api";
import { useApplications, useApplyToJob, useResumes } from "../../api/candidate/candidate.api";
import { formatSalary } from "../../utils/format";
import { ROUTES } from "../../router/routes";
import type { JobSummary } from "../../types/job.types";

const JOB_TYPES = ["full-time", "part-time", "contract", "remote"];
const EXPERIENCE_LEVELS = ["junior", "mid", "senior"];

function JobCard({
  job,
  isApplied,
  onApply,
  isApplying,
}: Readonly<{
  job: JobSummary;
  isApplied: boolean;
  onApply: (jobId: string) => void;
  isApplying: boolean;
}>) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="bg-surface-container rounded-2xl border border-outline-variant p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-bold text-on-surface text-base leading-snug">
            {job.title}
          </h3>
          {job.companyName && (
            <p className="text-sm font-body text-secondary mt-0.5">{job.companyName}</p>
          )}
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
            <span className="flex items-center gap-1 text-xs text-on-surface-variant font-body">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                group
              </span>
              {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {isApplied ? (
          <span className="shrink-0 text-xs font-bold font-label text-secondary bg-secondary-container px-3 py-1.5 rounded-full">
            Applied
          </span>
        ) : (
          <button
            onClick={() => onApply(job.id)}
            disabled={isApplying}
            className="shrink-0 bg-primary text-on-primary text-xs font-bold font-label px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isApplying ? "Applying…" : "Apply"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-label font-bold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant capitalize">
          {job.jobType}
        </span>
        {job.experienceLevel && (
          <span className="text-xs font-label font-bold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant capitalize">
            {job.experienceLevel}
          </span>
        )}
        {job.skills.slice(0, 5).map((skill) => (
          <span
            key={skill.id}
            className={`text-xs font-label px-2.5 py-1 rounded-full ${
              skill.isRequired
                ? "bg-secondary-container text-on-secondary-container font-bold"
                : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            {skill.name}
          </span>
        ))}
        {job.skills.length > 5 && (
          <span className="text-xs text-on-surface-variant font-body">
            +{job.skills.length - 5} more
          </span>
        )}
      </div>
    </div>
  );
}

export default function JobListingsPage() {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const filters: JobFilters = {
    search: search || undefined,
    jobType: jobType || undefined,
    experienceLevel: experienceLevel || undefined,
  };

  const { data: jobs, isLoading } = useJobs(filters);
  const { data: applications } = useApplications();
  const { data: resumes } = useResumes();
  const applyToJob = useApplyToJob();

  const appliedJobIds = new Set(applications?.map((a) => a.jobId) ?? []);
  const primaryResume = resumes?.find((r) => r.isPrimary) ?? resumes?.[0];
  const jobList = jobs ?? [];
  const isEmpty = jobList.length === 0;

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

  const toggleFilter = (
    current: string,
    value: string,
    setter: (v: string) => void
  ) => setter(current === value ? "" : value);

  let results;
  if (isLoading) {
    results = (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container-high animate-pulse rounded-2xl h-32" />
        ))}
      </div>
    );
  } else if (isEmpty) {
    results = (
      <div className="text-center py-20 space-y-4">
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "64px" }}>
          work_off
        </span>
        <p className="text-xl font-bold font-headline text-on-surface">No jobs found</p>
        <p className="text-on-surface-variant font-body text-sm">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  } else {
    results = (
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant font-body">
          {jobList.length} job{jobList.length === 1 ? "" : "s"} found
        </p>
        {jobList.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isApplied={appliedJobIds.has(job.id)}
            onApply={handleApply}
            isApplying={applyingId === job.id}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-headline text-on-surface">
          Browse Jobs
        </h1>
        <p className="text-on-surface-variant font-body text-sm mt-1">
          Find your next opportunity and apply with your resume.
        </p>
      </div>

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
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant text-sm font-body text-on-surface placeholder:text-on-surface-variant outline-none focus:border-secondary transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wide">
            Type
          </span>
          {JOB_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleFilter(jobType, type, setJobType)}
              className={`text-xs font-bold font-label px-3 py-1.5 rounded-full transition-colors capitalize ${
                jobType === type
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wide">
            Level
          </span>
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => toggleFilter(experienceLevel, level, setExperienceLevel)}
              className={`text-xs font-bold font-label px-3 py-1.5 rounded-full transition-colors capitalize ${
                experienceLevel === level
                  ? "bg-secondary text-on-secondary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results}
    </div>
  );
}
