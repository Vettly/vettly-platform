export interface ConversationSummary {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string | null;
  otherPartyName: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  sentAt: string;
}

export type NotificationType =
  | "application_received"
  | "stage_changed"
  | "offer_ready"
  | "message_reply"
  | "document_signed";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  jobId: string | null;
  applicationId: string | null;
  conversationId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadSummary {
  messages: number;
  notifications: number;
}
