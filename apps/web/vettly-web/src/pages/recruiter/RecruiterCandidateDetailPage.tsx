import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useJob } from "../../api/job/job.api";
import { useCandidateStage } from "../../api/job/pipeline.api";
import {
  useApplicationSummary,
  useCandidateProfile,
} from "../../api/candidate/recruiter.api";
import { useMyDocuments } from "../../api/esign/esign.api";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { PillBadge } from "../../components/PillBadge";
import { formatDate, formatMonthYear } from "../../utils/format";
import { DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_TONES } from "../../utils/tones";
import { ROUTES } from "../../router/routes";
import { parseSkillGap } from "../../types/candidate.types";
import { buildMessagesLink } from "../../utils/messagingLinks";
import { SendOfferModal } from "./components/SendOfferModal";

export default function RecruiterCandidateDetailPage() {
  const { jobId = "", applicationId = "" } = useParams<{ jobId: string; applicationId: string }>();
  const [offerModalOpen, setOfferModalOpen] = useState(false);

  const { data: job, isLoading: jobLoading } = useJob(jobId);
  const { data: stage, isLoading: stageLoading } = useCandidateStage(jobId, applicationId);
  const { data: summary, isLoading: summaryLoading } = useApplicationSummary(applicationId);
  const { data: profile, isLoading: profileLoading } = useCandidateProfile(stage?.candidateId ?? "");
  const { data: documents } = useMyDocuments();
  const existingOffer = documents?.find((d) => d.applicationId === applicationId);

  const isLoading = jobLoading || stageLoading || summaryLoading || profileLoading;

  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "Candidate";

  // Skill match & gap: compare the job's listed skills against the candidate's skills.
  const profileSkillNames = new Set(
    (profile?.skills ?? []).map((s) => s.name.trim().toLowerCase())
  );
  const skillRows = (job?.skills ?? []).map((skill) => {
    const matched = profileSkillNames.has(skill.name.trim().toLowerCase());
    return {
      name: skill.name,
      matched,
      required: skill.isRequired,
    };
  });

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <Link
          to={ROUTES.RECRUITER_CANDIDATES}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
        </Link>
        <div className="min-w-0">
          <h1 className="text-[17px] font-semibold font-headline text-on-surface truncate">
            {isLoading ? "Loading…" : displayName}
          </h1>
          <p className="text-xs font-body text-on-surface-variant mt-0.5 truncate">
            {job?.title ?? "—"}
            {profile?.location ? ` · ${profile.location}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {existingOffer ? (
            <PillBadge
              tone={DOCUMENT_STATUS_TONES[existingOffer.status]}
              label={DOCUMENT_STATUS_LABELS[existingOffer.status]}
            />
          ) : (
            <button
              onClick={() => setOfferModalOpen(true)}
              className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-xs hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>draw</span>
              <span>Send offer</span>
            </button>
          )}
          <Link
            to={buildMessagesLink("recruiter", applicationId)}
            className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-xs hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>forum</span>
            <span>Message candidate</span>
          </Link>
        </div>
      </div>

      {offerModalOpen && (
        <SendOfferModal applicationId={applicationId} onClose={() => setOfferModalOpen(false)} />
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : !profile ? (
        <EmptyState
          icon="person_off"
          title="Profile not found"
          description="This candidate's profile could not be loaded."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            {/* Skill match & gap */}
            <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
              <span className="text-sm font-semibold font-headline text-on-surface">
                Skill match &amp; gap
              </span>
              {skillRows.length === 0 ? (
                <p className="text-[12.5px] font-body text-on-surface-variant mt-3">
                  This job has no listed skills to compare against.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5 mt-4">
                  {skillRows.map((row) => (
                    <div key={row.name} className="flex items-center gap-2.5">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "19px", color: row.matched ? "#46D39A" : "#F4A340" }}
                      >
                        {row.matched ? "check_circle" : "cancel"}
                      </span>
                      <span className="flex-1 text-[13px] font-body text-on-surface">
                        {row.name}
                        {row.required && (
                          <span className="text-on-surface-variant text-[11px]"> · required</span>
                        )}
                      </span>
                      <span
                        className="text-[11.5px] font-bold font-label"
                        style={{ color: row.matched ? "#46D39A" : "#F4A340" }}
                      >
                        {row.matched ? "Match" : "Gap"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resume summary */}
            <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5 flex flex-col gap-5">
              {profile.bio && (
                <div>
                  <span className="text-sm font-semibold font-headline text-on-surface">About</span>
                  <p className="text-[13px] font-body text-on-surface-variant leading-relaxed mt-2">
                    {profile.bio}
                  </p>
                </div>
              )}

              {profile.skills.length > 0 && (
                <div>
                  <span className="text-sm font-semibold font-headline text-on-surface">Skills</span>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="text-xs font-bold font-label text-on-secondary-container bg-secondary-container px-3 py-1 rounded-full"
                      >
                        {skill.name}
                        {skill.level && <span className="opacity-70 ml-1">· {skill.level}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.experiences.length > 0 && (
                <div>
                  <span className="text-sm font-semibold font-headline text-on-surface">Experience</span>
                  <div className="space-y-3 mt-2.5">
                    {profile.experiences.map((exp) => (
                      <div key={exp.id}>
                        <p className="text-sm font-bold font-body text-on-surface">
                          {exp.role} · {exp.company}
                        </p>
                        <p className="text-xs font-body text-on-surface-variant">
                          {formatMonthYear(exp.startDate)} – {exp.endDate ? formatMonthYear(exp.endDate) : "Present"}
                        </p>
                        {exp.description && (
                          <p className="text-xs font-body text-on-surface-variant mt-1">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.educations.length > 0 && (
                <div>
                  <span className="text-sm font-semibold font-headline text-on-surface">Education</span>
                  <div className="space-y-3 mt-2.5">
                    {profile.educations.map((edu) => (
                      <div key={edu.id}>
                        <p className="text-sm font-bold font-body text-on-surface">
                          {edu.degree} in {edu.field}
                        </p>
                        <p className="text-xs font-body text-on-surface-variant">
                          {edu.institution} · {formatMonthYear(edu.startDate)} – {edu.endDate ? formatMonthYear(edu.endDate) : "Present"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.resumes.length > 0 && (
                <div>
                  <span className="text-sm font-semibold font-headline text-on-surface">Resumes</span>
                  <div className="space-y-2 mt-2.5">
                    {profile.resumes.map((resume) => (
                      <a
                        key={resume.id}
                        href={resume.s3Url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between bg-surface-container-highest rounded-lg px-3 py-2 hover:bg-surface-container transition-colors"
                      >
                        <span className="text-sm font-body text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>description</span>
                          {resume.fileName}
                          {resume.isPrimary && (
                            <span className="text-xs font-bold font-label text-secondary-fixed-dim">Primary</span>
                          )}
                        </span>
                        <span className="text-xs font-body text-on-surface-variant">
                          {formatDate(resume.uploadedAt)}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* AI match score */}
            <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
              <p className="text-[11.5px] font-medium font-label tracking-wide uppercase text-on-surface-variant text-center mb-3">
                Screening scores
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center bg-surface-container rounded-lg p-3">
                  <p className="text-[10px] font-label uppercase tracking-wide text-on-surface-variant mb-1.5">
                    Match score
                  </p>
                  <p className="font-mono text-[34px] font-semibold text-[#46D39A] leading-none">
                    {summary?.matchScore != null ? Math.round(summary.matchScore) : "—"}
                  </p>
                  <p className="text-[10px] font-body text-on-surface-variant mt-1">AI + skills</p>
                </div>
                <div className="text-center bg-surface-container rounded-lg p-3">
                  <p className="text-[10px] font-label uppercase tracking-wide text-on-surface-variant mb-1.5">
                    AI score
                  </p>
                  <p className="font-mono text-[34px] font-semibold text-on-surface leading-none">
                    {summary?.aiScore != null ? Math.round(summary.aiScore) : "—"}
                  </p>
                  <p className="text-[10px] font-body text-on-surface-variant mt-1">Semantic match</p>
                </div>
              </div>
              {summary?.matchScore == null && summary?.aiScore == null && (
                <p className="text-xs font-body text-on-surface-variant text-center mt-3">No score available</p>
              )}
            </div>

            {/* Skill gap from AI screening */}
            {parseSkillGap(summary?.skillGap).length > 0 && (
              <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
                <span className="text-sm font-semibold font-headline text-on-surface">AI skill gap</span>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {parseSkillGap(summary?.skillGap).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[11.5px] font-medium font-label"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bias check */}
            <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
              <span className="text-sm font-semibold font-headline text-on-surface">Bias check</span>
              <div className="mt-3">
                {summary?.biasFlagged ? (
                  <div className="flex items-start gap-2.5 text-[12.5px]" style={{ color: "#F4A340" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>warning</span>
                    <span>This application was flagged for potential bias and should be reviewed.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-[13px]" style={{ color: "#46D39A" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>verified_user</span>
                    <span>No bias signals detected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
