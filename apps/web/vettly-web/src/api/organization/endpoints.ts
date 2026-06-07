export const ORGANIZATION_ENDPOINTS = {
  BASE: "/api/organizations",
  MINE: "/api/organizations/mine",
  BY_ID: (id: string) => `/api/organizations/${id}`,
} as const;
