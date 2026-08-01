import {
  useDocument,
  useDownloadDocument,
  useSignDocument,
} from "../../../api/esign/esign.api";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import { PillBadge } from "../../../components/PillBadge";
import { DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_TONES } from "../../../utils/tones";
import { formatDate } from "../../../utils/format";

export function DocumentPreview({
  documentId,
  onBack,
}: Readonly<{ documentId: string; onBack?: () => void }>) {
  const { data: document, isLoading } = useDocument(documentId);
  const signDocument = useSignDocument(documentId);
  const downloadDocument = useDownloadDocument();

  const handleSign = () => {
    if (document?.status === "pending") signDocument.mutate();
  };

  const handleDownload = () => {
    downloadDocument.mutate(documentId, {
      onSuccess: (url) => window.open(url, "_blank"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon="description" title="Document not found" />
      </div>
    );
  }

  const isSigned = document.status === "signed";
  const salary = document.salaryAmount.toLocaleString("en-US");
  const startDate = new Date(document.startDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
      <div className="p-6 lg:p-8 flex flex-col gap-4 max-w-[820px] mx-auto w-full">
        <div className="flex items-center gap-3.5">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                arrow_back
              </span>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold font-headline text-on-surface truncate">
              Offer Letter — {document.companyName ?? document.jobTitle}
            </div>
            <div className="text-xs text-on-surface-variant mt-0.5">
              {document.jobTitle}
              {document.expiresAt && ` · Expires ${formatDate(document.expiresAt)}`}
            </div>
          </div>
          <PillBadge
            tone={DOCUMENT_STATUS_TONES[document.status]}
            label={DOCUMENT_STATUS_LABELS[document.status]}
          />
        </div>

        {/* Offer letter "paper" — width matches real A4 proportions; height fits content */}
        <div className="bg-white rounded-xl p-14 lg:p-16 text-[#1a1a1a] text-[15px] leading-[1.85]">
          <div className="font-mono text-xs tracking-[0.1em] uppercase text-[#F4A340] mb-6">
            {document.companyName ?? "Vettly"}
          </div>
          <div className="text-2xl font-semibold mb-6 text-[#111]">Offer of Employment</div>
          <p className="mb-4">Dear {document.candidateName},</p>
          <p className="mb-4">
            We are delighted to offer you the position of <b>{document.jobTitle}</b> at{" "}
            {document.companyName ?? "our company"}. Your start date will be {startDate}.
          </p>
          <p className="mb-6">
            Your annual base salary will be <b>${salary}</b>, paid semi-monthly, along with our
            standard benefits package.
          </p>
          <p className="mb-6">
            We are excited about the contributions you will make to our team. Please sign below
            to accept this offer.
          </p>
          <div className="flex gap-14 border-t border-[#e5e5e5] pt-7">
            <div className="flex-1">
              <div className="text-xs text-[#999] uppercase tracking-wide mb-2.5">Company</div>
              <div className="font-mono text-xl italic">{document.recruiterName}</div>
              <div className="border-t border-[#ccc] mt-2 pt-2 text-xs text-[#999]">
                {document.companyName ?? "Vettly"}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-[#999] uppercase tracking-wide mb-2.5">Candidate</div>
              {isSigned ? (
                <div className="font-mono text-xl italic">{document.signedByName}</div>
              ) : (
                <button
                  onClick={handleSign}
                  disabled={signDocument.isPending}
                  className="h-8 flex items-center gap-1.5 text-sm font-semibold text-[#F4A340] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
                    draw
                  </span>
                  {signDocument.isPending ? "Signing…" : "Click to sign"}
                </button>
              )}
              <div className="border-t border-[#ccc] mt-2 pt-2 text-xs text-[#999]">
                {document.candidateName}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleSign}
            disabled={isSigned || signDocument.isPending}
            className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm transition-opacity ${
              isSigned
                ? "bg-[#46D39A]/15 text-[#46D39A] cursor-default"
                : "bg-secondary-fixed-dim text-on-secondary-fixed disabled:opacity-50"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>
              {isSigned ? "check_circle" : "draw"}
            </span>
            {isSigned ? "Signed" : signDocument.isPending ? "Signing…" : "Sign offer"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloadDocument.isPending}
            className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              download
            </span>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
