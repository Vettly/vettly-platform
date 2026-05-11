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
