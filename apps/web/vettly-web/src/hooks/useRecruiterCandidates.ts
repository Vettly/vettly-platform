import { useQueries } from "@tanstack/react-query";
import { createClient } from "../api/client";
import { CANDIDATE_ENDPOINTS } from "../api/candidate/endpoints";
import { useMyJobs } from "../api/job/job.api";
import type {
  ApplicationSummary,
  CandidateProfile,
} from "../types/candidate.types";
import type { JobSummary, PipelineStage } from "../types/job.types";

const jobClient = createClient(import.meta.env.VITE_JOB_API_URL);
const candidateClient = createClient(import.meta.env.VITE_CANDIDATE_API_URL);

export interface RecruiterCandidateRow {
  entry: PipelineStage;
  job: JobSummary;
  profile?: CandidateProfile;
  summary?: ApplicationSummary;
}

export function useRecruiterCandidates(): {
  isLoading: boolean;
  rows: RecruiterCandidateRow[];
} {
  const { data: jobs, isLoading: jobsLoading } = useMyJobs();
  const jobList = jobs ?? [];

  const pipelineQueries = useQueries({
    queries: jobList.map((job) => ({
      queryKey: ["pipeline", job.id, undefined] as const,
      queryFn: async () => {
        const res = await jobClient.get<PipelineStage[]>(`/api/jobs/${job.id}/pipeline`);
        return res.data;
      },
    })),
  });

  const pipelineLoading = pipelineQueries.some((q) => q.isLoading);

  const entries: { entry: PipelineStage; job: JobSummary }[] = [];
  jobList.forEach((job, i) => {
    const data = pipelineQueries[i]?.data ?? [];
    data.forEach((entry) => entries.push({ entry, job }));
  });

  const profileQueries = useQueries({
    queries: entries.map(({ entry }) => ({
      queryKey: ["candidate", "recruiter-profile", entry.candidateId] as const,
      queryFn: async () => {
        const res = await candidateClient.get<CandidateProfile>(
          CANDIDATE_ENDPOINTS.CANDIDATE_PROFILE(entry.candidateId)
        );
        return res.data;
      },
      enabled: !!entry.candidateId,
    })),
  });

  const summaryQueries = useQueries({
    queries: entries.map(({ entry }) => ({
      queryKey: ["candidate", "application-summary", entry.applicationId] as const,
      queryFn: async () => {
        const res = await candidateClient.get<ApplicationSummary>(
          CANDIDATE_ENDPOINTS.APPLICATION_SUMMARY(entry.applicationId)
        );
        return res.data;
      },
      enabled: !!entry.applicationId,
    })),
  });

  const detailsLoading =
    profileQueries.some((q) => q.isLoading) || summaryQueries.some((q) => q.isLoading);

  const rows: RecruiterCandidateRow[] = entries.map(({ entry, job }, i) => ({
    entry,
    job,
    profile: profileQueries[i]?.data,
    summary: summaryQueries[i]?.data,
  }));

  return {
    isLoading: jobsLoading || pipelineLoading || (entries.length > 0 && detailsLoading),
    rows,
  };
}
