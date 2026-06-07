export const ROUTES = {
  ROOT: "/",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    CALLBACK: "/auth/callback",
  },
  CANDIDATE: "/candidate",
  CANDIDATE_JOBS: "/candidate/jobs",
  CANDIDATE_APPLICATIONS: "/candidate/applications",
  CANDIDATE_PROFILE: "/candidate/profile",
  RECRUITER: "/recruiter",
  RECRUITER_JOBS: "/recruiter/jobs",
  RECRUITER_JOB_PIPELINE: (id: string) => `/recruiter/jobs/${id}/pipeline`,
  RECRUITER_ORGANIZATION: "/recruiter/organization",
  UNAUTHORIZED: "/unauthorized",
} as const;
