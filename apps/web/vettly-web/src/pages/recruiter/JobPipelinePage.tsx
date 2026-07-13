import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useJob } from "../../api/job/job.api";
import { usePipeline, useMoveToStage } from "../../api/job/pipeline.api";
import { PipelineCandidateCard } from "./components/PipelineCandidateCard";
import { CandidateDrawer } from "./components/CandidateDrawer";
import { JOB_STATUS_LABELS, PIPELINE_ORDER, PIPELINE_TONES } from "../../utils/tones";
import { ROUTES } from "../../router/routes";
import type { JobStatus, PipelineStage, PipelineStageName } from "../../types/job.types";

const COLUMNS: { key: PipelineStageName; label: string }[] = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "matched", label: "Matched" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
];

export default function JobPipelinePage() {
  const { jobId = "" } = useParams<{ jobId: string }>();
  const { data: job } = useJob(jobId);
  const { data: pipeline, isLoading } = usePipeline(jobId);
  const moveToStage = useMoveToStage(jobId);
  const [drawerEntry, setDrawerEntry] = useState<PipelineStage | null>(null);

  const entries = pipeline ?? [];

  const handleMove = (entry: PipelineStage, stage: PipelineStageName) => {
    moveToStage.mutate(
      { applicationId: entry.applicationId, candidateId: entry.candidateId, stage },
      {
        onSuccess: (updated) => {
          toast.success("Candidate moved");
          setDrawerEntry((prev) => (prev?.id === entry.id ? updated : prev));
        },
        onError: () => toast.error("Failed to move candidate"),
      }
    );
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8 overflow-hidden">
      {/* Page header */}
      <div className="flex items-center gap-3.5 mb-4 shrink-0">
        <Link
          to={ROUTES.RECRUITER_JOBS}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
          title="Back to jobs"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
        </Link>
        <div className="min-w-0">
          <h1 className="text-base font-semibold font-headline text-on-surface truncate">
            {job ? job.title : "Pipeline"}
          </h1>
          <p className="text-xs font-body text-on-surface-variant mt-0.5">
            {job
              ? `${job.applicantCount} applicant${job.applicantCount === 1 ? "" : "s"} · ${
                  JOB_STATUS_LABELS[job.status as JobStatus] ?? job.status
                }`
              : "—"}
          </p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 text-xs font-body text-on-surface-variant shrink-0">
          <span className="material-symbols-outlined text-secondary-fixed-dim" style={{ fontSize: "16px" }}>lightbulb</span>
          Tip: use the arrows on a card to move a candidate
        </div>
      </div>

      {/* Kanban board */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex gap-3 overflow-x-auto pb-2">
          {COLUMNS.map(({ key, label }) => {
            const stageEntries = entries.filter((e) => e.stage === key);
            return (
              <div
                key={key}
                className="w-[248px] shrink-0 bg-surface-container-low rounded-2xl border border-outline-variant flex flex-col min-h-0"
              >
                <div className="flex items-center gap-2 px-3.5 py-3 border-b border-outline-variant shrink-0">
                  <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: PIPELINE_TONES[key].color }} />
                  <span className="font-headline font-semibold text-on-surface text-[12.5px] flex-1 truncate">{label}</span>
                  <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full shrink-0">
                    {stageEntries.length}
                  </span>
                </div>
                <div className="p-2.5 space-y-2.5 flex-1 min-h-0 overflow-y-auto">
                  {stageEntries.length === 0 ? (
                    <p className="text-xs text-on-surface-variant font-body text-center py-6">No candidates</p>
                  ) : (
                    stageEntries.map((entry) => {
                      const idx = PIPELINE_ORDER.indexOf(entry.stage);
                      const prevStage = idx > 0 ? PIPELINE_ORDER[idx - 1] : undefined;
                      const nextStage = idx >= 0 && idx < PIPELINE_ORDER.length - 1 ? PIPELINE_ORDER[idx + 1] : undefined;
                      return (
                        <PipelineCandidateCard
                          key={entry.id}
                          entry={entry}
                          jobTitle={job?.title ?? ""}
                          onOpen={() => setDrawerEntry(entry)}
                          onMovePrev={prevStage ? () => handleMove(entry, prevStage) : undefined}
                          onMoveNext={nextStage ? () => handleMove(entry, nextStage) : undefined}
                          isMoving={moveToStage.isPending}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {drawerEntry && (
        <CandidateDrawer
          jobId={jobId}
          job={job}
          entry={drawerEntry}
          onClose={() => setDrawerEntry(null)}
          onMove={(stage) => handleMove(drawerEntry, stage)}
          isMoving={moveToStage.isPending}
        />
      )}
    </div>
  );
}
