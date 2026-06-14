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
  workArrangement: string | null;
  applicationDeadline: string | null;
  description: string;
  benefits: string | null;
  skills: JobSkill[];
}

export interface Job extends JobSummary {
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
  workArrangement?: string;
  benefits?: string;
  applicationDeadline?: string;
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
  workArrangement?: string;
  benefits?: string;
  applicationDeadline?: string;
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

export interface JobApplicantBreakdown {
  id: string;
  title: string;
  applicantCount: number;
  stageBreakdown: Record<string, number>;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface JobStats {
  totalJobs: number;
  openJobs: number;
  totalApplicants: number;
  pipelineFunnel: Record<string, number>;
  perJobBreakdown: JobApplicantBreakdown[];
  applicationsOverTime: TimeSeriesPoint[];
}
