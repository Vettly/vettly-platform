import { useEffect, useRef, useState } from "react";
import { useMyDocuments } from "../../api/esign/esign.api";
import { DocumentList } from "./components/DocumentList";
import { DocumentPreview } from "./components/DocumentPreview";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";

export default function DocumentsPage() {
  const { data: documents, isLoading } = useMyDocuments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const hasAutoSelected = useRef(false);

  // One-time default selection once the list loads; re-firing on every
  // selectedId change (the rule's preferred shape) would undo the mobile
  // "back" button, since clearing selectedId to show the list would
  // immediately re-select item 0.
  useEffect(() => {
    if (hasAutoSelected.current || !documents || documents.length === 0) return;
    hasAutoSelected.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedId(documents[0].id);
  }, [documents]);

  const selected = documents?.find((d) => d.id === selectedId) ?? null;

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
        className={`w-full lg:w-[380px] shrink-0 border-r border-outline-variant flex-col ${
          selected ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="px-4 py-3.5 border-b border-outline-variant shrink-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-semibold font-headline text-on-surface">Document vault</h1>
            {documents && documents.length > 0 && (
              <span className="text-[11px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                {documents.length}
              </span>
            )}
          </div>
        </div>
        {documents && documents.length > 0 ? (
          <DocumentList documents={documents} selectedId={selectedId} onSelect={setSelectedId} />
        ) : (
          <div className="p-6">
            <EmptyState
              icon="folder_open"
              title="No documents yet"
              description="Offer letters and other documents will show up here once a recruiter sends one."
            />
          </div>
        )}
      </div>
      <div className={`flex-1 min-w-0 flex-col ${selected ? "flex" : "hidden lg:flex"}`}>
        {selected ? (
          <DocumentPreview documentId={selected.id} onBack={() => setSelectedId(null)} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon="description"
              title="Select a document"
              description="Choose a document from the list to view it."
            />
          </div>
        )}
      </div>
    </div>
  );
}
