import { useInterviews } from "../../api/interview/interview.api";
import { useJob } from "../../api/job/job.api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { isRecentlyCreated, type Interview } from "../../types/interview.types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InterviewCard({ interview }: Readonly<{ interview: Interview }>) {
  const { data: job } = useJob(interview.jobId);
  const isPast = new Date(interview.scheduledAt) < new Date();

  return (
    <div className="bg-surface-container border border-outline-variant rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold font-headline text-on-surface truncate">
            {job?.title ?? interview.title}
          </p>
          <p className="text-[13px] font-body text-on-surface-variant mt-0.5">
            {job?.companyName ?? ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isRecentlyCreated(interview.createdAt) && interview.status !== "cancelled" && (
            <span className="text-[10px] font-label font-semibold px-2 py-1 rounded-full bg-secondary-fixed-dim text-on-secondary-fixed">
              New
            </span>
          )}
          <span
            className={`text-[11px] font-label font-semibold px-2.5 py-1 rounded-full ${
              interview.status === "cancelled"
                ? "bg-error-container text-on-error-container"
                : isPast
                  ? "bg-surface-container-highest text-on-surface-variant"
                  : "bg-tertiary-container/40 text-on-tertiary-container"
            }`}
          >
            {interview.status === "cancelled" ? "Cancelled" : isPast ? "Completed" : "Upcoming"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-[13px] font-body text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span>
          {formatDateTime(interview.scheduledAt)}
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>timer</span>
          {interview.durationMinutes} minutes
        </div>
      </div>

      {interview.notes && (
        <p className="text-[12px] font-body text-on-surface-variant bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2">
          {interview.notes}
        </p>
      )}

      {interview.meetingLink && interview.status !== "cancelled" ? (
        <a
          href={interview.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-[42px] rounded-[10px] bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[13px] hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>video_call</span>
          Join Meeting
        </a>
      ) : interview.status !== "cancelled" ? (
        <div className="flex items-center justify-center gap-2 h-[42px] rounded-[10px] border border-outline-variant text-[13px] font-body text-on-surface-variant">
          Meeting link not available
        </div>
      ) : null}
    </div>
  );
}

export default function CandidateInterviewsPage() {
  const { data: interviews, isLoading } = useInterviews();

  const upcoming = interviews?.filter(
    (i) => i.status === "scheduled" && new Date(i.scheduledAt) >= new Date()
  ) ?? [];
  const past = interviews?.filter(
    (i) => i.status !== "scheduled" || new Date(i.scheduledAt) < new Date()
  ) ?? [];

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-[23px] font-semibold font-headline text-on-surface tracking-tight">
          My Interviews
        </h1>
        <p className="text-on-surface-variant font-body text-sm mt-1">
          Upcoming and past interviews for your applications.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : interviews?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined mb-3" style={{ fontSize: "48px" }}>video_call</span>
          <p className="font-body text-[15px]">No interviews scheduled yet.</p>
          <p className="font-body text-[13px] mt-1 text-on-surface-variant/70">
            Once a recruiter schedules an interview, it will appear here.
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-label uppercase tracking-wide text-on-surface-variant">
                Upcoming
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-[13px] font-label uppercase tracking-wide text-on-surface-variant">
                Past
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
