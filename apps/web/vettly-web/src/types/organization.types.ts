export interface OrganizationMember {
  recruiterId: string;
  role: string;
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  companySize: string | null;
  location: string | null;
  linkedInUrl: string | null;
  twitterUrl: string | null;
  createdAt: string;
  joinCode: string | null;
  members: OrganizationMember[];
}

export interface OrganizationSearchResult {
  id: string;
  name: string;
  industry: string | null;
  logoUrl: string | null;
  location: string | null;
  companySize: string | null;
  memberCount: number;
}

export interface CreateOrganizationRequest {
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  companySize?: string;
  location?: string;
  linkedInUrl?: string;
  twitterUrl?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  industry?: string;
  description?: string;
  website?: string;
  companySize?: string;
  location?: string;
  linkedInUrl?: string;
  twitterUrl?: string;
}
