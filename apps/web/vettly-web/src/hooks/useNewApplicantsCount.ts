import { useQueries } from "@tanstack/react-query";
import { createClient } from "../api/client";
import { useMyJobs } from "../api/job/job.api";
import { pipelineKeys } from "../api/job/pipeline.api";
import { useNavBadgeCount } from "./useNavBadgeCount";
import type { PipelineStage } from "../types/job.types";

const jobClient = createClient(import.meta.env.VITE_JOB_API_URL);

export function useNewApplicantsCount(): number {
  const { data: jobs } = useMyJobs();
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

  const appliedTimestamps = pipelineQueries.flatMap(
    (q) => q.data?.filter((entry) => entry.stage === "applied").map((entry) => entry.movedAt) ?? []
  );

  return useNavBadgeCount("recruiterJobs", appliedTimestamps);
}
