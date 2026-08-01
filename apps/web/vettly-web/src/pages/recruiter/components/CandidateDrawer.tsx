import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useApplicationSummary,
  useCandidateProfile,
} from "../../../api/candidate/recruiter.api";
import { useUpdateNotes } from "../../../api/job/pipeline.api";
import { useMyDocuments } from "../../../api/esign/esign.api";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { PillBadge } from "../../../components/PillBadge";
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_TONES,
  PIPELINE_LABELS,
  PIPELINE_ORDER,
  PIPELINE_TONES,
} from "../../../utils/tones";
import { formatRelative } from "../../../utils/format";
import { ROUTES } from "../../../router/routes";
import { SendOfferModal } from "./SendOfferModal";
import type {
  JobSummary,
  PipelineStage,
  PipelineStageName,
} from "../../../types/job.types";
import { ScheduleInterviewModal } from "./ScheduleInterviewModal";

export function CandidateDrawer({
  jobId,
  job,
  entry,
  onClose,
  onMove,
  isMoving,
}: Readonly<{
  jobId: string;
  job?: JobSummary;
  entry: PipelineStage;
  onClose: () => void;
  onMove: (stage: PipelineStageName) => void;
  isMoving: boolean;
}>) {
  const { data: profile, isLoading: profileLoading } = useCandidateProfile(
    entry.candidateId,
  );
  const { data: summary, isLoading: summaryLoading } = useApplicationSummary(
    entry.applicationId,
  );
  const { data: documents } = useMyDocuments();
  const updateNotes = useUpdateNotes(jobId);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(entry.notes ?? "");
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const existingOffer = documents?.find(
    (d) => d.applicationId === entry.applicationId,
  );
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const isLoading = profileLoading || summaryLoading;

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : `Candidate #${entry.candidateId.slice(0, 8)}…`;
  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";
  const tone = PIPELINE_TONES[entry.stage];

  const orderIndex = PIPELINE_ORDER.indexOf(entry.stage);
  const nextStage =
    orderIndex >= 0 && orderIndex < PIPELINE_ORDER.length - 1
      ? PIPELINE_ORDER[orderIndex + 1]
      : undefined;

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
      },
    );
  };

  const handleReject = () => {
    if (
      !window.confirm(
        `Reject ${displayName}? This moves them to the Rejected stage.`,
      )
    )
      return;
    onMove("rejected");
  };

  const canScheduleInterview =
    entry.stage !== "hired" && entry.stage !== "rejected";

  return (
    <>
      {showInterviewModal && (
        <ScheduleInterviewModal
          jobId={jobId}
          applicationId={entry.applicationId}
          candidateId={entry.candidateId}
          candidateName={displayName}
          onClose={() => setShowInterviewModal(false)}
        />
      )}
      <div className="fixed inset-0 z-40 flex justify-end">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative w-full max-w-[420px] h-full bg-surface-container border-l border-outline-variant flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0">
            <span className="text-[13px] font-bold font-label text-on-surface-variant">
              Candidate
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "22px" }}
              >
                close
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-secondary-fixed-dim/14 text-secondary-fixed-dim flex items-center justify-center shrink-0 overflow-hidden text-lg font-bold">
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[17px] font-semibold font-headline text-on-surface truncate">
                      {displayName}
                    </p>
                    <p className="text-[13px] font-body text-on-surface-variant mt-0.5 truncate">
                      {job?.title ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-4">
                  <div className="flex-1 bg-surface-container-highest border border-outline-variant rounded-[10px] px-3.5 py-3">
                    <p className="text-[10.5px] font-label uppercase tracking-wide text-on-surface-variant">
                      Match
                    </p>
                    <p className="font-mono text-lg font-semibold text-[#46D39A] mt-1">
                      {summary?.matchScore !== null &&
                      summary?.matchScore !== undefined
                        ? `${Math.round(summary.matchScore)}%`
                        : "—"}
                    </p>
                  </div>
                  <div className="flex-1 bg-surface-container-highest border border-outline-variant rounded-[10px] px-3.5 py-3">
                    <p className="text-[10.5px] font-label uppercase tracking-wide text-on-surface-variant">
                      Stage
                    </p>
                    <div className="mt-1.5">
                      <PillBadge
                        tone={tone}
                        label={PIPELINE_LABELS[entry.stage]}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4 text-[13px] font-body text-on-surface">
                  {profile?.email && (
                    <div className="flex items-center gap-2.5">
                      <span
                        className="material-symbols-outlined text-on-surface-variant"
                        style={{ fontSize: "18px" }}
                      >
                        mail
                      </span>
                      {profile.email}
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center gap-2.5">
                      <span
                        className="material-symbols-outlined text-on-surface-variant"
                        style={{ fontSize: "18px" }}
                      >
                        place
                      </span>
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <span
                      className="material-symbols-outlined text-on-surface-variant"
                      style={{ fontSize: "18px" }}
                    >
                      schedule
                    </span>
                    Applied {formatRelative(entry.movedAt)} ago
                  </div>
                </div>

                {profile && profile.skills.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant mb-2.5">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="text-[11.5px] font-body text-on-surface bg-surface-container-highest border border-outline-variant px-2.5 py-1 rounded-full"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 bg-surface-container-highest border border-outline-variant rounded-[10px] p-3.5">
                  <p className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant mb-2">
                    Summary
                  </p>
                  <p className="text-[13px] leading-relaxed font-body text-on-surface-variant">
                    {profile?.bio ||
                      summary?.skillGap ||
                      "No summary available."}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant mb-2">
                    Notes
                  </p>
                  {isEditingNotes ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        rows={3}
                        placeholder="Add notes…"
                        className="w-full bg-surface-container-highest border border-outline-variant focus:border-secondary-fixed-dim rounded-lg px-3 py-2 text-[13px] font-body text-on-surface outline-none transition-colors resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveNotes}
                          disabled={updateNotes.isPending}
                          className="text-xs font-bold font-label text-on-secondary-fixed bg-secondary-fixed-dim px-3 py-1.5 rounded-lg disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingNotes(false)}
                          className="text-xs font-bold font-label text-on-surface-variant px-3 py-1.5 rounded-lg border border-outline-variant"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startEditingNotes}
                      className="text-left w-full text-[13px] font-body text-on-surface-variant bg-surface-container-highest hover:bg-surface-container-high border border-outline-variant rounded-lg px-3 py-2.5 transition-colors"
                    >
                      {entry.notes || "Add notes…"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2.5 px-5 py-4 border-t border-outline-variant shrink-0">
            <Link
              to={ROUTES.RECRUITER_CANDIDATE_DETAIL(jobId, entry.applicationId)}
              className="flex items-center justify-center gap-2 h-[42px] rounded-[10px] bg-surface-container-highest border border-outline-variant text-on-surface font-semibold font-body text-[13.5px] hover:bg-surface-container-high transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                open_in_full
              </span>
              View full profile
            </Link>
            {existingOffer ? (
              <div className="flex items-center justify-center gap-2 h-[42px] rounded-[10px] bg-surface-container-highest border border-outline-variant">
                <span className="text-[13px] font-body text-on-surface-variant">
                  Offer:
                </span>
                <PillBadge
                  tone={DOCUMENT_STATUS_TONES[existingOffer.status]}
                  label={DOCUMENT_STATUS_LABELS[existingOffer.status]}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setOfferModalOpen(true)}
                className="flex items-center justify-center gap-2 h-[42px] rounded-[10px] bg-secondary-fixed-dim/12 border border-secondary-fixed-dim/40 text-secondary-fixed-dim font-semibold font-body text-[13.5px] hover:bg-secondary-fixed-dim/18 transition-colors"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  draw
                </span>
                Send offer letter
              </button>
            )}
            {canScheduleInterview && (
              <button
                type="button"
                onClick={() => setShowInterviewModal(true)}
                className="flex items-center justify-center gap-2 h-[42px] rounded-[10px] bg-tertiary-container/30 border border-tertiary-container/60 text-on-tertiary-container font-semibold font-body text-[13.5px] hover:bg-tertiary-container/50 transition-colors"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  video_call
                </span>
                Schedule Interview
              </button>
            )}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => nextStage && onMove(nextStage)}
                disabled={!nextStage || isMoving}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[10px] bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[13.5px] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  arrow_forward
                </span>
                Advance stage
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={entry.stage === "rejected" || isMoving}
                title="Reject candidate"
                className="w-11 h-11 flex items-center justify-center rounded-[10px] bg-surface-container-highest border border-outline-variant text-error hover:bg-error-container transition-colors disabled:opacity-40"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "19px" }}
                >
                  close
                </span>
              </button>
            </div>
          </div>
        </div>

        {offerModalOpen && (
          <SendOfferModal
            applicationId={entry.applicationId}
            onClose={() => setOfferModalOpen(false)}
          />
        )}
      </div>
    </>
  );
}
