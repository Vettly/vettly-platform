export const ESIGN_ENDPOINTS = {
  DOCUMENTS: "/api/esign/documents",
  DOCUMENT_BY_ID: (id: string) => `/api/esign/documents/${id}`,
  DOWNLOAD: (id: string) => `/api/esign/documents/${id}/download`,
  SIGN: (id: string) => `/api/esign/documents/${id}/sign`,
};
