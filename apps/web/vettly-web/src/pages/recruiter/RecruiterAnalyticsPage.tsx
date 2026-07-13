import { useMyJobs, useMyJobsStats } from "../../api/job/job.api";
import { PIPELINE_LABELS, PIPELINE_ORDER } from "../../utils/tones";

export default function RecruiterAnalyticsPage() {
  const { data: jobs, isLoading: jobsLoading } = useMyJobs();
  const { data: stats, isLoading: statsLoading } = useMyJobsStats();

  const isLoading = jobsLoading || statsLoading;

  const totalJobs = jobs?.length ?? 0;
  const openJobs = jobs?.filter((j) => j.status === "open").length ?? 0;
  const totalApplicants = stats?.totalApplicants ?? 0;
  const hiredCount = stats?.pipelineFunnel.hired ?? 0;
  const hireRate = totalApplicants > 0 ? Math.round((hiredCount / totalApplicants) * 100) : null;

  const statCells = [
    { label: "Total jobs", value: totalJobs },
    { label: "Open jobs", value: openJobs },
    { label: "Total applicants", value: totalApplicants },
    { label: "Hire rate", value: hireRate !== null ? `${hireRate}%` : "—" },
  ];

  const funnelStages = PIPELINE_ORDER.filter((stage) => stats?.pipelineFunnel[stage]);
  const funnelMax = stats ? Math.max(...PIPELINE_ORDER.map((s) => stats.pipelineFunnel[s] ?? 0), 1) : 1;

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4">
      <div>
        <h1 className="text-[23px] font-semibold font-headline text-on-surface tracking-tight">
          Analytics
        </h1>
        <p className="text-on-surface-variant font-body text-sm mt-1">
          Hiring activity across all of your jobs.
        </p>
      </div>

      {/* Stats strip */}
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
              <div className="text-[11.5px] font-medium font-label tracking-wide uppercase text-on-surface-variant">
                {s.label}
              </div>
              <div className="text-[26px] font-semibold font-headline text-on-surface leading-none mt-3 truncate">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Applications over time */}
          <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
            <span className="text-sm font-semibold font-headline text-on-surface">Applications</span>
            {isLoading ? (
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

          {/* Conversion funnel */}
          <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
            <span className="text-sm font-semibold font-headline text-on-surface">Conversion funnel</span>
            {isLoading ? (
              <div className="bg-surface-container-highest animate-pulse rounded-lg h-32 mt-4" />
            ) : funnelStages.length === 0 ? (
              <p className="text-[12.5px] font-body text-on-surface-variant mt-3">
                Applicants will appear here as candidates move through your pipeline.
              </p>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                {funnelStages.map((stage) => {
                  const count = stats?.pipelineFunnel[stage] ?? 0;
                  const pct = (count / funnelMax) * 100;
                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <span className="text-xs font-body text-on-surface-variant w-20 shrink-0">
                        {PIPELINE_LABELS[stage]}
                      </span>
                      <div className="flex-1 h-2.5 bg-outline-variant rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary-fixed-dim rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-on-surface w-8 text-right shrink-0">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column — per-job breakdown */}
        <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-5 py-[15px] border-b border-outline-variant">
            <span className="text-sm font-semibold font-headline text-on-surface">Per-job breakdown</span>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface-container-highest animate-pulse rounded-lg h-16" />
              ))}
            </div>
          ) : !stats || stats.perJobBreakdown.length === 0 ? (
            <p className="text-[12.5px] font-body text-on-surface-variant px-5 py-4">
              Job-level stats will appear here once candidates apply.
            </p>
          ) : (
            <div className="divide-y divide-outline-variant/60">
              {stats.perJobBreakdown.map((job) => (
                <div key={job.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-medium font-body text-on-surface truncate">
                      {job.title}
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant shrink-0">
                      {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {PIPELINE_ORDER.filter((stage) => job.stageBreakdown[stage]).map((stage) => (
                      <span
                        key={stage}
                        className="text-[10.5px] font-bold font-label text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full"
                      >
                        {PIPELINE_LABELS[stage]} · {job.stageBreakdown[stage]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
