import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../client";
import type { CreateInterviewRequest, Interview } from "../../types/interview.types";

const client = createClient(import.meta.env.VITE_INTERVIEW_API_URL);

export const interviewKeys = {
  all: ["interviews"] as const,
  mine: () => ["interviews", "mine"] as const,
  detail: (id: string) => ["interviews", id] as const,
};

export const useInterviews = () =>
  useQuery({
    queryKey: interviewKeys.mine(),
    queryFn: async () => {
      const res = await client.get<Interview[]>("/api/interviews");
      return res.data;
    },
  });

export const useInterview = (id: string) =>
  useQuery({
    queryKey: interviewKeys.detail(id),
    queryFn: async () => {
      const res = await client.get<Interview>(`/api/interviews/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useCreateInterview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInterviewRequest) => {
      const res = await client.post<Interview>("/api/interviews", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: interviewKeys.all });
    },
  });
};

export const useCancelInterview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(`/api/interviews/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: interviewKeys.all });
    },
  });
};
