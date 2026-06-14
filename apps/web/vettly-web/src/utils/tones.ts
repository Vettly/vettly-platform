import type { ApplicationStatus } from "../types/candidate.types";
import type { JobStatus, PipelineStageName } from "../types/job.types";

export interface Tone {
  color: string;
  bg: string;
}

export const PIPELINE_TONES: Record<PipelineStageName, Tone> = {
  applied: { color: "#9FB0C3", bg: "rgba(159,176,195,.12)" },
  screening: { color: "#F4A340", bg: "rgba(244,163,64,.12)" },
  matched: { color: "#5BC8D4", bg: "rgba(91,200,212,.12)" },
  interview: { color: "#46D39A", bg: "rgba(70,211,154,.12)" },
  offer: { color: "#C9A0FF", bg: "rgba(201,160,255,.12)" },
  hired: { color: "#46D39A", bg: "rgba(70,211,154,.14)" },
  rejected: { color: "#FF8A8A", bg: "rgba(242,97,107,.12)" },
};

export const PIPELINE_ORDER: PipelineStageName[] = [
  "applied",
  "screening",
  "matched",
  "interview",
  "offer",
  "hired",
];

export const PIPELINE_LABELS: Record<PipelineStageName, string> = {
  applied: "Applied",
  screening: "Screening",
  matched: "Matched",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

export const APPLICATION_STATUS_TONES: Record<ApplicationStatus, Tone> = {
  applied: PIPELINE_TONES.applied,
  reviewing: PIPELINE_TONES.screening,
  interview: PIPELINE_TONES.interview,
  accepted: PIPELINE_TONES.hired,
  rejected: PIPELINE_TONES.rejected,
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  reviewing: "Reviewing",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const JOB_STATUS_TONES: Record<JobStatus, Tone> = {
  draft: { color: "#9FB0C3", bg: "rgba(159,176,195,.12)" },
  open: { color: "#46D39A", bg: "rgba(70,211,154,.12)" },
  closed: { color: "#FF8A8A", bg: "rgba(242,97,107,.12)" },
  archived: { color: "#9FB0C3", bg: "rgba(159,176,195,.12)" },
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
  archived: "Archived",
};
