import { PillBadge } from "../../../components/PillBadge";
import { DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_TONES } from "../../../utils/tones";
import type { EsignDocument } from "../../../types/esign.types";

export function DocumentList({
  documents,
  selectedId,
  onSelect,
}: Readonly<{
  documents: EsignDocument[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}>) {
  return (
    <div className="flex-1 overflow-y-auto">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-outline-variant text-left transition-colors ${
            doc.id === selectedId
              ? "bg-surface-container-high border-l-2 border-l-secondary-fixed-dim"
              : "border-l-2 border-l-transparent hover:bg-surface-container"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed-dim/[0.14] flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-secondary-fixed-dim"
              style={{ fontSize: "19px" }}
            >
              {doc.status === "signed" ? "draw" : "description"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-semibold text-on-surface truncate">
              {doc.companyName ?? doc.jobTitle}
            </div>
            <div className="text-xs text-on-surface-variant truncate mt-0.5">{doc.jobTitle}</div>
          </div>
          <div className="shrink-0">
            <PillBadge tone={DOCUMENT_STATUS_TONES[doc.status]} label={DOCUMENT_STATUS_LABELS[doc.status]} />
          </div>
        </button>
      ))}
    </div>
  );
}
