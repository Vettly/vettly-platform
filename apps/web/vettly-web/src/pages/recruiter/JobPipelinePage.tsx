import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useJob } from "../../api/job/job.api";
import { usePipeline, useMoveToStage } from "../../api/job/pipeline.api";
import { CandidateCard, STAGES } from "./components/CandidateCard";
import { ROUTES } from "../../router/routes";
import type { PipelineStage, PipelineStageName } from "../../types/job.types";

export default function JobPipelinePage() {
  const { jobId = "" } = useParams<{ jobId: string }>();
  const { data: job } = useJob(jobId);
  const { data: pipeline, isLoading } = usePipeline(jobId);
  const moveToStage = useMoveToStage(jobId);

  const entries = pipeline ?? [];

  const handleMove = (entry: PipelineStage, stage: PipelineStageName) => {
    if (stage === entry.stage) return;
    moveToStage.mutate(
      {
        applicationId: entry.applicationId,
        candidateId: entry.candidateId,
        stage,
      },
      {
        onSuccess: () => toast.success("Candidate moved"),
        onError: () => toast.error("Failed to move candidate"),
      }
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6">
        <Link
          to={ROUTES.RECRUITER_JOBS}
          className="inline-flex items-center gap-1.5 text-sm font-bold font-label text-secondary hover:underline mb-3"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
          Back to jobs
        </Link>
        <h1 className="text-2xl font-extrabold font-headline text-on-surface">
          {job ? job.title : "Pipeline"}
        </h1>
        <p className="text-on-surface-variant font-body text-sm mt-1">
          Track and move candidates through your hiring pipeline.
        </p>
      </div>

      {/* Kanban board */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-2xl h-64" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(({ key, label }) => {
            const stageEntries = entries.filter((e) => e.stage === key);
            return (
              <div
                key={key}
                className="bg-surface-container-low rounded-2xl border border-outline-variant w-72 shrink-0 flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
                  <h2 className="font-headline font-bold text-on-surface text-sm">{label}</h2>
                  <span className="text-xs font-bold font-label text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                    {stageEntries.length}
                  </span>
                </div>
                <div className="p-3 space-y-3 flex-1 min-h-[120px]">
                  {stageEntries.length === 0 ? (
                    <p className="text-xs text-on-surface-variant font-body text-center py-6">
                      No candidates
                    </p>
                  ) : (
                    stageEntries.map((entry) => (
                      <CandidateCard
                        key={entry.id}
                        jobId={jobId}
                        entry={entry}
                        onMove={handleMove}
                        isMoving={moveToStage.isPending}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
