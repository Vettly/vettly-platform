import { Link, useParams } from "react-router-dom";
import { useApplication } from "../../api/candidate/candidate.api";
import { useApplicationStage, useJob } from "../../api/job/job.api";
import { PillBadge } from "../../components/PillBadge";
import { buildMessagesLink } from "../../utils/messagingLinks";
import { PIPELINE_LABELS, PIPELINE_ORDER, PIPELINE_TONES } from "../../utils/tones";
import { formatDate } from "../../utils/format";
import { ROUTES } from "../../router/routes";
import type { PipelineStageName } from "../../types/job.types";

const STAGE_NOTES: Record<PipelineStageName, string> = {
  applied: "Application received",
  screening: "Resume reviewed by recruiter",
  matched: "Shortlisted as a strong match",
  interview: "Interview scheduled",
  offer: "Offer extended",
  hired: "Welcome aboard",
  rejected: "Application was not successful",
};

export default function CandidateApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: application, isLoading: appLoading, isError: appError } = useApplication(applicationId ?? "");
  const { data: job, isLoading: jobLoading } = useJob(application?.jobId ?? "");
  const { data: pipelineStage } = useApplicationStage(application?.jobId ?? "", applicationId ?? "");

  if (appLoading || jobLoading) {
    return (
      <div className="p-6 lg:p-8 flex flex-col gap-4 max-w-3xl mx-auto w-full">
        <div className="bg-surface-container-high animate-pulse rounded-xl h-12" />
        <div className="bg-surface-container-high animate-pulse rounded-xl h-72" />
      </div>
    );
  }

  if (appError || !application) {
    return (
      <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <span className="material-symbols-outlined text-error" style={{ fontSize: "48px" }}>error</span>
        <h2 className="text-xl font-bold font-headline text-on-surface">Application not found</h2>
        <Link to={ROUTES.CANDIDATE_APPLICATIONS} className="text-sm font-bold font-label text-secondary hover:underline">
          Back to My Applications
        </Link>
      </div>
    );
  }

  const stage: PipelineStageName = pipelineStage?.stage ?? "applied";
  const tone = PIPELINE_TONES[stage];
  const isRejected = stage === "rejected";
  const currentIndex = isRejected ? -1 : PIPELINE_ORDER.indexOf(stage);

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <Link
          to={ROUTES.CANDIDATE_APPLICATIONS}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold font-headline text-on-surface truncate">
            {job ? job.title : `Job #${application.jobId.slice(0, 8)}…`}
          </div>
          <div className="text-xs font-body text-on-surface-variant mt-0.5">
            {job?.companyName ?? "—"}
            {application.matchScore != null && ` · ${Math.round(application.matchScore)}% match`}
          </div>
        </div>
        <PillBadge tone={tone} label={PIPELINE_LABELS[stage]} />
      </div>

      <Link
        to={buildMessagesLink("candidate", application.id)}
        className="flex items-center justify-center gap-2 h-11 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>forum</span>
        <span>Message recruiter</span>
      </Link>

      {/* Status timeline */}
      <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6">
        <div className="text-sm font-semibold font-headline text-on-surface mb-5">Status timeline</div>

        <div className="flex flex-col">
          {isRejected ? (
            <>
              <TimelineItem
                icon="check"
                color="#46D39A"
                bg="rgba(70,211,154,.14)"
                line="#46D39A"
                title="Applied"
                titleClass="text-on-surface"
                note={STAGE_NOTES.applied}
                date={formatDate(application.appliedAt)}
                isLast={false}
              />
              <TimelineItem
                icon="close"
                color="#FF8A8A"
                bg="rgba(242,97,107,.12)"
                line="transparent"
                title="Rejected"
                titleClass="text-on-surface"
                note={pipelineStage?.notes || STAGE_NOTES.rejected}
                date={pipelineStage ? formatDate(pipelineStage.movedAt) : "—"}
                isLast
              />
            </>
          ) : (
            PIPELINE_ORDER.map((s, i) => {
              const done = s === "hired" ? i <= currentIndex : i < currentIndex;
              const isCurrent = s !== "hired" && i === currentIndex;

              let icon = "radio_button_unchecked";
              let color = "var(--color-outline)";
              let bg = "transparent";
              if (done) {
                icon = "check";
                color = "#46D39A";
                bg = "rgba(70,211,154,.14)";
              } else if (isCurrent) {
                icon = "radio_button_checked";
                color = "#F4A340";
                bg = "rgba(244,163,64,.14)";
              }

              let date = "—";
              if (i === 0) date = formatDate(application.appliedAt);
              else if (i === currentIndex && pipelineStage) date = formatDate(pipelineStage.movedAt);

              return (
                <TimelineItem
                  key={s}
                  icon={icon}
                  color={color}
                  bg={bg}
                  line={i < currentIndex ? "#46D39A" : undefined}
                  title={PIPELINE_LABELS[s]}
                  titleClass={i <= currentIndex ? "text-on-surface" : "text-on-surface-variant"}
                  note={i === currentIndex && pipelineStage?.notes ? pipelineStage.notes : STAGE_NOTES[s]}
                  date={date}
                  isLast={i === PIPELINE_ORDER.length - 1}
                />
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

interface TimelineItemProps {
  icon: string;
  color: string;
  bg: string;
  line?: string;
  title: string;
  titleClass: string;
  note: string;
  date: string;
  isLast: boolean;
}

function TimelineItem({ icon, color, bg, line, title, titleClass, note, date, isLast }: Readonly<TimelineItemProps>) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0"
          style={{ borderColor: color, background: bg }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px", color }}>{icon}</span>
        </div>
        {!isLast && (
          <div
            className="w-0.5 flex-1 min-h-6"
            style={{ background: line ?? "var(--color-outline-variant)" }}
          />
        )}
      </div>
      <div className={`flex-1 ${isLast ? "" : "pb-5.5"}`}>
        <div className={`text-[13.5px] font-semibold font-headline ${titleClass}`}>{title}</div>
        <div className="text-xs font-body text-on-surface-variant mt-0.5">{note}</div>
      </div>
      <div className="font-mono text-xs text-on-surface-variant pt-1 shrink-0">{date}</div>
    </div>
  );
}
