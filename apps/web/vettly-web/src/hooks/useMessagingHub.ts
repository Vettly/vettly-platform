import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getMessagingConnection,
  startMessagingConnection,
} from "../api/messaging/connection";
import { messagingKeys } from "../api/messaging/messaging.api";
import { useAuthStore } from "../stores/authStore";
import type {
  ConversationSummary,
  Message,
  NotificationItem,
} from "../types/messaging.types";

// Mounted once from each dashboard shell; keeps the SignalR connection alive
// and mirrors pushed events into the TanStack Query caches the UI reads from.
export function useMessagingHub() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();
  const location = useLocation();
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    pathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const connection = getMessagingConnection();

    const onMessage = (message: Message) => {
      qc.setQueryData<InfiniteData<Message[]>>(
        messagingKeys.messages(message.conversationId),
        (old) => {
          if (!old) return old;
          if (old.pages[0]?.some((m) => m.id === message.id)) return old;
          const pages = [...old.pages];
          pages[0] = [...pages[0], message];
          return { ...old, pages };
        }
      );

      if (!pathRef.current.endsWith("/messages")) {
        toast.info(
          message.body.length > 80
            ? `${message.body.slice(0, 80)}…`
            : message.body
        );
      }
    };

    const onConversationUpdated = (conversation: ConversationSummary) => {
      qc.setQueryData<ConversationSummary[]>(
        messagingKeys.conversations,
        (old) => {
          const next = old?.some((c) => c.id === conversation.id)
            ? old.map((c) => (c.id === conversation.id ? conversation : c))
            : [conversation, ...(old ?? [])];
          return [...next].sort((a, b) =>
            (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? "")
          );
        }
      );
      qc.invalidateQueries({ queryKey: messagingKeys.unreadSummary });
    };

    const onNotification = (notification: NotificationItem) => {
      qc.setQueryData<NotificationItem[]>(messagingKeys.notifications, (old) =>
        old ? [notification, ...old] : [notification]
      );
      qc.invalidateQueries({ queryKey: messagingKeys.unreadSummary });
    };

    connection.on("message:new", onMessage);
    connection.on("conversation:updated", onConversationUpdated);
    connection.on("notification:new", onNotification);

    startMessagingConnection().catch(() => {
      // withAutomaticReconnect handles drops after a successful connect;
      // a failed first attempt retries on the next mount (e.g. re-login)
    });

    // Only detach this mount's handlers on cleanup — the connection itself is a
    // shared singleton that should stay alive for the whole session. Tearing it
    // down here would race React StrictMode's mount→cleanup→mount double-invoke
    // (and any dashboard remount) against the in-flight start() call above.
    return () => {
      connection.off("message:new", onMessage);
      connection.off("conversation:updated", onConversationUpdated);
      connection.off("notification:new", onNotification);
    };
  }, [isAuthenticated, qc]);
}
