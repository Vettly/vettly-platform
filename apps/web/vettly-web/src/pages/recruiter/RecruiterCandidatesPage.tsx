import { Link } from "react-router-dom";
import { useRecruiterCandidates } from "../../hooks/useRecruiterCandidates";
import { EmptyState } from "../../components/EmptyState";
import { PillBadge } from "../../components/PillBadge";
import { PIPELINE_LABELS, PIPELINE_TONES } from "../../utils/tones";
import { formatRelative } from "../../utils/format";
import { ROUTES } from "../../router/routes";

const TABLE_COLUMNS = "2fr 1.6fr 96px 120px 1fr 64px";

export default function RecruiterCandidatesPage() {
  const { isLoading, rows } = useRecruiterCandidates();

  const sorted = [...rows].sort(
    (a, b) => new Date(b.entry.movedAt).getTime() - new Date(a.entry.movedAt).getTime()
  );

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <h1 className="text-[23px] font-semibold font-headline text-on-surface tracking-tight">
          All candidates
        </h1>
        <span className="text-xs font-bold font-label text-on-surface-variant bg-surface-container-high border border-outline-variant px-3 py-1.5 rounded-full">
          {rows.length} {rows.length === 1 ? "person" : "people"}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-xl h-[60px]" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon="group_off"
          title="No candidates yet"
          description="Applicants across all your jobs will appear here."
        />
      ) : (
        <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div
                className="grid items-center px-5 py-2.5 text-[10.5px] tracking-wide uppercase text-on-surface-variant/60 border-b border-outline-variant/60"
                style={{ gridTemplateColumns: TABLE_COLUMNS }}
              >
                <span>Candidate</span>
                <span>Applied role</span>
                <span>Match</span>
                <span>Stage</span>
                <span>Location</span>
                <span className="text-right">Applied</span>
              </div>
              {sorted.map(({ entry, job, profile, summary }) => {
                const displayName = profile
                  ? `${profile.firstName} ${profile.lastName}`.trim()
                  : `Candidate #${entry.candidateId.slice(0, 8)}…`;
                const initials = profile
                  ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
                  : "?";
                const tone = PIPELINE_TONES[entry.stage];

                return (
                  <Link
                    key={entry.id}
                    to={ROUTES.RECRUITER_CANDIDATE_DETAIL(job.id, entry.applicationId)}
                    className="grid items-center gap-2 px-5 h-[60px] border-b border-outline-variant/60 last:border-b-0 hover:bg-surface-container-highest transition-colors"
                    style={{ gridTemplateColumns: TABLE_COLUMNS }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-[34px] h-[34px] rounded-[9px] bg-secondary-fixed-dim/14 text-secondary-fixed-dim flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold">
                        {profile?.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium font-body text-on-surface truncate">
                          {displayName}
                        </p>
                        <p className="text-[11px] font-body text-on-surface-variant truncate">
                          {profile?.email ?? "—"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[12.5px] font-body text-on-surface-variant truncate pr-2">
                      {job.title}
                    </span>
                    <span className="font-mono text-[12.5px] font-semibold text-[#46D39A]">
                      {summary?.matchScore !== null && summary?.matchScore !== undefined
                        ? `${Math.round(summary.matchScore)}%`
                        : "—"}
                    </span>
                    <div>
                      <PillBadge tone={tone} label={PIPELINE_LABELS[entry.stage]} />
                    </div>
                    <span className="text-[12px] font-body text-on-surface-variant truncate pr-2">
                      {profile?.location ?? "—"}
                    </span>
                    <span className="font-mono text-xs text-on-surface-variant text-right">
                      {formatRelative(entry.movedAt)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
