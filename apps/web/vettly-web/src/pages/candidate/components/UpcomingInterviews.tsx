import { Link } from "react-router-dom";
import { useInterviews } from "../../../api/interview/interview.api";
import { useJob } from "../../../api/job/job.api";
import { ROUTES } from "../../../router/routes";
import { isRecentlyCreated, type Interview } from "../../../types/interview.types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InterviewItem({ interview }: Readonly<{ interview: Interview }>) {
  const { data: job } = useJob(interview.jobId);

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant/60 last:border-b-0">
      <div className="w-9 h-9 rounded-xl bg-tertiary-container/30 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontSize: "19px" }}>
          video_call
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold font-body text-on-surface truncate flex items-center gap-1.5">
          <span className="truncate">{job?.title ?? "Interview"}</span>
          {isRecentlyCreated(interview.createdAt) && (
            <span className="shrink-0 text-[9.5px] font-label font-semibold px-1.5 py-0.5 rounded-full bg-secondary-fixed-dim text-on-secondary-fixed">
              New
            </span>
          )}
        </p>
        <p className="text-[11.5px] font-body text-on-surface-variant mt-0.5">
          {formatDateTime(interview.scheduledAt)} · {interview.durationMinutes} min
        </p>
      </div>
      {interview.meetingLink ? (
        <a
          href={interview.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-lg bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[11.5px] hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>videocam</span>
          Join
        </a>
      ) : (
        <span className="shrink-0 text-[11px] font-body text-on-surface-variant px-2">
          No link
        </span>
      )}
    </div>
  );
}

export function UpcomingInterviews() {
  const { data: interviews, isLoading } = useInterviews();

  const upcoming = interviews
    ?.filter((i) => i.status === "scheduled" && new Date(i.scheduledAt) >= new Date())
    .slice(0, 4) ?? [];

  if (isLoading) {
    return (
      <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5 animate-pulse h-36" />
    );
  }

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-outline-variant">
        <span className="text-[13.5px] font-semibold font-headline text-on-surface">
          Upcoming Interviews
        </span>
        <Link
          to={ROUTES.CANDIDATE_INTERVIEWS}
          className="text-xs font-bold font-label text-secondary-fixed-dim hover:underline"
        >
          View all
        </Link>
      </div>
      {upcoming.map((interview) => (
        <InterviewItem key={interview.id} interview={interview} />
      ))}
    </div>
  );
}
