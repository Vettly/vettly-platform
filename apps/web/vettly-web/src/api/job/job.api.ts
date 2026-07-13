import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../client";
import type {
  CreateJobRequest,
  Job,
  JobStats,
  JobSummary,
  PipelineStage,
  UpdateJobRequest,
} from "../../types/job.types";

const client = createClient(import.meta.env.VITE_JOB_API_URL);

export const jobKeys = {
  all: ["jobs"] as const,
  list: (filters?: JobFilters) => ["jobs", "list", filters] as const,
  detail: (id: string) => ["jobs", id] as const,
  myJobs: ["jobs", "my-jobs"] as const,
  myJobsStats: ["jobs", "my-jobs", "stats"] as const,
  applicationStage: (jobId: string, applicationId: string) =>
    ["jobs", jobId, "pipeline", "application", applicationId] as const,
};

export interface JobFilters {
  search?: string;
  jobType?: string;
  experienceLevel?: string;
}

export const useJobs = (filters?: JobFilters) =>
  useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: async () => {
      const res = await client.get<JobSummary[]>("/api/jobs", { params: filters });
      return res.data;
    },
  });

export const useJob = (id: string) =>
  useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: async () => {
      const res = await client.get<Job>(`/api/jobs/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useApplicationStage = (jobId: string, applicationId: string) =>
  useQuery({
    queryKey: jobKeys.applicationStage(jobId, applicationId),
    queryFn: async () => {
      const res = await client.get<PipelineStage>(
        `/api/jobs/${jobId}/pipeline/application/${applicationId}`
      );
      return res.data;
    },
    enabled: !!jobId && !!applicationId,
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });

// ─── Recruiter ───────────────────────────────────────────────────────────────

export const useMyJobs = () =>
  useQuery({
    queryKey: jobKeys.myJobs,
    queryFn: async () => {
      const res = await client.get<JobSummary[]>("/api/jobs/my-jobs");
      return res.data;
    },
  });

export const useMyJobsStats = () =>
  useQuery({
    queryKey: jobKeys.myJobsStats,
    queryFn: async () => {
      const res = await client.get<JobStats>("/api/jobs/my-jobs/stats");
      return res.data;
    },
  });

export const useCreateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateJobRequest) => {
      const res = await client.post<Job>("/api/jobs", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.myJobs });
    },
  });
};

export const useUpdateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateJobRequest }) => {
      const res = await client.put<Job>(`/api/jobs/${id}`, data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: jobKeys.myJobs });
      qc.invalidateQueries({ queryKey: jobKeys.detail(id) });
    },
  });
};

export const useUpdateJobStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await client.patch(`/api/jobs/${id}/status`, { status });
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: jobKeys.myJobs });
      qc.invalidateQueries({ queryKey: jobKeys.detail(id) });
    },
  });
};

export const useDeleteJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/api/jobs/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.myJobs });
    },
  });
};
