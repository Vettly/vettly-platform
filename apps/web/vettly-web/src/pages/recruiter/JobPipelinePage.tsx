import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useJob } from "../../api/job/job.api";
import { usePipeline, useMoveToStage } from "../../api/job/pipeline.api";
import { CandidateCard, STAGES } from "./components/CandidateCard";
import { ROUTES } from "../../router/routes";
import type { PipelineStage, PipelineStageName } from "../../types/job.types";

const STAGE_ACCENTS: Record<PipelineStageName, string> = {
  applied: "bg-on-surface-variant",
  screening: "bg-secondary",
  matched: "bg-primary",
  interview: "bg-tertiary",
  offer: "bg-tertiary",
  hired: "bg-tertiary",
  rejected: "bg-error",
};

export default function JobPipelinePage() {
  const { jobId = "" } = useParams<{ jobId: string }>();
  const { data: job } = useJob(jobId);
  const { data: pipeline, isLoading } = usePipeline(jobId);
  const moveToStage = useMoveToStage(jobId);
  const [collapsed, setCollapsed] = useState<Set<PipelineStageName>>(new Set());
  const [focused, setFocused] = useState<PipelineStageName | null>(null);

  const entries = pipeline ?? [];

  const toggleCollapsed = (stage: PipelineStageName) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) {
        next.delete(stage);
      } else {
        next.add(stage);
        if (focused === stage) setFocused(null);
      }
      return next;
    });
  };

  const toggleFocus = (stage: PipelineStageName) => {
    setFocused((prev) => (prev === stage ? null : stage));
  };

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
    <div className="h-full flex flex-col p-6 lg:p-8 overflow-hidden">
      {/* Page header */}
      <div className="mb-4 shrink-0">
        <Link
          to={ROUTES.RECRUITER_JOBS}
          className="inline-flex items-center gap-1.5 text-sm font-bold font-label text-secondary hover:underline mb-3"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
          Back to jobs
        </Link>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold font-headline text-on-surface">
              {job ? job.title : "Pipeline"}
            </h1>
            <p className="text-on-surface-variant font-body text-sm mt-1">
              Track and move candidates through your hiring pipeline.
            </p>
          </div>
          <p className="text-xs font-bold font-label text-on-surface-variant bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-full shrink-0">
            {entries.length} {entries.length === 1 ? "candidate" : "candidates"}
          </p>
        </div>

        {/* Funnel overview bar — click a segment to zoom into that stage */}
        {entries.length > 0 && (
          <div className="flex h-2.5 rounded-full overflow-hidden mt-4 bg-surface-container-low">
            {STAGES.map(({ key, label }) => {
              const count = entries.filter((e) => e.stage === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  type="button"
                  title={`${label}: ${count} — click to focus`}
                  onClick={() => {
                    if (collapsed.has(key)) toggleCollapsed(key);
                    toggleFocus(key);
                  }}
                  className={`${STAGE_ACCENTS[key]} h-full transition-opacity hover:opacity-80 ${
                    focused && focused !== key ? "opacity-40" : ""
                  }`}
                  style={{ width: `${(count / entries.length) * 100}%` }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Kanban board */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex gap-2 lg:gap-3">
          {STAGES.map(({ key, label }) => {
            const stageEntries = entries.filter((e) => e.stage === key);
            const isCollapsed = collapsed.has(key);

            if (isCollapsed) {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCollapsed(key)}
                  title={`Expand ${label}`}
                  className="bg-surface-container-low rounded-2xl border border-outline-variant w-10 shrink-0 flex flex-col items-center gap-3 py-4 hover:bg-surface-container transition-all duration-300"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${STAGE_ACCENTS[key]}`} />
                  <span className="text-xs font-bold font-label text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-full">
                    {stageEntries.length}
                  </span>
                  <span
                    className="font-headline font-bold text-on-surface text-sm whitespace-nowrap [writing-mode:vertical-rl] rotate-180"
                  >
                    {label}
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant mt-auto" style={{ fontSize: "16px" }}>
                    chevron_right
                  </span>
                </button>
              );
            }

            const isFocused = focused === key;
            const flexGrow = isFocused ? 5 : focused ? 0.6 : 1;

            return (
              <div
                key={key}
                style={{ flexGrow, flexBasis: 0 }}
                className={`bg-surface-container-low rounded-2xl border min-w-0 flex flex-col min-h-0 transition-all duration-300 ${
                  isFocused ? "border-secondary shadow-md" : "border-outline-variant"
                }`}
              >
                <div className="flex items-center gap-2 px-3 py-3 border-b border-outline-variant shrink-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${STAGE_ACCENTS[key]}`} />
                  <button
                    type="button"
                    onClick={() => toggleFocus(key)}
                    title={isFocused ? "Reset layout" : `Focus ${label}`}
                    className="font-headline font-bold text-on-surface text-sm flex-1 truncate text-left hover:text-secondary transition-colors"
                  >
                    {label}
                  </button>
                  <span className="text-xs font-bold font-label text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full shrink-0">
                    {stageEntries.length}
                  </span>
                  {isFocused && (
                    <button
                      type="button"
                      onClick={() => setFocused(null)}
                      title="Reset layout"
                      className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-surface-container-high text-secondary transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        close_fullscreen
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(key)}
                    title={`Collapse ${label}`}
                    className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      chevron_left
                    </span>
                  </button>
                </div>
                <div className="p-2 lg:p-3 space-y-2 lg:space-y-3 flex-1 min-h-0 overflow-y-auto">
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
