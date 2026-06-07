import { formatDate } from "../../../utils/format";
import type { PipelineStage, PipelineStageName } from "../../../types/job.types";

const STAGES: { key: PipelineStageName; label: string }[] = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "matched", label: "Matched" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
];

export function CandidateCard({
  entry,
  onMove,
  isMoving,
}: Readonly<{
  entry: PipelineStage;
  onMove: (entry: PipelineStage, stage: PipelineStageName) => void;
  isMoving: boolean;
}>) {
  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "16px" }}>
            person
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold font-body text-on-surface truncate">
            Candidate #{entry.candidateId.slice(0, 8)}…
          </p>
          <p className="text-xs text-on-surface-variant font-body">
            Moved {formatDate(entry.movedAt)}
          </p>
        </div>
      </div>
      {entry.notes && (
        <p className="text-xs font-body text-on-surface-variant bg-surface-container-low rounded-lg px-2.5 py-1.5">
          {entry.notes}
        </p>
      )}
      <select
        value={entry.stage}
        disabled={isMoving}
        onChange={(e) => onMove(entry, e.target.value as PipelineStageName)}
        className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-lg px-2.5 py-1.5 text-xs font-bold font-label text-on-surface outline-none transition-colors disabled:opacity-50"
      >
        {STAGES.map((s) => (
          <option key={s.key} value={s.key}>
            Move to: {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { STAGES };
