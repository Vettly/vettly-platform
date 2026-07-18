import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { createClient } from "../client";
import { MESSAGING_ENDPOINTS } from "./endpoints";
import type {
  ConversationSummary,
  Message,
  NotificationItem,
  UnreadSummary,
} from "../../types/messaging.types";

const client = createClient(import.meta.env.VITE_MESSAGING_API_URL);

export const messagingKeys = {
  conversations: ["messaging", "conversations"] as const,
  messages: (conversationId: string) =>
    ["messaging", "messages", conversationId] as const,
  notifications: ["messaging", "notifications"] as const,
  unreadSummary: ["messaging", "unread-summary"] as const,
};

// ─── Conversations ──────────────────────────────────────────────────────────

export const useConversations = () =>
  useQuery({
    queryKey: messagingKeys.conversations,
    queryFn: async () => {
      const res = await client.get<ConversationSummary[]>(
        MESSAGING_ENDPOINTS.CONVERSATIONS
      );
      return res.data;
    },
  });

export const useGetOrCreateConversation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (applicationId: string) => {
      const res = await client.post<ConversationSummary>(
        MESSAGING_ENDPOINTS.CONVERSATIONS,
        { applicationId }
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagingKeys.conversations });
    },
  });
};

// ─── Messages ────────────────────────────────────────────────────────────────

// Each page is oldest-first; page 0 (fetched first) holds the newest batch.
// Render order = reverse(pages).flat().
export const useMessages = (conversationId: string) =>
  useInfiniteQuery({
    queryKey: messagingKeys.messages(conversationId),
    queryFn: async ({ pageParam }) => {
      const res = await client.get<Message[]>(
        MESSAGING_ENDPOINTS.MESSAGES(conversationId),
        { params: pageParam ? { before: pageParam } : undefined }
      );
      return res.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length > 0 ? lastPage[0].sentAt : undefined,
    enabled: !!conversationId,
  });

export const useSendMessage = (conversationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const res = await client.post<Message>(
        MESSAGING_ENDPOINTS.MESSAGES(conversationId),
        { body }
      );
      return res.data;
    },
    onSuccess: (message) => {
      qc.setQueryData<InfiniteData<Message[]>>(
        messagingKeys.messages(conversationId),
        (old) => {
          if (!old) return old;
          const pages = [...old.pages];
          pages[0] = [...pages[0], message];
          return { ...old, pages };
        }
      );
      qc.invalidateQueries({ queryKey: messagingKeys.conversations });
    },
  });
};

export const useMarkConversationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      await client.post(MESSAGING_ENDPOINTS.MARK_READ(conversationId));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagingKeys.conversations });
      qc.invalidateQueries({ queryKey: messagingKeys.unreadSummary });
    },
  });
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const useNotifications = () =>
  useQuery({
    queryKey: messagingKeys.notifications,
    queryFn: async () => {
      const res = await client.get<NotificationItem[]>(
        MESSAGING_ENDPOINTS.NOTIFICATIONS
      );
      return res.data;
    },
  });

export const useMarkNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await client.post(MESSAGING_ENDPOINTS.NOTIFICATIONS_READ);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagingKeys.notifications });
      qc.invalidateQueries({ queryKey: messagingKeys.unreadSummary });
    },
  });
};

export const useUnreadSummary = () =>
  useQuery({
    queryKey: messagingKeys.unreadSummary,
    queryFn: async () => {
      const res = await client.get<UnreadSummary>(
        MESSAGING_ENDPOINTS.UNREAD_SUMMARY
      );
      return res.data;
    },
    staleTime: 10_000,
  });
