import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../client";
import { CANDIDATE_ENDPOINTS } from "./endpoints";
import type {
  Application,
  CandidateProfile,
  CreateProfileRequest,
  Education,
  EducationRequest,
  Experience,
  ExperienceRequest,
  Resume,
  Skill,
  SkillRequest,
  UpdateProfileRequest,
} from "../../types/candidate.types";

const client = createClient(import.meta.env.VITE_CANDIDATE_API_URL);

export const candidateKeys = {
  profile: ["candidate", "profile"] as const,
  experience: ["candidate", "experience"] as const,
  education: ["candidate", "education"] as const,
  skills: ["candidate", "skills"] as const,
  resumes: ["candidate", "resumes"] as const,
  applications: ["candidate", "applications"] as const,
  application: (id: string) => ["candidate", "application", id] as const,
};

// ─── Profile ────────────────────────────────────────────────────────────────

export const useProfile = () =>
  useQuery({
    queryKey: candidateKeys.profile,
    queryFn: async () => {
      const res = await client.get<CandidateProfile>(
        CANDIDATE_ENDPOINTS.PROFILE
      );
      return res.data;
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });

export const useCreateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProfileRequest) => {
      const res = await client.post<CandidateProfile>(
        CANDIDATE_ENDPOINTS.PROFILE,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.profile });
    },
  });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const res = await client.put<CandidateProfile>(
        CANDIDATE_ENDPOINTS.PROFILE,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.profile });
    },
  });
};

export const useUploadAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await client.post<{ avatarUrl: string }>(
        CANDIDATE_ENDPOINTS.PROFILE_AVATAR,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.profile });
    },
  });
};

// ─── Experience ──────────────────────────────────────────────────────────────

export const useExperience = () =>
  useQuery({
    queryKey: candidateKeys.experience,
    queryFn: async () => {
      const res = await client.get<Experience[]>(CANDIDATE_ENDPOINTS.EXPERIENCE);
      return res.data;
    },
  });

export const useAddExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ExperienceRequest) => {
      const res = await client.post<Experience>(
        CANDIDATE_ENDPOINTS.EXPERIENCE,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.experience });
    },
  });
};

export const useUpdateExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExperienceRequest }) => {
      const res = await client.put<Experience>(
        CANDIDATE_ENDPOINTS.EXPERIENCE_BY_ID(id),
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.experience });
    },
  });
};

export const useDeleteExperience = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(CANDIDATE_ENDPOINTS.EXPERIENCE_BY_ID(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.experience });
    },
  });
};

// ─── Education ───────────────────────────────────────────────────────────────

export const useEducation = () =>
  useQuery({
    queryKey: candidateKeys.education,
    queryFn: async () => {
      const res = await client.get<Education[]>(CANDIDATE_ENDPOINTS.EDUCATION);
      return res.data;
    },
  });

export const useAddEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: EducationRequest) => {
      const res = await client.post<Education>(
        CANDIDATE_ENDPOINTS.EDUCATION,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.education });
    },
  });
};

export const useUpdateEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EducationRequest }) => {
      const res = await client.put<Education>(
        CANDIDATE_ENDPOINTS.EDUCATION_BY_ID(id),
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.education });
    },
  });
};

export const useDeleteEducation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(CANDIDATE_ENDPOINTS.EDUCATION_BY_ID(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.education });
    },
  });
};

// ─── Skills ──────────────────────────────────────────────────────────────────

export const useSkills = () =>
  useQuery({
    queryKey: candidateKeys.skills,
    queryFn: async () => {
      const res = await client.get<Skill[]>(CANDIDATE_ENDPOINTS.SKILLS);
      return res.data;
    },
  });

export const useAddSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: SkillRequest) => {
      const res = await client.post<Skill>(CANDIDATE_ENDPOINTS.SKILLS, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.skills });
    },
  });
};

export const useDeleteSkill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(CANDIDATE_ENDPOINTS.SKILL_BY_ID(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.skills });
    },
  });
};

// ─── Resumes ─────────────────────────────────────────────────────────────────

export const useResumes = () =>
  useQuery({
    queryKey: candidateKeys.resumes,
    queryFn: async () => {
      const res = await client.get<Resume[]>(CANDIDATE_ENDPOINTS.RESUME);
      return res.data;
    },
  });

export const useUploadResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await client.post<Resume>(CANDIDATE_ENDPOINTS.RESUME, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.resumes });
    },
  });
};

export const useDeleteResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete(CANDIDATE_ENDPOINTS.RESUME_BY_ID(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.resumes });
    },
  });
};

export const useSetPrimaryResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.patch(CANDIDATE_ENDPOINTS.RESUME_PRIMARY(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.resumes });
    },
  });
};

// ─── Applications ────────────────────────────────────────────────────────────

export const useApplications = () =>
  useQuery({
    queryKey: candidateKeys.applications,
    queryFn: async () => {
      const res = await client.get<Application[]>(
        CANDIDATE_ENDPOINTS.APPLICATIONS
      );
      return res.data;
    },
  });

export const useApplication = (id: string) =>
  useQuery({
    queryKey: candidateKeys.application(id),
    queryFn: async () => {
      const res = await client.get<Application>(
        CANDIDATE_ENDPOINTS.APPLICATION_BY_ID(id)
      );
      return res.data;
    },
    enabled: !!id,
  });
