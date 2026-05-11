import { useState, useRef } from "react";
import { toast } from "react-toastify";
import {
  useResumes,
  useUploadResume,
  useDeleteResume,
  useSetPrimaryResume,
} from "../../../api/candidate/candidate.api";
import { formatDate } from "../../../utils/format";
import type { Resume } from "../../../types/candidate.types";

export function ResumeSection() {
  const { data: resumes = [], isLoading } = useResumes();
  const uploadResume = useUploadResume();
  const deleteResume = useDeleteResume();
  const setPrimary = useSetPrimaryResume();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Auto-select primary or first resume for preview
  const defaultPreview =
    resumes.find((r) => r.isPrimary) ?? resumes[0] ?? null;
  const activePreview = previewResume ?? defaultPreview;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadResume.mutate(file, {
      onSuccess: () => toast.success("Resume uploaded"),
      onError: () => toast.error("Failed to upload. PDF only, max 5MB."),
    });
    e.target.value = "";
  };

  const handleDelete = (id: string) => {
    deleteResume.mutate(id, {
      onSuccess: () => {
        toast.success("Resume deleted");
        setConfirmDeleteId(null);
        if (previewResume?.id === id) setPreviewResume(null);
      },
      onError: () => toast.error("Failed to delete resume"),
    });
  };

  const handleSetPrimary = (id: string) => {
    setPrimary.mutate(id, {
      onSuccess: () => toast.success("Primary resume updated"),
      onError: () => toast.error("Failed to update primary resume"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <label className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed border-outline-variant hover:border-secondary bg-surface-container-low cursor-pointer transition-all group">
        {uploadResume.isPending ? (
          <span className="material-symbols-outlined text-secondary animate-spin" style={{ fontSize: "32px" }}>
            progress_activity
          </span>
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors" style={{ fontSize: "32px" }}>
            upload_file
          </span>
        )}
        <div className="text-center">
          <p className="text-sm font-bold font-body text-on-surface">
            {uploadResume.isPending ? "Uploading…" : "Upload Resume"}
          </p>
          <p className="text-xs font-body text-on-surface-variant mt-0.5">
            PDF only · Max 5MB
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleUpload}
          disabled={uploadResume.isPending}
        />
      </label>

      {/* Resume list + preview split */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-xl h-16" />
          ))}
        </div>
      )}
      {!isLoading && resumes.length === 0 && (
        <div className="text-center py-6 space-y-2">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "36px" }}>
            description
          </span>
          <p className="text-sm font-body text-on-surface-variant">
            No resumes uploaded yet. Upload a PDF above.
          </p>
        </div>
      )}
      {!isLoading && resumes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Resume list — left column */}
          <div className="lg:col-span-2 space-y-2">
            <p className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-2">
              Your Resumes
            </p>
            {resumes.map((resume) => {
              const isSelected = activePreview?.id === resume.id;
              const itemClass = isSelected
                ? "bg-secondary-container border-secondary"
                : "bg-surface-container border-outline-variant hover:border-secondary/50";
              return (
                <button
                  key={resume.id}
                  type="button"
                  onClick={() => setPreviewResume(resume)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${itemClass}`}
                >
                  <span
                    className={`material-symbols-outlined shrink-0 ${isSelected ? "text-on-secondary-container" : "text-secondary"}`}
                    style={{ fontSize: "20px" }}
                  >
                    description
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-body text-sm font-bold truncate ${isSelected ? "text-on-secondary-container" : "text-on-surface"}`}>
                      {resume.fileName}
                    </p>
                    <p className={`text-xs font-body ${isSelected ? "text-on-secondary-container/70" : "text-on-surface-variant"}`}>
                      {formatDate(resume.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {resume.isPrimary && (
                      <span className={`text-xs font-bold font-label px-2 py-0.5 rounded-full ${isSelected ? "bg-secondary text-on-secondary" : "bg-secondary-container text-on-secondary-container"}`}>
                        Primary
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview panel — right column */}
          <div className="lg:col-span-3">
            <p className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-2">
              Preview
            </p>
            {activePreview ? (
              <div className="bg-surface-container rounded-2xl border border-outline-variant overflow-hidden">
                {/* Preview toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-outline-variant bg-surface-container-low">
                  <p className="text-sm font-bold font-body text-on-surface truncate max-w-[60%]">
                    {activePreview.fileName}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {!activePreview.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(activePreview.id)}
                        disabled={setPrimary.isPending}
                        className="text-xs font-bold font-label text-secondary hover:underline disabled:opacity-60"
                      >
                        Set Primary
                      </button>
                    )}
                    <a
                      href={activePreview.s3Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
                      title="Open in new tab"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>open_in_new</span>
                    </a>
                    {confirmDeleteId === activePreview.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(activePreview.id); }}
                          disabled={deleteResume.isPending}
                          className="text-xs font-bold font-label text-error hover:underline px-1"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                          className="text-xs font-label text-on-surface-variant hover:underline px-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(activePreview.id); }}
                        disabled={deleteResume.isPending}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-error-container hover:text-on-error-container text-on-surface-variant transition-colors"
                        title="Delete resume"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* PDF iframe */}
                <iframe
                  key={activePreview.id}
                  src={activePreview.s3Url}
                  title={activePreview.fileName}
                  className="w-full"
                  style={{ height: "600px" }}
                />
              </div>
            ) : (
              <div className="bg-surface-container rounded-2xl border border-outline-variant flex items-center justify-center" style={{ height: "400px" }}>
                <div className="text-center space-y-2">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "40px" }}>
                    preview
                  </span>
                  <p className="text-sm font-body text-on-surface-variant">Select a resume to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
