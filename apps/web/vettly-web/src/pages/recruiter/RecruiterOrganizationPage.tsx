import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  useCreateOrganization,
  useMyOrganization,
  useUpdateOrganization,
} from "../../api/organization/organization.api";
import { SectionCard } from "../../components/SectionCard";
import { EmptyState } from "../../components/EmptyState";
import { formatDate } from "../../utils/format";
import { useAuthStore } from "../../stores/authStore";
import type { Organization } from "../../types/organization.types";

const orgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  companySize: z.string().optional(),
  location: z.string().optional(),
  linkedInUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
});

type OrgForm = z.infer<typeof orgSchema>;

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

function OrganizationFormFields({
  register,
  errors,
}: Readonly<{
  register: ReturnType<typeof useForm<OrgForm>>["register"];
  errors: ReturnType<typeof useForm<OrgForm>>["formState"]["errors"];
}>) {
  return (
    <>
      <div>
        <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
          Name
        </label>
        <input
          {...register("name")}
          type="text"
          placeholder="e.g. Acme Corp"
          className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
        />
        {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
            Industry
          </label>
          <input
            {...register("industry")}
            type="text"
            placeholder="e.g. Software"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
            Website
          </label>
          <input
            {...register("website")}
            type="text"
            placeholder="https://…"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
            Company Size
          </label>
          <select
            {...register("companySize")}
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          >
            <option value="">Select…</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>{size} employees</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
            Location
          </label>
          <input
            {...register("location")}
            type="text"
            placeholder="e.g. San Francisco, CA"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
            LinkedIn URL
          </label>
          <input
            {...register("linkedInUrl")}
            type="text"
            placeholder="https://linkedin.com/company/…"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
            Twitter / X URL
          </label>
          <input
            {...register("twitterUrl")}
            type="text"
            placeholder="https://x.com/…"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="What does your organization do?"
          className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors resize-none"
        />
      </div>
    </>
  );
}

function CreateOrganizationForm() {
  const createOrganization = useCreateOrganization();
  const { register, handleSubmit, formState: { errors } } = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "", industry: "", website: "", description: "",
      companySize: "", location: "", linkedInUrl: "", twitterUrl: "",
    },
  });

  const onSubmit = (data: OrgForm) => {
    createOrganization.mutate(
      {
        name: data.name,
        industry: data.industry || undefined,
        website: data.website || undefined,
        description: data.description || undefined,
        companySize: data.companySize || undefined,
        location: data.location || undefined,
        linkedInUrl: data.linkedInUrl || undefined,
        twitterUrl: data.twitterUrl || undefined,
      },
      {
        onSuccess: () => toast.success("Organization created"),
        onError: () => toast.error("Failed to create organization"),
      }
    );
  };

  return (
    <SectionCard title="Set up your organization" icon="apartment">
      <p className="text-sm font-body text-on-surface-variant mb-4">
        You'll need an organization before you can post jobs. You'll be added as the owner.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <OrganizationFormFields register={register} errors={errors} />
        <button
          type="submit"
          disabled={createOrganization.isPending}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {createOrganization.isPending && (
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: "16px" }}>
              progress_activity
            </span>
          )}
          Create Organization
        </button>
      </form>
    </SectionCard>
  );
}

function EditOrganizationForm({
  organization,
  onClose,
}: Readonly<{ organization: Organization; onClose: () => void }>) {
  const updateOrganization = useUpdateOrganization();
  const { register, handleSubmit, formState: { errors } } = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: organization.name,
      industry: organization.industry ?? "",
      website: organization.website ?? "",
      description: organization.description ?? "",
      companySize: organization.companySize ?? "",
      location: organization.location ?? "",
      linkedInUrl: organization.linkedInUrl ?? "",
      twitterUrl: organization.twitterUrl ?? "",
    },
  });

  const onSubmit = (data: OrgForm) => {
    updateOrganization.mutate(
      {
        name: data.name,
        industry: data.industry || undefined,
        website: data.website || undefined,
        description: data.description || undefined,
        companySize: data.companySize || undefined,
        location: data.location || undefined,
        linkedInUrl: data.linkedInUrl || undefined,
        twitterUrl: data.twitterUrl || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Organization updated");
          onClose();
        },
        onError: () => toast.error("Failed to update organization"),
      }
    );
  };

  return (
    <SectionCard title="Edit Organization" icon="edit">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <OrganizationFormFields register={register} errors={errors} />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={updateOrganization.isPending}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {updateOrganization.isPending && (
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: "16px" }}>
                progress_activity
              </span>
            )}
            Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-bold font-body text-sm hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

