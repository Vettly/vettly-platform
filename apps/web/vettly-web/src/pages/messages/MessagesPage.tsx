import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useConversations,
  useGetOrCreateConversation,
} from "../../api/messaging/messaging.api";
import { ConversationList } from "./components/ConversationList";
import { ChatThread } from "./components/ChatThread";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: conversations, isLoading } = useConversations();
  const getOrCreate = useGetOrCreateConversation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const applicationId = searchParams.get("applicationId");

  useEffect(() => {
    if (!applicationId) return;
    getOrCreate.mutate(applicationId, {
      onSuccess: (conversation) => {
        setSelectedId(conversation.id);
        setSearchParams({}, { replace: true });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  useEffect(() => {
    if (!selectedId && conversations && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const selected = conversations?.find((c) => c.id === selectedId) ?? null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <div
        className={`w-full lg:w-[300px] shrink-0 border-r border-outline-variant flex-col ${
          selected ? "hidden lg:flex" : "flex"
        }`}
      >
        {conversations && conversations.length > 0 ? (
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : (
          <div className="p-6">
            <EmptyState
              icon="forum"
              title="No conversations yet"
              description="Messages with recruiters and candidates will show up here."
            />
          </div>
        )}
      </div>
      <div
        className={`flex-1 min-w-0 flex-col ${selected ? "flex" : "hidden lg:flex"}`}
      >
        {selected ? (
          <ChatThread conversation={selected} onBack={() => setSelectedId(null)} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon="chat_bubble"
              title="Select a conversation"
              description="Choose a conversation from the list to start chatting."
            />
          </div>
        )}
      </div>
    </div>
  );
}
