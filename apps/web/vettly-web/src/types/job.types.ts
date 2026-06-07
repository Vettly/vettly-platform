export interface JobSkill {
  id: string;
  name: string;
  isRequired: boolean;
}

export interface JobSummary {
  id: string;
  title: string;
  companyName: string | null;
  location: string | null;
  jobType: string;
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  status: string;
  createdAt: string;
  applicantCount: number;
  skills: JobSkill[];
}

export interface Job extends JobSummary {
  description: string;
  recruiterId: string;
  organizationId: string | null;
  updatedAt: string;
}

export type JobStatus = "draft" | "open" | "closed" | "archived";

export interface JobSkillRequest {
  name: string;
  isRequired: boolean;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  location?: string;
  jobType: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: JobSkillRequest[];
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: JobSkillRequest[];
}

export type PipelineStageName =
  | "applied"
  | "screening"
  | "matched"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export interface PipelineStage {
  id: string;
  jobId: string;
  applicationId: string;
  candidateId: string;
  stage: PipelineStageName;
  notes: string | null;
  movedBy: string | null;
  movedAt: string;
}

export interface MovePipelineRequest {
  applicationId: string;
  candidateId: string;
  stage: PipelineStageName;
  notes?: string;
}
