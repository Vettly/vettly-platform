import { ROUTES } from "../router/routes";

export function buildMessagesLink(
  role: "candidate" | "recruiter",
  applicationId: string
): string {
  const base =
    role === "candidate" ? ROUTES.CANDIDATE_MESSAGES : ROUTES.RECRUITER_MESSAGES;
  return `${base}?applicationId=${applicationId}`;
}
