import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useUpdateProfile } from "../../../api/candidate/candidate.api";
import { ProfilePanel } from "../components/ProfilePanel";
import type { CandidateProfile } from "../../../types/candidate.types";

const aboutSchema = z.object({
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedInUrl: z.string().optional(),
  gitHubUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

type AboutForm = z.infer<typeof aboutSchema>;

interface ProfileAboutProps {
  profile: CandidateProfile;
}

const FIELDS: {
  key: keyof AboutForm;
  label: string;
  icon: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  { key: "bio", label: "Bio", icon: "description", placeholder: "Tell us about yourself…", multiline: true },
  { key: "phone", label: "Phone", icon: "phone", placeholder: "+1 (555) 000-0000" },
  { key: "location", label: "Location", icon: "location_on", placeholder: "City, Country" },
  { key: "linkedInUrl", label: "LinkedIn", icon: "link", placeholder: "https://linkedin.com/in/…" },
  { key: "gitHubUrl", label: "GitHub", icon: "code", placeholder: "https://github.com/…" },
  { key: "portfolioUrl", label: "Portfolio", icon: "language", placeholder: "https://…" },
];

export function ProfileAbout({ profile }: Readonly<ProfileAboutProps>) {
  const [editing, setEditing] = useState(false);
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AboutForm>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      bio: profile.bio ?? "",
      phone: profile.phone ?? "",
      location: profile.location ?? "",
      linkedInUrl: profile.linkedInUrl ?? "",
      gitHubUrl: profile.gitHubUrl ?? "",
      portfolioUrl: profile.portfolioUrl ?? "",
    },
  });

  const onSubmit = (data: AboutForm) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        toast.success("Profile updated");
        setEditing(false);
      },
      onError: () => toast.error("Failed to update profile"),
    });
  };

  const handleCancel = () => {
    reset();
    setEditing(false);
  };

  const profileValues: Record<string, string | null> = {
    bio: profile.bio,
    phone: profile.phone,
    location: profile.location,
    linkedInUrl: profile.linkedInUrl,
    gitHubUrl: profile.gitHubUrl,
    portfolioUrl: profile.portfolioUrl,
  };

  return (
    <ProfilePanel
      title="About"
      action={
        editing ? undefined : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-bold font-label text-secondary hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
            <span>Edit</span>
          </button>
        )
      }
    >
      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {FIELDS.map(({ key, label, icon, placeholder, multiline }) => (
            <div key={key}>
              <label className="flex items-center gap-2 text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{icon}</span>
                {label}
              </label>
              {multiline ? (
                <textarea
                  {...register(key)}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors resize-none"
                />
              ) : (
                <input
                  {...register(key)}
                  type="text"
                  placeholder={placeholder}
                  className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
                />
              )}
              {errors[key] && (
                <p className="text-xs text-error mt-1">{errors[key]?.message}</p>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {updateProfile.isPending && (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: "16px" }}>
                  progress_activity
                </span>
              )}
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-bold font-body text-sm hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {FIELDS.map(({ key, label, icon }) => {
            const value = profileValues[key];
            if (!value) return null;
            return (
              <div key={key} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
                  {icon}
                </span>
                <div>
                  <p className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">
                    {label}
                  </p>
                  {key.includes("Url") || key.includes("URL") ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-body text-secondary hover:underline break-all"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-body text-on-surface">{value}</p>
                  )}
                </div>
              </div>
            );
          })}
          {!FIELDS.some(({ key }) => profileValues[key]) && (
            <p className="text-sm text-on-surface-variant font-body">
              No information added yet. Click Edit to add your details.
            </p>
          )}
        </div>
      )}
    </ProfilePanel>
  );
}
