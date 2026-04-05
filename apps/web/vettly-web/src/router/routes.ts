export const ROUTES = {
  ROOT: "/",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    CALLBACK: "/auth/callback",
  },
  CANDIDATE: "/candidate",
  RECRUITER: "/recruiter",
  UNAUTHORIZED: "/unauthorized",
} as const;
