import {
  useApplicationSummary,
  useCandidateProfile,
} from "../../../api/candidate/recruiter.api";
import type { PipelineStage } from "../../../types/job.types";

export function PipelineCandidateCard({
  entry,
  jobTitle,
  onOpen,
  onMovePrev,
  onMoveNext,
  isMoving,
}: Readonly<{
  entry: PipelineStage;
  jobTitle: string;
  onOpen: () => void;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
  isMoving: boolean;
}>) {
  const { data: profile } = useCandidateProfile(entry.candidateId);
  const { data: summary } = useApplicationSummary(entry.applicationId);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : `Candidate #${entry.candidateId.slice(0, 8)}…`;

  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left bg-surface-container-highest rounded-xl border border-outline-variant p-3 hover:border-secondary-fixed-dim/50 transition-colors"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-[30px] h-[30px] rounded-[9px] bg-secondary-fixed-dim/14 text-secondary-fixed-dim flex items-center justify-center shrink-0 overflow-hidden text-[11px] font-bold">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold font-body text-on-surface truncate">{displayName}</p>
          <p className="text-[10.5px] font-body text-on-surface-variant truncate">{jobTitle}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <span className="font-mono text-[11px] font-semibold text-[#46D39A]">
          {summary?.matchScore !== null && summary?.matchScore !== undefined
            ? `${Math.round(summary.matchScore)}% match`
            : "— match"}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMovePrev?.();
            }}
            disabled={!onMovePrev || isMoving}
            title="Move to previous stage"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant disabled:opacity-30 hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>chevron_left</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveNext?.();
            }}
            disabled={!onMoveNext || isMoving}
            title="Move to next stage"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant disabled:opacity-30 hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>chevron_right</span>
          </button>
        </div>
      </div>
    </button>
  );
}
