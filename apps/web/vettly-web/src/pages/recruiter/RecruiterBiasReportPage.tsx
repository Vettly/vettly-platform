import { Link } from "react-router-dom";
import { useRecruiterCandidates } from "../../hooks/useRecruiterCandidates";
import { EmptyState } from "../../components/EmptyState";
import { ROUTES } from "../../router/routes";

export default function RecruiterBiasReportPage() {
  const { isLoading, rows } = useRecruiterCandidates();

  const totalApplications = rows.length;
  const flagged = rows.filter((r) => r.summary?.biasFlagged);
  const flaggedPct = totalApplications > 0 ? Math.round((flagged.length / totalApplications) * 100) : 0;

  const statCells = [
    { label: "Flagged decisions", value: flagged.length },
    { label: "Total applications", value: totalApplications },
    { label: "Flagged rate", value: `${flaggedPct}%` },
  ];

  const sortedFlagged = [...flagged].sort(
    (a, b) => new Date(b.entry.movedAt).getTime() - new Date(a.entry.movedAt).getTime()
  );

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4">
      <div>
        <h1 className="text-[23px] font-semibold font-headline text-on-surface tracking-tight">
          Bias report
        </h1>
        <p className="text-on-surface-variant font-body text-sm mt-1">
          Applications flagged by the AI screener for potential bias.
        </p>
      </div>

      {/* Stats strip */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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

      {/* Flagged decisions */}
      <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-[15px] border-b border-outline-variant">
          <span className="text-sm font-semibold font-headline text-on-surface">Flagged decisions</span>
          {!isLoading && (
            <span className="text-[11px] font-bold font-label text-secondary-fixed-dim bg-secondary-fixed-dim/14 px-2.5 py-1 rounded-full">
              {flagged.length} to review
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-highest animate-pulse rounded-lg h-16" />
            ))}
          </div>
        ) : sortedFlagged.length === 0 ? (
          <EmptyState
            icon="verified_user"
            title="No flagged decisions"
            description="Applications flagged for potential bias will appear here for review."
          />
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {sortedFlagged.map(({ entry, job, profile, summary }) => {
              const displayName = profile
                ? `${profile.firstName} ${profile.lastName}`.trim()
                : `Candidate #${entry.candidateId.slice(0, 8)}…`;

              return (
                <Link
                  key={entry.id}
                  to={ROUTES.RECRUITER_CANDIDATE_DETAIL(job.id, entry.applicationId)}
                  className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-surface-container-highest transition-colors"
                >
                  <div className="w-9 h-9 rounded-[10px] bg-secondary-fixed-dim/14 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary-fixed-dim" style={{ fontSize: "19px" }}>
                      flag
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold font-body text-on-surface truncate">
                      {displayName}
                    </p>
                    <p className="text-[11.5px] font-body text-on-surface-variant truncate mt-0.5">
                      {job.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-[13px] font-semibold text-secondary-fixed-dim">
                      {summary?.aiScore !== null && summary?.aiScore !== undefined
                        ? Math.round(summary.aiScore)
                        : "—"}
                    </div>
                    <div className="text-[10px] font-body text-on-surface-variant uppercase">
                      AI score
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
