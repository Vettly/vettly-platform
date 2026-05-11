export interface CandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  linkedInUrl: string | null;
  gitHubUrl: string | null;
  portfolioUrl: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  resumes: Resume[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  createdAt: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
  gpa: number | null;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  level: string | null;
  createdAt: string;
}

export interface Resume {
  id: string;
  fileName: string;
  s3Url: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "interview"
  | "rejected"
  | "accepted";

export interface Application {
  id: string;
  jobId: string;
  resumeId: string;
  status: ApplicationStatus;
  aiScore: number | null;
  biasFlagged: boolean;
  matchScore: number | null;
  appliedAt: string;
  updatedAt: string;
}

export interface CreateProfileRequest {
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
  portfolioUrl?: string;
}

export interface UpdateProfileRequest {
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
  portfolioUrl?: string;
  avatarUrl?: string;
}

export interface ExperienceRequest {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface EducationRequest {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
}

export interface SkillRequest {
  name: string;
  level?: string;
}
