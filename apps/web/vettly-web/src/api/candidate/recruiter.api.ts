import { useQuery } from "@tanstack/react-query";
import { createClient } from "../client";
import { CANDIDATE_ENDPOINTS } from "./endpoints";
import type {
  ApplicationSummary,
  CandidateProfile,
} from "../../types/candidate.types";

const client = createClient(import.meta.env.VITE_CANDIDATE_API_URL);

export const recruiterCandidateKeys = {
  profile: (candidateId: string) =>
    ["candidate", "recruiter-profile", candidateId] as const,
  applicationSummary: (applicationId: string) =>
    ["candidate", "application-summary", applicationId] as const,
};

export const useCandidateProfile = (candidateId: string) =>
  useQuery({
    queryKey: recruiterCandidateKeys.profile(candidateId),
    queryFn: async () => {
      const res = await client.get<CandidateProfile>(
        CANDIDATE_ENDPOINTS.CANDIDATE_PROFILE(candidateId)
      );
      return res.data;
    },
    enabled: !!candidateId,
  });

export const useApplicationSummary = (applicationId: string) =>
  useQuery({
    queryKey: recruiterCandidateKeys.applicationSummary(applicationId),
    queryFn: async () => {
      const res = await client.get<ApplicationSummary>(
        CANDIDATE_ENDPOINTS.APPLICATION_SUMMARY(applicationId)
      );
      return res.data;
    },
    enabled: !!applicationId,
  });
