import type { CandidateProfile } from "../../types/candidate.types";

export function computeCompleteness(profile: CandidateProfile | undefined) {
  const checks: Record<string, boolean> = {
    headline: !!profile?.headline,
    bio: !!profile?.bio,
    experience: (profile?.experiences.length ?? 0) > 0,
    education: (profile?.educations.length ?? 0) > 0,
    skills: (profile?.skills.length ?? 0) > 0,
    resume: (profile?.resumes.length ?? 0) > 0,
  };
  const done = Object.values(checks).filter(Boolean).length;
  return { pct: Math.round((done / 6) * 100), checks };
}
