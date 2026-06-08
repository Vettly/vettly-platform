import type { PipelineStage, PipelineStageName } from "../../../types/job.types";

const HAPPY_PATH: { stage: PipelineStageName; label: string }[] = [
  { stage: "applied", label: "Applied" },
  { stage: "screening", label: "Screening" },
  { stage: "matched", label: "Matched" },
  { stage: "interview", label: "Interview" },
  { stage: "offer", label: "Offer" },
  { stage: "hired", label: "Hired" },
];

const STAGE_LABELS: Record<PipelineStageName, string> = {
  applied: "Applied",
  screening: "Screening",
  matched: "Matched",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

interface ApplicationProgressProps {
  stage: PipelineStage | null;
}

export function ApplicationProgress({ stage }: ApplicationProgressProps) {
  const current: PipelineStageName = stage?.stage ?? "applied";

  if (current === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-error-container px-4 py-3 text-on-error-container">
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
          cancel
        </span>
        <p className="text-sm font-bold font-label">
          This application was not successful.
        </p>
      </div>
    );
  }

  const currentIndex = HAPPY_PATH.findIndex((s) => s.stage === current);

  return (
    <div className="flex items-center">
      {HAPPY_PATH.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === HAPPY_PATH.length - 1;

        return (
          <div key={step.stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors
                  ${
                    isComplete || isCurrent
                      ? "bg-secondary text-on-secondary"
                      : "bg-surface-container-high text-on-surface-variant"
                  }
                `}
              >
                {isComplete ? (
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    check
                  </span>
                ) : (
                  <span className="text-xs font-bold font-label">{index + 1}</span>
                )}
              </div>
              <span
                className={`
                  text-xs font-label whitespace-nowrap
                  ${isCurrent ? "font-bold text-on-surface" : "text-on-surface-variant"}
                `}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div
                className={`
                  h-0.5 flex-1 mx-2 rounded-full transition-colors
                  ${isComplete ? "bg-secondary" : "bg-surface-container-high"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { STAGE_LABELS };
