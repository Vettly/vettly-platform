export interface Organization {
  id: string;
  name: string;
  industry: string | null;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  industry?: string;
  description?: string;
  website?: string;
}
