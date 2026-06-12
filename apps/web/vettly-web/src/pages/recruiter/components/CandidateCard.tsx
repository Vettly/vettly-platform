import { useState } from "react";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/format";
import {
  useApplicationSummary,
  useCandidateProfile,
} from "../../../api/candidate/recruiter.api";
import { useUpdateNotes } from "../../../api/job/pipeline.api";
import { CandidateProfileModal } from "./CandidateProfileModal";
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
  jobId,
  entry,
  onMove,
  isMoving,
}: Readonly<{
  jobId: string;
  entry: PipelineStage;
  onMove: (entry: PipelineStage, stage: PipelineStageName) => void;
  isMoving: boolean;
}>) {
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(entry.notes ?? "");

  const { data: profile } = useCandidateProfile(entry.candidateId);
  const { data: summary } = useApplicationSummary(entry.applicationId);
  const updateNotes = useUpdateNotes(jobId);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : `Candidate #${entry.candidateId.slice(0, 8)}…`;

  const startEditingNotes = () => {
    setNotesDraft(entry.notes ?? "");
    setIsEditingNotes(true);
  };

  const saveNotes = () => {
    updateNotes.mutate(
      { applicationId: entry.applicationId, notes: notesDraft || null },
      {
        onSuccess: () => {
          toast.success("Notes updated");
          setIsEditingNotes(false);
        },
        onError: () => toast.error("Failed to update notes"),
      }
    );
  };

  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0 overflow-hidden">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "16px" }}>
              person
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold font-body text-on-surface truncate">
            {displayName}
          </p>
          <p className="text-xs text-on-surface-variant font-body">
            Moved {formatDate(entry.movedAt)}
          </p>
        </div>
      </div>

      {summary && (summary.aiScore !== null || summary.matchScore !== null) && (
        <div className="flex items-center gap-2">
          {summary.aiScore !== null && (
            <span className="text-xs font-bold font-label text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full">
              AI {Math.round(summary.aiScore)}
            </span>
          )}
          {summary.matchScore !== null && (
            <span className="text-xs font-bold font-label text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full">
              Match {Math.round(summary.matchScore)}
            </span>
          )}
          {summary.biasFlagged && (
            <span className="material-symbols-outlined text-error" style={{ fontSize: "14px" }} title="Flagged for potential bias">
              flag
            </span>
          )}
        </div>
      )}

      {isEditingNotes ? (
        <div className="flex flex-col gap-1.5">
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            rows={2}
            placeholder="Add notes…"
            className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary rounded-lg px-2.5 py-1.5 text-xs font-body text-on-surface outline-none transition-colors resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveNotes}
              disabled={updateNotes.isPending}
              className="text-xs font-bold font-label text-on-primary bg-primary px-2.5 py-1 rounded-lg disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditingNotes(false)}
              className="text-xs font-bold font-label text-on-surface-variant px-2.5 py-1 rounded-lg border border-outline-variant"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEditingNotes}
          className="text-left text-xs font-body text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high rounded-lg px-2.5 py-1.5 transition-colors"
        >
          {entry.notes || "Add notes…"}
        </button>
      )}

      <div className="flex items-center gap-2">
        <select
          value={entry.stage}
          disabled={isMoving}
          onChange={(e) => onMove(entry, e.target.value as PipelineStageName)}
          className="flex-1 bg-surface-container-high border border-outline-variant focus:border-secondary rounded-lg px-2.5 py-1.5 text-xs font-bold font-label text-on-surface outline-none transition-colors disabled:opacity-50"
        >
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              Move to: {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowProfile(true)}
          className="text-xs font-bold font-label text-secondary border border-outline-variant rounded-lg px-2.5 py-1.5 hover:bg-surface-container-high transition-colors whitespace-nowrap"
        >
          View Profile
        </button>
      </div>

      {showProfile && (
        <CandidateProfileModal
          candidateId={entry.candidateId}
          applicationId={entry.applicationId}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

export { STAGES };
