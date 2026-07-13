import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useJob, useMyJobs, useMyJobsStats } from "../../api/job/job.api";
import { useMyOrganization } from "../../api/organization/organization.api";
import { useInterviews } from "../../api/interview/interview.api";
import { useRecruiterCandidates } from "../../hooks/useRecruiterCandidates";
import { EmptyState } from "../../components/EmptyState";
import { PillBadge } from "../../components/PillBadge";
import { PIPELINE_LABELS, PIPELINE_TONES } from "../../utils/tones";
import { formatRelative } from "../../utils/format";
import { ROUTES } from "../../router/routes";
import type { JobSummary, TimeSeriesPoint } from "../../types/job.types";
import { isRecentlyCreated, type Interview } from "../../types/interview.types";

const STAGE_LABELS: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  matched: "Matched",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

const STAGE_ORDER = ["applied", "screening", "matched", "interview", "offer", "hired", "rejected"];

const CANDIDATE_COLUMNS = "1.7fr 1.5fr 104px 122px 56px";

/** Counts `items` per date bucket, aligned to the same date keys as `timeline`. */
function bucketByDate(timeline: TimeSeriesPoint[], itemDates: string[]): number[] {
  const counts = new Map<string, number>();
  for (const iso of itemDates) {
    const key = iso.slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return timeline.map((point) => counts.get(point.date.slice(0, 10)) ?? 0);
}

function sparkHeights(counts: number[]): number[] {
  if (counts.length === 0) return [20, 20, 20, 20, 20, 20, 20, 20];
  const max = Math.max(...counts, 1);
  return counts.map((c) => Math.max(8, Math.round((c / max) * 100)));
}

const RANGE_OPTIONS = [
  { key: "month", label: "This month" },
  { key: "quarter", label: "Quarter" },
  { key: "all", label: "All time" },
] as const;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function RecruiterHomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [range, setRange] = useState<(typeof RANGE_OPTIONS)[number]["key"]>("month");
  const jobsQuery = useMyJobs();
  const orgQuery = useMyOrganization();
  const statsQuery = useMyJobsStats();
  const { isLoading: candidatesLoading, rows: candidateRows } = useRecruiterCandidates();

  const isLoading = jobsQuery.isLoading || orgQuery.isLoading;
  const jobs = jobsQuery.data ?? [];
  const organization = orgQuery.data;
  const stats = statsQuery.data;

  const activeJobs = jobs.filter((j) => j.status === "open");
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0);

  const topCandidates = [...candidateRows]
    .sort((a, b) => (b.summary?.matchScore ?? -1) - (a.summary?.matchScore ?? -1))
    .slice(0, 6);

  const timeline = stats?.applicationsOverTime ?? [];
  const stageMovedDates = (stage: string) =>
    candidateRows.filter((r) => r.entry.stage === stage).map((r) => r.entry.movedAt);

  const statCells = [
    {
      icon: "work_outline",
      label: "Active Jobs",
      value: activeJobs.length,
      spark: sparkHeights(bucketByDate(timeline, jobs.map((j: JobSummary) => j.createdAt))),
    },
    {
      icon: "group",
      label: "Applicants",
      value: totalApplicants,
      spark: sparkHeights(timeline.map((p) => p.count)),
    },
    {
      icon: "forum",
      label: "In Interview",
      value: stats?.pipelineFunnel.interview ?? 0,
      spark: sparkHeights(bucketByDate(timeline, stageMovedDates("interview"))),
    },
    {
      icon: "mail",
      label: "Offers Out",
      value: stats?.pipelineFunnel.offer ?? 0,
      spark: sparkHeights(bucketByDate(timeline, stageMovedDates("offer"))),
    },
  ];

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-[18px]">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-secondary-fixed-dim mb-1.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-[23px] font-semibold font-headline text-on-surface tracking-tight">
            {greeting()}, {user?.firstName}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-0.5 bg-surface-container-high border border-outline-variant rounded-[9px] p-[3px]">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setRange(opt.key)}
                className={`text-[12.5px] font-semibold font-body px-3.5 py-1.5 rounded-[7px] transition-colors ${
                  range === opt.key
                    ? "bg-secondary-fixed-dim text-on-secondary-fixed"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.RECRUITER_JOBS, { state: { openCreateModal: true } })}
            className="flex items-center justify-center gap-2 h-[38px] px-4 rounded-[9px] bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[13.5px] hover:opacity-90 transition-opacity shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
            Post a Job
          </button>
        </div>
      </div>

      {/* Stats row */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-xl h-24" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
          {statCells.map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 px-5 py-[18px] ${
                i > 0 ? "border-t sm:border-t-0 sm:border-l border-outline-variant" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>
                  {s.icon}
                </span>
                <span className="text-[11.5px] font-medium font-label tracking-wide uppercase">
                  {s.label}
                </span>
              </div>
              <div className="flex items-end justify-between gap-3 mt-3">
                <div className="text-[26px] font-semibold font-headline text-on-surface leading-none truncate">
                  {s.value}
                </div>
                <div className="flex items-end gap-[2px] h-7 shrink-0">
                  {s.spark.map((h, idx) => {
                    const fromEnd = s.spark.length - 1 - idx;
                    const tone =
                      fromEnd < 2
                        ? "bg-secondary-fixed-dim"
                        : fromEnd === 2
                          ? "bg-on-surface-variant/40"
                          : "bg-outline-variant";
                    return (
                      <div
                        key={idx}
                        className={`w-[3px] rounded-[1px] ${tone}`}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !organization && (
        <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-full bg-secondary-fixed-dim/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-secondary-fixed-dim" style={{ fontSize: "22px" }}>
              apartment
            </span>
          </div>
          <div className="flex-1">
            <p className="font-headline font-semibold text-on-surface text-sm">Set up your organization</p>
            <p className="text-[12.5px] font-body text-on-surface-variant mt-0.5">
              You'll need an organization before you can post jobs.
            </p>
          </div>
          <Link
            to={ROUTES.RECRUITER_ORGANIZATION}
            className="inline-flex items-center justify-center h-9 px-4 rounded-[10px] bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[12.5px] hover:opacity-90 transition-opacity shrink-0"
          >
            Get started
          </Link>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-4 items-start">
        {/* Top candidates */}
        <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-[15px] border-b border-outline-variant">
            <div className="flex items-center gap-2.5">
              <span className="text-[14.5px] font-semibold font-headline text-on-surface">
                Top candidates
              </span>
              {!candidatesLoading && (
                <span className="text-[11px] font-body text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">
                  {candidateRows.length} active
                </span>
              )}
            </div>
            <Link
              to={ROUTES.RECRUITER_CANDIDATES}
              className="text-xs font-bold font-label text-secondary-fixed-dim hover:underline"
            >
              View all
            </Link>
          </div>
          {candidatesLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface-container-highest animate-pulse rounded-lg h-14" />
              ))}
            </div>
          ) : topCandidates.length === 0 ? (
            <EmptyState
              icon="group_off"
              title="No candidates yet"
              description="Applicants across all your jobs will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div
                  className="grid items-center px-5 py-2.5 text-[10.5px] tracking-wide uppercase text-on-surface-variant/60 border-b border-outline-variant/60"
                  style={{ gridTemplateColumns: CANDIDATE_COLUMNS }}
                >
                  <span>Candidate</span>
                  <span>Applied role</span>
                  <span>Match</span>
                  <span>Stage</span>
                  <span className="text-right">Age</span>
                </div>
                {topCandidates.map(({ entry, job, profile, summary }) => {
                  const displayName = profile
                    ? `${profile.firstName} ${profile.lastName}`.trim()
                    : `Candidate #${entry.candidateId.slice(0, 8)}…`;
                  const initials = profile
                    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
                    : "?";
                  const matchScore = summary?.matchScore;
                  const matchPct = matchScore !== null && matchScore !== undefined ? Math.max(0, Math.min(100, matchScore)) : 0;
                  const tone = PIPELINE_TONES[entry.stage];

                  return (
                    <Link
                      key={entry.id}
                      to={ROUTES.RECRUITER_CANDIDATE_DETAIL(job.id, entry.applicationId)}
                      className="grid items-center gap-2 px-5 h-[60px] border-b border-outline-variant/60 last:border-b-0 hover:bg-surface-container-highest transition-colors"
                      style={{ gridTemplateColumns: CANDIDATE_COLUMNS }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-[9px] bg-secondary-fixed-dim/14 text-secondary-fixed-dim flex items-center justify-center shrink-0 overflow-hidden text-[11.5px] font-bold">
                          {profile?.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            initials
                          )}
                        </div>
                        <span className="text-[13.5px] font-medium font-body text-on-surface truncate">
                          {displayName}
                        </span>
                      </div>
                      <span className="text-[12.5px] font-body text-on-surface-variant truncate pr-2">
                        {job.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12.5px] font-semibold text-[#46D39A]">
                          {matchScore !== null && matchScore !== undefined ? `${Math.round(matchScore)}%` : "—"}
                        </span>
                        <div className="w-9 h-1 rounded-full bg-outline-variant overflow-hidden">
                          <div className="h-full bg-[#46D39A]" style={{ width: `${matchPct}%` }} />
                        </div>
                      </div>
                      <div>
                        <PillBadge tone={tone} label={PIPELINE_LABELS[entry.stage]} />
                      </div>
                      <span className="font-mono text-xs text-on-surface-variant text-right">
                        {formatRelative(entry.movedAt)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Pipeline funnel */}
          <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
            <span className="text-sm font-semibold font-headline text-on-surface">Pipeline</span>
            {statsQuery.isLoading ? (
              <div className="bg-surface-container-highest animate-pulse rounded-lg h-32 mt-4" />
            ) : !stats || Object.keys(stats.pipelineFunnel).length === 0 ? (
              <p className="text-[12.5px] font-body text-on-surface-variant mt-3">
                Applicants will appear here as candidates apply.
              </p>
            ) : (
              (() => {
                const stages = STAGE_ORDER.filter((stage) => stats.pipelineFunnel[stage]);
                const total = stages.reduce((sum, stage) => sum + stats.pipelineFunnel[stage], 0);
                return (
                  <div className="mt-4">
                    <div className="flex h-8 w-full rounded-md overflow-hidden gap-[2px]">
                      {stages.map((stage) => {
                        const count = stats.pipelineFunnel[stage];
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        const tone = PIPELINE_TONES[stage as keyof typeof PIPELINE_TONES];
                        const showLabel = pct >= 12;
                        return (
                          <div
                            key={stage}
                            className="h-full flex items-center justify-center first:rounded-l-[4px] last:rounded-r-[4px]"
                            style={{ width: `${pct}%`, backgroundColor: tone.color }}
                            title={`${STAGE_LABELS[stage] ?? stage}: ${count} (${Math.round(pct)}%)`}
                          >
                            {showLabel && (
                              <span className="text-[11px] font-mono font-semibold text-on-surface">
                                {count}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-1.5 mt-3.5">
                      {stages.map((stage) => {
                        const count = stats.pipelineFunnel[stage];
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        const tone = PIPELINE_TONES[stage as keyof typeof PIPELINE_TONES];
                        return (
                          <div key={stage} className="flex items-center gap-2 text-xs font-body">
                            <span
                              className="w-2.5 h-2.5 rounded-[3px] shrink-0"
                              style={{ backgroundColor: tone.color }}
                            />
                            <span className="text-on-surface-variant flex-1 truncate">
                              {STAGE_LABELS[stage] ?? stage}
                            </span>
                            <span className="font-mono text-on-surface">{count}</span>
                            <span className="font-mono text-on-surface-variant w-9 text-right">
                              {Math.round(pct)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Applications over time */}
          <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
            <span className="text-sm font-semibold font-headline text-on-surface">Applications</span>
            {statsQuery.isLoading ? (
              <div className="bg-surface-container-highest animate-pulse rounded-lg h-32 mt-4" />
            ) : !stats || stats.applicationsOverTime.every((p) => p.count === 0) ? (
              <p className="text-[12.5px] font-body text-on-surface-variant mt-3">
                Application activity will appear here over time.
              </p>
            ) : (
              <div className="flex items-end gap-1.5 h-28 mt-4">
                {stats.applicationsOverTime.map((point) => {
                  const max = Math.max(...stats.applicationsOverTime.map((p) => p.count), 1);
                  const heightPct = (point.count / max) * 100;
                  return (
                    <div key={point.date} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                      <div className="flex-1 w-full flex items-end">
                        <div
                          className="w-full bg-secondary-fixed-dim rounded-t-sm min-h-[2px]"
                          style={{ height: `${heightPct}%` }}
                          title={`${point.count} application${point.count === 1 ? "" : "s"}`}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming interviews */}
          <UpcomingInterviewsCard />
        </div>
      </div>
    </div>
  );
}

function InterviewRow({ interview }: Readonly<{ interview: Interview }>) {
  const { data: job } = useJob(interview.jobId);

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/60 last:border-b-0">
      <div className="w-9 h-9 rounded-xl bg-tertiary-container/30 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontSize: "19px" }}>
          video_call
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold font-body text-on-surface truncate flex items-center gap-1.5">
          <span className="truncate">{interview.candidateEmail}</span>
          {isRecentlyCreated(interview.createdAt) && (
            <span className="shrink-0 text-[9.5px] font-label font-semibold px-1.5 py-0.5 rounded-full bg-secondary-fixed-dim text-on-secondary-fixed">
              New
            </span>
          )}
        </p>
        <p className="text-[11.5px] font-body text-on-surface-variant mt-0.5 truncate">
          {job?.title ?? "Interview"} ·{" "}
          {new Date(interview.scheduledAt).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {interview.meetingLink ? (
        <a
          href={interview.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[11.5px] hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>videocam</span>
          Join
        </a>
      ) : (
        <span className="shrink-0 text-[11px] font-body text-on-surface-variant px-2">No link</span>
      )}
    </div>
  );
}

function UpcomingInterviewsCard() {
  const { data: interviews, isLoading } = useInterviews();

  const upcoming =
    interviews
      ?.filter((i) => i.status === "scheduled" && new Date(i.scheduledAt) >= new Date())
      .slice(0, 4) ?? [];

  if (isLoading) {
    return <div className="bg-surface-container-high border border-outline-variant rounded-xl animate-pulse h-32" />;
  }

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-[15px] border-b border-outline-variant">
        <span className="text-sm font-semibold font-headline text-on-surface">Upcoming Interviews</span>
        <Link
          to={ROUTES.RECRUITER_INTERVIEWS}
          className="text-xs font-bold font-label text-secondary-fixed-dim hover:underline"
        >
          View all
        </Link>
      </div>
      {upcoming.map((interview) => (
        <InterviewRow key={interview.id} interview={interview} />
      ))}
    </div>
  );
}
