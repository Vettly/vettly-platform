import {
  useApplicationSummary,
  useCandidateProfile,
} from "../../../api/candidate/recruiter.api";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { EmptyState } from "../../../components/EmptyState";
import { formatDate, formatMonthYear } from "../../../utils/format";

function ScoreBadge({
  label,
  value,
}: Readonly<{ label: string; value: number | null }>) {
  if (value === null) return null;
  return (
    <div className="bg-surface-container-low rounded-xl px-3 py-2 text-center">
      <p className="text-xs font-body text-on-surface-variant">{label}</p>
      <p className="text-lg font-extrabold font-headline text-on-surface">
        {Math.round(value)}
        <span className="text-xs font-body text-on-surface-variant">/100</span>
      </p>
    </div>
  );
}

export function CandidateProfileModal({
  candidateId,
  applicationId,
  onClose,
}: Readonly<{
  candidateId: string;
  applicationId: string;
  onClose: () => void;
}>) {
  const { data: profile, isLoading: profileLoading } =
    useCandidateProfile(candidateId);
  const { data: summary, isLoading: summaryLoading } =
    useApplicationSummary(applicationId);

  const isLoading = profileLoading || summaryLoading;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container rounded-2xl border border-outline-variant w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="font-headline font-bold text-on-surface text-lg">
            Candidate Profile
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          )}

          {!isLoading && !profile && (
            <EmptyState
              icon="person_off"
              title="Profile not found"
              description="This candidate's profile could not be loaded."
            />
          )}

          {!isLoading && profile && (
            <>
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center shrink-0 overflow-hidden">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "28px" }}>
                      person
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-extrabold font-headline text-on-surface truncate">
                    {profile.firstName} {profile.lastName}
                  </p>
                  {profile.headline && (
                    <p className="text-sm font-body text-on-surface-variant truncate">
                      {profile.headline}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {profile.location && (
                      <span className="text-xs font-body text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>location_on</span>
                        {profile.location}
                      </span>
                    )}
                    {profile.email && (
                      <span className="text-xs font-body text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>mail</span>
                        {profile.email}
                      </span>
                    )}
                    {profile.phone && (
                      <span className="text-xs font-body text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>call</span>
                        {profile.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {profile.linkedInUrl && (
                      <a href={profile.linkedInUrl} target="_blank" rel="noreferrer" className="text-xs font-bold font-label text-secondary hover:underline">
                        LinkedIn
                      </a>
                    )}
                    {profile.gitHubUrl && (
                      <a href={profile.gitHubUrl} target="_blank" rel="noreferrer" className="text-xs font-bold font-label text-secondary hover:underline">
                        GitHub
                      </a>
                    )}
                    {profile.portfolioUrl && (
                      <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-xs font-bold font-label text-secondary hover:underline">
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {profile.bio && (
                <p className="text-sm font-body text-on-surface-variant">{profile.bio}</p>
              )}

              {/* Application scores */}
              {summary && (
                <div>
                  <h3 className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-2">
                    Application
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <ScoreBadge label="AI Score" value={summary.aiScore} />
                    <ScoreBadge label="Match Score" value={summary.matchScore} />
                    <div className="bg-surface-container-low rounded-xl px-3 py-2 text-center">
                      <p className="text-xs font-body text-on-surface-variant">Status</p>
                      <p className="text-sm font-bold font-headline text-on-surface capitalize mt-1">
                        {summary.status}
                      </p>
                    </div>
                  </div>
                  {summary.biasFlagged && (
                    <p className="text-xs text-error font-body mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>flag</span>
                      Flagged for potential bias
                    </p>
                  )}
                  {summary.skillGap && (
                    <p className="text-xs font-body text-on-surface-variant bg-surface-container-low rounded-lg px-3 py-2 mt-2">
                      <span className="font-bold">Skill gap: </span>
                      {summary.skillGap}
                    </p>
                  )}
                </div>
              )}

              {/* Skills */}
              {profile.skills.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-2">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="text-xs font-bold font-label text-on-secondary-container bg-secondary-container px-3 py-1 rounded-full"
                      >
                        {skill.name}
                        {skill.level && (
                          <span className="opacity-70 ml-1">· {skill.level}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {profile.experiences.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-2">
                    Experience
                  </h3>
                  <div className="space-y-3">
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

              {/* Education */}
              {profile.educations.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-2">
                    Education
                  </h3>
                  <div className="space-y-3">
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

              {/* Resumes */}
              {profile.resumes.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-2">
                    Resumes
                  </h3>
                  <div className="space-y-2">
                    {profile.resumes.map((resume) => (
                      <a
                        key={resume.id}
                        href={resume.s3Url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between bg-surface-container-low rounded-lg px-3 py-2 hover:bg-surface-container-high transition-colors"
                      >
                        <span className="text-sm font-body text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>description</span>
                          {resume.fileName}
                          {resume.isPrimary && (
                            <span className="text-xs font-bold font-label text-secondary">Primary</span>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
