export const ROUTES = {
  ROOT: "/",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    CALLBACK: "/auth/callback",
  },
  CANDIDATE: "/candidate",
  CANDIDATE_APPLICATIONS: "/candidate/applications",
  CANDIDATE_PROFILE: "/candidate/profile",
  RECRUITER: "/recruiter",
  UNAUTHORIZED: "/unauthorized",
} as const;
