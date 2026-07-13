import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useApplications, useProfile } from "../../api/candidate/candidate.api";
import { useJob } from "../../api/job/job.api";
import { computeCompleteness } from "./utils";
import { formatRelative } from "../../utils/format";
import { ROUTES } from "../../router/routes";
import type { Application } from "../../types/candidate.types";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_TONES } from "../../utils/tones";
import { PillBadge } from "../../components/PillBadge";
import { UpcomingInterviews } from "./components/UpcomingInterviews";

const SPARK_BARS: { key: string; height: number; className: string }[] = [
  { key: "b1", height: 45, className: "bg-outline-variant" },
  { key: "b2", height: 30, className: "bg-outline-variant" },
  { key: "b3", height: 60, className: "bg-outline-variant" },
  { key: "b4", height: 48, className: "bg-outline-variant" },
  { key: "b5", height: 75, className: "bg-outline" },
  { key: "b6", height: 62, className: "bg-outline" },
  { key: "b7", height: 88, className: "bg-secondary-fixed-dim" },
  { key: "b8", height: 100, className: "bg-secondary-fixed-dim" },
];

const TABLE_COLUMNS = "1.8fr 1.2fr 96px 122px 70px";

function Sparkline() {
  return (
    <div className="flex items-end gap-[2px] h-7 shrink-0">
      {SPARK_BARS.map((bar) => (
        <div
          key={bar.key}
          className={`w-[3px] rounded-[1px] ${bar.className}`}
          style={{ height: `${bar.height}%` }}
        />
      ))}
    </div>
  );
}

function ApplicationRow({ app }: Readonly<{ app: Application }>) {
  const { data: job } = useJob(app.jobId);
  const tone = APPLICATION_STATUS_TONES[app.status];

  return (
    <Link
      to={ROUTES.CANDIDATE_APPLICATIONS}
      className="grid items-center gap-2 px-5 h-14 border-b border-outline-variant/60 last:border-b-0 hover:bg-surface-container-highest transition-colors"
      style={{ gridTemplateColumns: TABLE_COLUMNS }}
    >
      <span className="text-[13.5px] font-medium font-body text-on-surface truncate pr-2">
        {job ? job.title : `Job #${app.jobId.slice(0, 8)}…`}
      </span>
      <span className="text-[12.5px] font-body text-on-surface-variant truncate pr-2">
        {job?.companyName ?? "—"}
      </span>
      <span className="font-mono text-[12.5px] font-semibold text-[#46D39A]">
        {app.matchScore == null ? "—" : `${Math.round(app.matchScore)}%`}
      </span>
      <div>
        <PillBadge tone={tone} label={APPLICATION_STATUS_LABELS[app.status] ?? app.status} />
      </div>
      <span className="font-mono text-xs text-on-surface-variant text-right">
        {formatRelative(app.updatedAt)}
      </span>
    </Link>
  );
}

