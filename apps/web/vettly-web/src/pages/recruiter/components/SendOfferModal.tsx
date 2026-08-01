import { useState } from "react";
import { toast } from "react-toastify";
import { useSendOffer } from "../../../api/esign/esign.api";

export function SendOfferModal({
  applicationId,
  onClose,
}: Readonly<{ applicationId: string; onClose: () => void }>) {
  const [salaryAmount, setSalaryAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const sendOffer = useSendOffer();

  const canSubmit = salaryAmount.trim() !== "" && startDate.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    sendOffer.mutate(
      {
        applicationId,
        salaryAmount: Number(salaryAmount),
        startDate,
        expiresAt: expiresAt || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Offer sent");
          onClose();
        },
        onError: () => {
          toast.error("Failed to send offer");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container rounded-2xl border border-outline-variant w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="font-headline font-bold text-on-surface text-lg">Send offer</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
              Annual salary (USD)
            </label>
            <input
              type="number"
              min="0"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              placeholder="e.g. 120000"
              className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
              Offer expires (optional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || sendOffer.isPending}
            className="w-full h-11 rounded-xl bg-secondary-fixed-dim text-on-secondary-fixed font-semibold text-sm disabled:opacity-50 transition-opacity"
          >
            {sendOffer.isPending ? "Sending…" : "Send offer"}
          </button>
        </form>
      </div>
    </div>
  );
}
