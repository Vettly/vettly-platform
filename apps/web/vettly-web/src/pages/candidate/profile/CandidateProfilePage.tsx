import { useState } from "react";
import { useCreateProfile, useProfile } from "../../../api/candidate/candidate.api";
import { toast } from "react-toastify";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileAbout } from "./ProfileAbout";
import { ExperienceSection } from "./ExperienceSection";
import { EducationSection } from "./EducationSection";
import { SkillsSection } from "./SkillsSection";
import { ResumeSection } from "./ResumeSection";
import { ProfilePanel } from "../components/ProfilePanel";
import { computeCompleteness } from "../utils";

type ProfileTab = "profile" | "documents";

const TABS: { key: ProfileTab; label: string; icon: string }[] = [
  { key: "profile", label: "Profile", icon: "person" },
  { key: "documents", label: "Documents", icon: "description" },
];

function chipClasses(active: boolean): string {
  return active
    ? "flex items-center gap-1.5 text-[12.5px] font-semibold text-on-secondary-fixed bg-secondary-fixed-dim px-3.5 py-1.5 rounded-lg transition-colors"
    : "flex items-center gap-1.5 text-[12.5px] font-medium text-on-surface-variant bg-surface-container-high border border-outline-variant px-3.5 py-1.5 rounded-lg hover:bg-surface-container-highest transition-colors";
}

function ProfileSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface-container-high animate-pulse rounded-2xl h-32" />
      ))}
    </div>
  );
}

function CreateProfilePrompt() {
  const createProfile = useCreateProfile();

  const handleCreate = () => {
    createProfile.mutate(
      {},
      {
        onSuccess: () => toast.success("Profile created! Fill in your details below."),
        onError: () => toast.error("Failed to create profile. Please try again."),
      }
    );
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center">
        <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "40px" }}>
          person_add
        </span>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold font-headline text-on-surface">
          Set up your profile
        </h2>
        <p className="text-on-surface-variant font-body max-w-md">
          Create your candidate profile to start applying to jobs on Vettly and let
          recruiters discover you.
        </p>
      </div>
      <button
        onClick={handleCreate}
        disabled={createProfile.isPending}
        className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold font-body hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {createProfile.isPending ? (
          <>
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: "18px" }}>
              progress_activity
            </span>
            Creating…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              add_circle
            </span>
            Create Profile
          </>
        )}
      </button>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <span className="material-symbols-outlined text-error" style={{ fontSize: "48px" }}>
        error
      </span>
      <h2 className="text-xl font-bold font-headline text-on-surface">Something went wrong</h2>
      <p className="text-on-surface-variant font-body text-sm">
        Failed to load your profile. Please refresh the page and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold font-body text-sm hover:opacity-90 transition-opacity"
      >
        Refresh
      </button>
    </div>
  );
}

export default function CandidateProfilePage() {
  const profileQuery = useProfile();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  const isNoProfile =
    (profileQuery.error as { response?: { status?: number } } | null)?.response?.status === 404;

  if (profileQuery.isLoading) return <ProfileSkeleton />;
  if (isNoProfile) return <CreateProfilePrompt />;
  if (profileQuery.isError) return <ErrorState />;

  const profile = profileQuery.data!;
  const { pct } = computeCompleteness(profile);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-4">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-extrabold font-headline text-on-surface">My Profile</h1>
        <p className="text-on-surface-variant font-body text-sm mt-1">
          Manage your professional profile and documents.
        </p>
      </div>

      {/* Profile header — always visible */}
      <ProfileHeader profile={profile} />

      {/* Tabs */}
      <div className="flex items-center gap-2.5">
        {TABS.map(({ key, label, icon }) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)} className={chipClasses(activeTab === key)}>
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-4 items-start">
          <div className="space-y-4">
            <ProfileAbout profile={profile} />
            <ExperienceSection />
          </div>
          <div className="space-y-4">
            <ProfilePanel
              title="Profile strength"
              action={
                <span className="font-mono text-[15px] font-semibold" style={{ color: "#F4A340" }}>
                  {pct}%
                </span>
              }
            >
              <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ background: "#F4A340", width: `${pct}%` }} />
              </div>
            </ProfilePanel>
            <SkillsSection />
            <EducationSection />
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <ProfilePanel title="Resumes">
          <ResumeSection />
        </ProfilePanel>
      )}
    </div>
  );
}