export default function CandidateHomePage() {
  const { user } = useAuthStore();
  const profileQuery = useProfile();
  const applicationsQuery = useApplications();

  const isLoading = profileQuery.isLoading || applicationsQuery.isLoading;

  const profile = profileQuery.data;
  const applications = applicationsQuery.data ?? [];

  const { pct, checks } = computeCompleteness(profile);

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const matchScores = applications
    .map((a) => a.matchScore)
    .filter((m): m is number => m != null);
  const avgMatch = matchScores.length
    ? Math.round(matchScores.reduce((sum, m) => sum + m, 0) / matchScores.length)
    : null;

  const interviewCount = applications.filter((a) => a.status === "interview").length;

  const newThisWeek = applications.filter(
    (a) => Date.now() - new Date(a.appliedAt).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;

  const stats = [
    {
      icon: "send",
      label: "Applications",
      value: applications.length,
      delta: newThisWeek > 0 ? `${newThisWeek} new` : null,
    },
    {
      icon: "visibility",
      label: "Profile views",
      value: "—",
      delta: null,
    },
    {
      icon: "track_changes",
      label: "Avg. match",
      value: avgMatch == null ? "—" : `${avgMatch}%`,
      delta: null,
    },
    {
      icon: "forum",
      label: "Interviews",
      value: interviewCount,
      delta: null,
    },
  ];

  const completenessItems = [
    { key: "headline", label: "Add a headline" },
    { key: "bio", label: "Write your bio" },
    { key: "experience", label: "Add work experience" },
    { key: "education", label: "Add education" },
    { key: "skills", label: "Add skills" },
    { key: "resume", label: "Upload a resume" },
  ];

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-[18px]">
      {/* Header */}
      <div>
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-secondary-fixed-dim mb-1.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-[23px] font-semibold font-headline text-on-surface tracking-tight">
          Welcome back, {user?.firstName}
        </h1>
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
          {stats.map((s, i) => (
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
                <div>
                  <div className="text-[30px] font-semibold font-headline text-on-surface leading-none">
                    {s.value}
                  </div>
                  {s.delta && (
                    <div className="flex items-center gap-1 font-mono text-[11.5px] text-[#46D39A] mt-2">
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                        trending_up
                      </span>
                      {s.delta}
                    </div>
                  )}
                </div>
                <Sparkline />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-4 items-start">
        {/* Recent applications */}
        <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-[15px] border-b border-outline-variant">
            <span className="text-[14.5px] font-semibold font-headline text-on-surface">
              Recent applications
            </span>
            <Link
              to={ROUTES.CANDIDATE_APPLICATIONS}
              className="text-xs font-bold font-label text-secondary-fixed-dim hover:underline"
            >
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface-container-highest animate-pulse rounded-lg h-14" />
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
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div
                  className="grid items-center px-5 py-2.5 text-[10.5px] tracking-wide uppercase text-on-surface-variant/60 border-b border-outline-variant/60"
                  style={{ gridTemplateColumns: TABLE_COLUMNS }}
                >
                  <span>Role</span>
                  <span>Company</span>
                  <span>Match</span>
                  <span>Stage</span>
                  <span className="text-right">Updated</span>
                </div>
                {recentApplications.map((app) => (
                  <ApplicationRow key={app.id} app={app} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Profile strength */}
          {isLoading ? (
            <div className="bg-surface-container-high animate-pulse rounded-xl h-64" />
          ) : (
            <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold font-headline text-on-surface">
                  Profile strength
                </span>
                <span className="font-mono text-[15px] font-semibold text-secondary-fixed-dim">
                  {pct}%
                </span>
              </div>
              <div className="h-2 bg-outline-variant rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-secondary-fixed-dim rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex flex-col">
                {completenessItems.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2.5 py-1.5">
                    <span
                      className={`material-symbols-outlined shrink-0 ${
                        checks[key] ? "text-[#46D39A]" : "text-outline"
                      }`}
                      style={{ fontSize: "18px" }}
                    >
                      {checks[key] ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span
                      className={`text-[12.5px] font-body flex-1 ${
                        checks[key] ? "text-on-surface-variant" : "text-on-surface"
                      }`}
                    >
                      {label}
                    </span>
                    <span
                      className={`text-[11px] font-bold font-label ${
                        checks[key] ? "text-[#46D39A]" : "text-secondary-fixed-dim"
                      }`}
                    >
                      {checks[key] ? "Done" : "Add"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming interviews */}
          <UpcomingInterviews />

          {/* CTA */}
          <Link
            to={ROUTES.CANDIDATE_PROFILE}
            className="flex items-center justify-center gap-2 h-[46px] rounded-[10px] bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[13.5px] hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              {pct >= 100 ? "edit" : "upload_file"}
            </span>
            {pct >= 100 ? "Edit profile" : "Complete profile"}
          </Link>
        </div>
      </div>
    </div>
  );
}
