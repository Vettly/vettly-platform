import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useUploadAvatar, useUpdateProfile } from "../../../api/candidate/candidate.api";
import { useAuthStore } from "../../../stores/authStore";
import type { CandidateProfile } from "../../../types/candidate.types";

interface ProfileHeaderProps {
  profile: CandidateProfile;
}

export function ProfileHeader({ profile }: Readonly<ProfileHeaderProps>) {
  const { user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingHeadline, setEditingHeadline] = useState(false);
  const [headlineValue, setHeadlineValue] = useState(profile.headline ?? "");

  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();

  const initials = `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`.toUpperCase() || "?";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success("Avatar updated"),
      onError: () => toast.error("Failed to upload avatar. Max 2MB (JPEG/PNG/WebP)."),
    });
  };

  const saveHeadline = () => {
    setEditingHeadline(false);
    if (headlineValue === (profile.headline ?? "")) return;
    updateProfile.mutate(
      { headline: headlineValue },
      {
        onSuccess: () => toast.success("Headline updated"),
        onError: () => toast.error("Failed to update headline"),
      }
    );
  };

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <div
          className="relative w-16 h-16 group cursor-pointer shrink-0 rounded-2xl overflow-hidden"
          onClick={() => fileRef.current?.click()}
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="w-16 h-16 object-cover" />
          ) : (
            <div
              className="w-16 h-16 flex items-center justify-center text-2xl font-bold"
              style={{ background: "rgba(244,163,64,.14)", color: "#F4A340" }}
            >
              {initials}
            </div>
          )}
          <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {uploadAvatar.isPending ? (
              <span className="material-symbols-outlined text-white animate-spin" style={{ fontSize: "22px" }}>
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-white" style={{ fontSize: "22px" }}>
                photo_camera
              </span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Name + headline + location */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold font-headline text-on-surface">
            {user?.firstName} {user?.lastName}
          </h1>

          {editingHeadline ? (
            <input
              type="text"
              value={headlineValue}
              onChange={(e) => setHeadlineValue(e.target.value)}
              onBlur={saveHeadline}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveHeadline();
                if (e.key === "Escape") {
                  setHeadlineValue(profile.headline ?? "");
                  setEditingHeadline(false);
                }
              }}
              placeholder="e.g. Senior Frontend Engineer"
              autoFocus
              className="mt-1 w-full max-w-sm bg-surface-container-high border border-secondary rounded-lg px-2.5 py-1 text-[13.5px] font-body text-on-surface outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingHeadline(true)}
              className="flex items-center gap-1.5 mt-1 group/hl"
            >
              <span className="text-[13.5px] font-body text-on-surface-variant group-hover/hl:text-on-surface transition-colors">
                {profile.headline || "Add a professional headline…"}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover/hl:opacity-100 transition-opacity" style={{ fontSize: "16px" }}>
                edit
              </span>
            </button>
          )}

          <div className="flex items-center gap-3.5 text-[12.5px] text-on-surface-variant mt-1.5">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>place</span>
              {profile.location || "Location not set"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>mail</span>
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
