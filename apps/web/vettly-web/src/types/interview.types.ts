export type InterviewStatus = "scheduled" | "cancelled";

export interface Interview {
  id: string;
  recruiterId: string;
  recruiterEmail: string;
  candidateId: string;
  candidateEmail: string;
  jobId: string;
  applicationId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  notes: string | null;
  status: InterviewStatus;
  meetingLink: string;
  createdAt: string;
}

export interface CreateInterviewRequest {
  candidateId: string;
  jobId: string;
  applicationId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
  meetingLink: string;
}

export function isRecentlyCreated(createdAt: string, withinMs = 24 * 60 * 60 * 1000) {
  return Date.now() - new Date(createdAt).getTime() < withinMs;
}
