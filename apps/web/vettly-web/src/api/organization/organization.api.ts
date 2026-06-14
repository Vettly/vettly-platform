import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../client";
import { ORGANIZATION_ENDPOINTS } from "./endpoints";
import type {
  CreateOrganizationRequest,
  Organization,
  OrganizationSearchResult,
  UpdateOrganizationRequest,
} from "../../types/organization.types";

const client = createClient(import.meta.env.VITE_ORG_API_URL);

export const organizationKeys = {
  mine: ["organization", "mine"] as const,
  detail: (id: string) => ["organization", id] as const,
  search: (query: string) => ["organization", "search", query] as const,
};

export const useMyOrganization = () =>
  useQuery({
    queryKey: organizationKeys.mine,
    queryFn: async () => {
      const res = await client.get<Organization>(ORGANIZATION_ENDPOINTS.MINE);
      return res.data;
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });

export const useCreateOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrganizationRequest) => {
      const res = await client.post<Organization>(
        ORGANIZATION_ENDPOINTS.BASE,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: organizationKeys.mine });
    },
  });
};

export const useUpdateOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateOrganizationRequest) => {
      const res = await client.put<Organization>(
        ORGANIZATION_ENDPOINTS.MINE,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: organizationKeys.mine });
    },
  });
};

export const useSearchOrganizations = (query: string) =>
  useQuery({
    queryKey: organizationKeys.search(query),
    queryFn: async () => {
      const res = await client.get<OrganizationSearchResult[]>(
        ORGANIZATION_ENDPOINTS.SEARCH,
        { params: { q: query } }
      );
      return res.data;
    },
    enabled: query.trim().length > 0,
  });

export const useJoinByCode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (joinCode: string) => {
      const res = await client.post<Organization>(
        ORGANIZATION_ENDPOINTS.JOIN_BY_CODE,
        { joinCode }
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: organizationKeys.mine });
    },
  });
};

export const useRegenerateJoinCode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await client.post<Organization>(
        ORGANIZATION_ENDPOINTS.REGENERATE_JOIN_CODE
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: organizationKeys.mine });
    },
  });
};
