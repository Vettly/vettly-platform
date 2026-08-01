import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMarkNotificationsRead,
  useNotifications,
  useUnreadSummary,
} from "../api/messaging/messaging.api";
import { useAuthStore } from "../stores/authStore";
import { ROUTES } from "../router/routes";
import { UserRole } from "../types/auth.types";
import type { NotificationItem } from "../types/messaging.types";

const TYPE_ICON: Record<NotificationItem["type"], { icon: string; color: string }> = {
  application_received: { icon: "person_add", color: "#F4A340" },
  stage_changed: { icon: "work", color: "#F4A340" },
  offer_ready: { icon: "draw", color: "#5BC8D4" },
  message_reply: { icon: "forum", color: "#46D39A" },
  document_signed: { icon: "verified", color: "#5BC8D4" },
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const { data: summary } = useUnreadSummary();
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkNotificationsRead();

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleToggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next && (summary?.notifications ?? 0) > 0) markAllRead.mutate();
      return next;
    });
  };

  const messagesRoute =
    role === UserRole.Recruiter ? ROUTES.RECRUITER_MESSAGES : ROUTES.CANDIDATE_MESSAGES;

  const handleNotificationClick = (n: NotificationItem) => {
    setOpen(false);
    if (n.type === "message_reply") {
      navigate(messagesRoute);
      return;
    }
    if (n.type === "stage_changed" && n.applicationId) {
      navigate(ROUTES.CANDIDATE_APPLICATION_DETAIL(n.applicationId));
      return;
    }
    if (
      (n.type === "application_received" || n.type === "document_signed") &&
      n.jobId &&
      n.applicationId
    ) {
      navigate(ROUTES.RECRUITER_CANDIDATE_DETAIL(n.jobId, n.applicationId));
      return;
    }
    if (n.type === "offer_ready") {
      navigate(ROUTES.CANDIDATE_DOCUMENTS);
    }
  };

  const unreadCount = summary?.notifications ?? 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
        title="Notifications"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary-fixed-dim" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-surface-container border border-outline-variant rounded-xl shadow-lg z-40">
          <div className="px-4 py-3 border-b border-outline-variant text-sm font-semibold text-on-surface">
            Notifications
          </div>
          {!notifications || notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-on-surface-variant">
              You're all caught up
            </div>
          ) : (
            notifications.map((n) => {
              const meta = TYPE_ICON[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors ${
                    !n.isRead ? "bg-secondary-fixed-dim/[0.05]" : ""
                  }`}
                >
                  <span
                    className="material-symbols-outlined shrink-0"
                    style={{ fontSize: "18px", color: meta.color }}
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] text-on-surface leading-snug">{n.title}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
