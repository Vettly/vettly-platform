export const ORGANIZATION_ENDPOINTS = {
  BASE: "/api/organizations",
  MINE: "/api/organizations/mine",
  BY_ID: (id: string) => `/api/organizations/${id}`,
  SEARCH: "/api/organizations/search",
  JOIN_BY_CODE: "/api/organizations/join",
  REGENERATE_JOIN_CODE: "/api/organizations/mine/join-code/regenerate",
} as const;
