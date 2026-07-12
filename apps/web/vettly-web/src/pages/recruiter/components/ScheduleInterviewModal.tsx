import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateInterview } from "../../../api/interview/interview.api";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  jobId: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  onClose: () => void;
}

export function ScheduleInterviewModal({
  jobId,
  applicationId,
  candidateId,
  candidateName,
  onClose,
}: Readonly<Props>) {
  const qc = useQueryClient();
  const createInterview = useCreateInterview();

  const defaultTitle = `Interview — ${candidateName}`;
  const [title, setTitle] = useState(defaultTitle);
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt || !meetingLink.trim()) return;

    createInterview.mutate(
      {
        candidateId,
        jobId,
        applicationId,
        title,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes,
        notes: notes || undefined,
        meetingLink: meetingLink.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Interview scheduled");
          qc.invalidateQueries({ queryKey: ["pipeline", jobId] });
          onClose();
        },
        onError: () => {
          toast.error("Failed to schedule interview. Please try again.");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-container rounded-2xl shadow-xl border border-outline-variant">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
          <h2 className="text-[15px] font-semibold font-headline text-on-surface">
            Schedule Interview
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2.5 text-[13px] font-body text-on-surface outline-none focus:border-secondary-fixed-dim transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2.5 text-[13px] font-body text-on-surface outline-none focus:border-secondary-fixed-dim transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant">
              Duration
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2.5 text-[13px] font-body text-on-surface outline-none focus:border-secondary-fixed-dim transition-colors"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant">
              Meeting Link
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              required
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              className="bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2.5 text-[13px] font-body text-on-surface outline-none focus:border-secondary-fixed-dim transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-label uppercase tracking-wide text-on-surface-variant">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any notes for the interview…"
              className="bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2.5 text-[13px] font-body text-on-surface outline-none focus:border-secondary-fixed-dim transition-colors resize-none"
            />
          </div>

          <p className="text-[11.5px] font-body text-on-surface-variant">
            Paste your meeting link (Zoom, Google Meet, Teams, etc.) — the candidate will see it on their Interviews page.
          </p>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[42px] rounded-[10px] border border-outline-variant text-on-surface-variant font-semibold font-body text-[13.5px] hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createInterview.isPending}
              className="flex-1 h-[42px] flex items-center justify-center gap-2 rounded-[10px] bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[13.5px] hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>video_call</span>
              {createInterview.isPending ? "Scheduling…" : "Schedule Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
