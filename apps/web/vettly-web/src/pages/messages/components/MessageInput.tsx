import { useState, type KeyboardEvent } from "react";
import { useSendMessage } from "../../../api/messaging/messaging.api";

export function MessageInput({
  conversationId,
}: Readonly<{ conversationId: string }>) {
  const [draft, setDraft] = useState("");
  const sendMessage = useSendMessage(conversationId);

  const send = () => {
    const body = draft.trim();
    if (!body || sendMessage.isPending) return;
    setDraft("");
    sendMessage.mutate(body);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="shrink-0 p-3.5 lg:p-4 border-t border-outline-variant flex items-center gap-2.5">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Write a message…"
        rows={1}
        className="flex-1 max-h-32 resize-none rounded-xl bg-surface-container border border-outline-variant text-on-surface text-[13.5px] px-4 py-2.5 outline-none focus:border-secondary-fixed-dim placeholder:text-on-surface-variant"
      />
      <button
        onClick={send}
        disabled={!draft.trim() || sendMessage.isPending}
        className="w-11 h-11 rounded-xl bg-secondary-fixed-dim flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
      >
        <span
          className="material-symbols-outlined text-on-secondary-fixed"
          style={{ fontSize: "20px" }}
        >
          send
        </span>
      </button>
    </div>
  );
}
