export const MESSAGING_ENDPOINTS = {
  CONVERSATIONS: "/api/messaging/conversations",
  MESSAGES: (conversationId: string) =>
    `/api/messaging/conversations/${conversationId}/messages`,
  MARK_READ: (conversationId: string) =>
    `/api/messaging/conversations/${conversationId}/read`,
  NOTIFICATIONS: "/api/messaging/notifications",
  NOTIFICATIONS_READ: "/api/messaging/notifications/read",
  UNREAD_SUMMARY: "/api/messaging/unread-summary",
};
