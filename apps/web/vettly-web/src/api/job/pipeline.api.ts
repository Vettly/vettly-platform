import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../client";
import type { MovePipelineRequest, PipelineStage } from "../../types/job.types";

const client = createClient(import.meta.env.VITE_JOB_API_URL);

export const pipelineKeys = {
  byJob: (jobId: string, stage?: string) =>
    ["pipeline", jobId, stage] as const,
  candidate: (jobId: string, applicationId: string) =>
    ["pipeline", jobId, "application", applicationId] as const,
};

export const usePipeline = (jobId: string, stage?: string) =>
  useQuery({
    queryKey: pipelineKeys.byJob(jobId, stage),
    queryFn: async () => {
      const res = await client.get<PipelineStage[]>(
        `/api/jobs/${jobId}/pipeline`,
        { params: stage ? { stage } : undefined }
      );
      return res.data;
    },
    enabled: !!jobId,
  });

export const useCandidateStage = (jobId: string, applicationId: string) =>
  useQuery({
    queryKey: pipelineKeys.candidate(jobId, applicationId),
    queryFn: async () => {
      const res = await client.get<PipelineStage>(
        `/api/jobs/${jobId}/pipeline/application/${applicationId}`
      );
      return res.data;
    },
    enabled: !!jobId && !!applicationId,
  });

export const useMoveToStage = (jobId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: MovePipelineRequest) => {
      const res = await client.post<PipelineStage>(
        `/api/jobs/${jobId}/pipeline/move`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pipeline", jobId] });
    },
  });
};

export const useUpdateNotes = (jobId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      notes,
    }: {
      applicationId: string;
      notes: string | null;
    }) => {
      const res = await client.patch<PipelineStage>(
        `/api/jobs/${jobId}/pipeline/application/${applicationId}/notes`,
        { notes }
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pipeline", jobId] });
    },
  });
};
