import { useQueries } from "@tanstack/react-query";
import { createClient } from "../api/client";
import { CANDIDATE_ENDPOINTS } from "../api/candidate/endpoints";
import { useMyJobs } from "../api/job/job.api";
import { pipelineKeys } from "../api/job/pipeline.api";
import { recruiterCandidateKeys } from "../api/candidate/recruiter.api";
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
      queryKey: pipelineKeys.byJob(job.id),
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

  
  const uniqueCandidateIds = Array.from(
    new Set(entries.map(({ entry }) => entry.candidateId).filter(Boolean))
  );
  const uniqueApplicationIds = Array.from(
    new Set(entries.map(({ entry }) => entry.applicationId).filter(Boolean))
  );

  const profileQueries = useQueries({
    queries: uniqueCandidateIds.map((candidateId) => ({
      queryKey: recruiterCandidateKeys.profile(candidateId),
      queryFn: async () => {
        const res = await candidateClient.get<CandidateProfile>(
          CANDIDATE_ENDPOINTS.CANDIDATE_PROFILE(candidateId)
        );
        return res.data;
      },
    })),
  });

  const summaryQueries = useQueries({
    queries: uniqueApplicationIds.map((applicationId) => ({
      queryKey: recruiterCandidateKeys.applicationSummary(applicationId),
      queryFn: async () => {
        const res = await candidateClient.get<ApplicationSummary>(
          CANDIDATE_ENDPOINTS.APPLICATION_SUMMARY(applicationId)
        );
        return res.data;
      },
    })),
  });

  const profileById = new Map(
    uniqueCandidateIds.map((id, i) => [id, profileQueries[i]?.data])
  );
  const summaryById = new Map(
    uniqueApplicationIds.map((id, i) => [id, summaryQueries[i]?.data])
  );

  const detailsLoading =
    profileQueries.some((q) => q.isLoading) || summaryQueries.some((q) => q.isLoading);

  const rows: RecruiterCandidateRow[] = entries.map(({ entry, job }) => ({
    entry,
    job,
    profile: profileById.get(entry.candidateId),
    summary: summaryById.get(entry.applicationId),
  }));

  return {
    isLoading: jobsLoading || pipelineLoading || (entries.length > 0 && detailsLoading),
    rows,
  };
}
