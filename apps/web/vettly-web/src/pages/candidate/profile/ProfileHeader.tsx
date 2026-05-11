import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useUploadAvatar, useUpdateProfile } from "../../../api/candidate/candidate.api";
import { useAuthStore } from "../../../stores/authStore";
import type { CandidateProfile } from "../../../types/candidate.types";
import defaultAvatar from "../../../assets/user-avatar.png";

interface ProfileHeaderProps {
  profile: CandidateProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingHeadline, setEditingHeadline] = useState(false);
  const [headlineValue, setHeadlineValue] = useState(profile.headline ?? "");

  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();

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
    <div className="bg-surface-container rounded-2xl border border-outline-variant p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <div
          className="relative w-20 h-20 group cursor-pointer shrink-0"
          onClick={() => fileRef.current?.click()}
        >
          <img
            src={profile.avatarUrl ?? defaultAvatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="absolute inset-0 rounded-full bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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

        {/* Name + headline */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold font-headline text-on-surface">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-sm text-on-surface-variant font-body">{user?.email}</p>

          {editingHeadline ? (
            <div className="flex items-center gap-2 mt-2">
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
                className="flex-1 bg-surface-container-high border border-secondary rounded-xl px-3 py-1.5 text-sm font-body text-on-surface outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => setEditingHeadline(true)}
              className="flex items-center gap-1.5 mt-2 group/hl"
            >
              <span className="text-sm font-body text-on-surface-variant group-hover/hl:text-on-surface transition-colors">
                {profile.headline || "Add a professional headline…"}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover/hl:opacity-100 transition-opacity" style={{ fontSize: "16px" }}>
                edit
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
