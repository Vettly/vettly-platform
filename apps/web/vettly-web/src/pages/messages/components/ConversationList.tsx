import { useMemo, useState } from "react";
import type { ConversationSummary } from "../../../types/messaging.types";
import { formatRelative } from "../../../utils/format";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: Readonly<{
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}>) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.otherPartyName.toLowerCase().includes(q) ||
        (c.lastMessagePreview ?? "").toLowerCase().includes(q)
    );
  }, [conversations, search]);

  return (
    <>
      <div className="p-3.5 border-b border-outline-variant shrink-0">
        <div className="h-[38px] rounded-lg bg-surface-container border border-outline-variant flex items-center gap-2 px-3">
          <span
            className="material-symbols-outlined text-on-surface-variant"
            style={{ fontSize: "18px" }}
          >
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages"
            className="flex-1 bg-transparent outline-none text-sm text-on-surface placeholder:text-on-surface-variant"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant text-left transition-colors ${
              c.id === selectedId
                ? "bg-surface-container-high border-l-2 border-l-secondary-fixed-dim"
                : "border-l-2 border-l-transparent hover:bg-surface-container"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed-dim/[0.14] flex items-center justify-center text-[13px] font-bold text-secondary-fixed-dim shrink-0">
              {initials(c.otherPartyName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-semibold text-on-surface truncate">
                  {c.otherPartyName}
                </span>
                {c.lastMessageAt && (
                  <span className="text-[11px] text-on-surface-variant shrink-0">
                    {formatRelative(c.lastMessageAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs text-on-surface-variant truncate">
                  {c.lastMessagePreview ?? c.jobTitle}
                </span>
                {c.unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim shrink-0" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
