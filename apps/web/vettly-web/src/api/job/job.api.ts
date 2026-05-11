import { useQuery } from "@tanstack/react-query";
import { createClient } from "../client";
import type { Job, JobSummary } from "../../types/job.types";

const client = createClient(import.meta.env.VITE_JOB_API_URL);

export const jobKeys = {
  all: ["jobs"] as const,
  list: (filters?: JobFilters) => ["jobs", "list", filters] as const,
  detail: (id: string) => ["jobs", id] as const,
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
