export type DocumentStatus = "pending" | "signed";

export interface EsignDocument {
  id: string;
  applicationId: string;
  jobId: string;
  documentType: string;
  jobTitle: string;
  companyName: string | null;
  candidateName: string;
  recruiterName: string;
  salaryAmount: number;
  startDate: string;
  status: DocumentStatus;
  expiresAt: string | null;
  createdAt: string;
  signedAt: string | null;
  signedByName: string | null;
}

export interface CreateDocumentRequest {
  applicationId: string;
  salaryAmount: number;
  startDate: string;
  expiresAt?: string;
}