function OrganizationDetails({
  organization,
  onEdit,
}: Readonly<{ organization: Organization; onEdit: () => void }>) {
  return (
    <SectionCard
      title={organization.name}
      icon="apartment"
      action={
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs font-bold font-label text-secondary hover:underline"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
          Edit
        </button>
      }
    >
      <div className="space-y-3">
        {organization.industry && (
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
              category
            </span>
            <div>
              <p className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Industry</p>
              <p className="text-sm font-body text-on-surface">{organization.industry}</p>
            </div>
          </div>
        )}
        {organization.location && (
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
              location_on
            </span>
            <div>
              <p className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Location</p>
              <p className="text-sm font-body text-on-surface">{organization.location}</p>
            </div>
          </div>
        )}
        {organization.companySize && (
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
              groups
            </span>
            <div>
              <p className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Company Size</p>
              <p className="text-sm font-body text-on-surface">{organization.companySize} employees</p>
            </div>
          </div>
        )}
        {organization.website && (
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
              language
            </span>
            <div>
              <p className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Website</p>
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-body text-secondary hover:underline break-all"
              >
                {organization.website}
              </a>
            </div>
          </div>
        )}
        {(organization.linkedInUrl || organization.twitterUrl) && (
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
              share
            </span>
            <div>
              <p className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Social</p>
              <div className="flex gap-3">
                {organization.linkedInUrl && (
                  <a href={organization.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-body text-secondary hover:underline">
                    LinkedIn
                  </a>
                )}
                {organization.twitterUrl && (
                  <a href={organization.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-body text-secondary hover:underline">
                    Twitter / X
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
        {organization.description && (
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
              description
            </span>
            <div>
              <p className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Description</p>
              <p className="text-sm font-body text-on-surface">{organization.description}</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5" style={{ fontSize: "18px" }}>
            calendar_today
          </span>
          <div>
            <p className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider">Created</p>
            <p className="text-sm font-body text-on-surface">{formatDate(organization.createdAt)}</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function TeamMembers({ organization }: Readonly<{ organization: Organization }>) {
  const { user } = useAuthStore();
  const members = organization.members ?? [];
  return (
    <SectionCard title="Team Members" icon="groups">
      {members.length === 0 ? (
        <EmptyState icon="group_off" title="No members yet" />
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const isYou = member.recruiterId === user?.id;
            const name = isYou ? `${user.firstName} ${user.lastName}`.trim() : "Team member";
            return (
              <div
                key={member.recruiterId}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container-low"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "16px" }}>
                      person
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold font-body text-on-surface truncate">
                      {name} {isYou && <span className="text-on-surface-variant font-normal">(You)</span>}
                    </p>
                    <p className="text-xs text-on-surface-variant font-body">
                      Joined {formatDate(member.joinedAt)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold font-label text-on-secondary-container bg-secondary-container px-2.5 py-1 rounded-full capitalize shrink-0 ml-2">
                  {member.role}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

export default function RecruiterOrganizationPage() {
  const { data: organization, isLoading, isError, error } = useMyOrganization();
  const [isEditing, setIsEditing] = useState(false);

  const status = (error as { response?: { status?: number } })?.response?.status;
  const notFound = isError && status === 404;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold font-headline text-on-surface">
          Organization
        </h1>
        <p className="text-on-surface-variant font-body text-sm mt-1">
          Manage your organization profile.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-surface-container-high animate-pulse rounded-2xl h-48" />
      ) : organization ? (
        <div className="space-y-6">
          {isEditing ? (
            <EditOrganizationForm organization={organization} onClose={() => setIsEditing(false)} />
          ) : (
            <OrganizationDetails organization={organization} onEdit={() => setIsEditing(true)} />
          )}
          <TeamMembers organization={organization} />
        </div>
      ) : notFound ? (
        <CreateOrganizationForm />
      ) : (
        <p className="text-sm font-body text-error">Failed to load organization.</p>
      )}
    </div>
  );
}
