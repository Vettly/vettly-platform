import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  useCreateOrganization,
  useMyOrganization,
} from "../../api/organization/organization.api";
import { SectionCard } from "../../components/SectionCard";
import { formatDate } from "../../utils/format";

const orgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  industry: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

type OrgForm = z.infer<typeof orgSchema>;

function CreateOrganizationForm() {
  const createOrganization = useCreateOrganization();
  const { register, handleSubmit, formState: { errors } } = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: { name: "", industry: "", website: "", description: "" },
  });

  const onSubmit = (data: OrgForm) => {
    createOrganization.mutate(
      {
        name: data.name,
        industry: data.industry || undefined,
        website: data.website || undefined,
        description: data.description || undefined,
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

export default function RecruiterOrganizationPage() {
  const { data: organization, isLoading, isError, error } = useMyOrganization();

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
        <SectionCard title={organization.name} icon="apartment">
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
      ) : notFound ? (
        <CreateOrganizationForm />
      ) : (
        <p className="text-sm font-body text-error">Failed to load organization.</p>
      )}
    </div>
  );
}
