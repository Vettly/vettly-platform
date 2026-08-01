import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../client";
import { ESIGN_ENDPOINTS } from "./endpoints";
import type { CreateDocumentRequest, EsignDocument } from "../../types/esign.types";

const client = createClient(import.meta.env.VITE_ESIGN_API_URL);

export const esignKeys = {
  documents: ["esign", "documents"] as const,
  document: (id: string) => ["esign", "document", id] as const,
};

export const useMyDocuments = () =>
  useQuery({
    queryKey: esignKeys.documents,
    queryFn: async () => {
      const res = await client.get<EsignDocument[]>(ESIGN_ENDPOINTS.DOCUMENTS);
      return res.data;
    },
  });

export const useDocument = (id: string) =>
  useQuery({
    queryKey: esignKeys.document(id),
    queryFn: async () => {
      const res = await client.get<EsignDocument>(ESIGN_ENDPOINTS.DOCUMENT_BY_ID(id));
      return res.data;
    },
    enabled: !!id,
  });

export const useSendOffer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDocumentRequest) => {
      const res = await client.post<EsignDocument>(ESIGN_ENDPOINTS.DOCUMENTS, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: esignKeys.documents });
    },
  });
};

export const useSignDocument = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await client.post<EsignDocument>(ESIGN_ENDPOINTS.SIGN(id));
      return res.data;
    },
    onSuccess: (document) => {
      qc.setQueryData(esignKeys.document(id), document);
      qc.invalidateQueries({ queryKey: esignKeys.documents });
    },
  });
};

export const useDownloadDocument = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const res = await client.get<{ url: string }>(ESIGN_ENDPOINTS.DOWNLOAD(id));
      return res.data.url;
    },
  });
