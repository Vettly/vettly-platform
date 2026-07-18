import { useEffect, useRef } from "react";
import {
  useMarkConversationRead,
  useMessages,
} from "../../../api/messaging/messaging.api";
import { useAuthStore } from "../../../stores/authStore";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { MessageInput } from "./MessageInput";
import type { ConversationSummary } from "../../../types/messaging.types";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ChatThread({
  conversation,
  onBack,
}: Readonly<{ conversation: ConversationSummary; onBack: () => void }>) {
  const userId = useAuthStore((s) => s.user?.id);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(conversation.id);
  const markRead = useMarkConversationRead();

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef(0);

  const messages = data ? data.pages.slice().reverse().flat() : [];

  useEffect(() => {
    // Re-fires whenever unreadCount goes back above zero for the open thread —
    // e.g. a live push arrives for the conversation you're already viewing —
    // not just when you switch to a different conversation.
    if (conversation.unreadCount > 0) markRead.mutate(conversation.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id, conversation.unreadCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [conversation.id]);

  useEffect(() => {
    if (isFetchingNextPage) return;
    const el = scrollRef.current;
    if (el && prevScrollHeight.current) {
      el.scrollTop = el.scrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = 0;
    }
  }, [messages.length, isFetchingNextPage]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || el.scrollTop > 60 || !hasNextPage || isFetchingNextPage) return;
    prevScrollHeight.current = el.scrollHeight;
    fetchNextPage();
  };

  return (
    <>
      <div className="h-16 shrink-0 flex items-center gap-3 px-4 lg:px-5 border-b border-outline-variant">
        <button
          onClick={onBack}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            arrow_back
          </span>
        </button>
        <div className="w-[38px] h-[38px] rounded-lg bg-secondary-fixed-dim/[0.14] flex items-center justify-center text-[13px] font-bold text-secondary-fixed-dim shrink-0">
          {initials(conversation.otherPartyName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] font-semibold text-on-surface truncate">
            {conversation.otherPartyName}
          </div>
          <div className="text-[11.5px] text-on-surface-variant truncate">
            {conversation.jobTitle}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 flex flex-col gap-2.5"
      >
        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <LoadingSpinner size={16} />
              </div>
            )}
            {messages.map((m) => {
              const mine = m.senderUserId === userId;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[74%] text-[13.5px] leading-relaxed px-3.5 py-2.5 whitespace-pre-wrap break-words ${
                      mine
                        ? "bg-secondary-fixed-dim text-on-secondary-fixed rounded-2xl rounded-br-md"
                        : "bg-surface-container-high border border-outline-variant text-on-surface rounded-2xl rounded-bl-md"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <MessageInput conversationId={conversation.id} />
    </>
  );
}
