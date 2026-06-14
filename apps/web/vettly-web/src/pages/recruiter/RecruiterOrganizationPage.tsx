import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  useCreateOrganization,
  useJoinByCode,
  useMyOrganization,
  useRegenerateJoinCode,
  useSearchOrganizations,
  useUpdateOrganization,
} from "../../api/organization/organization.api";
import { useMyJobs } from "../../api/job/job.api";
import { EmptyState } from "../../components/EmptyState";
import { formatDate } from "../../utils/format";
import { useAuthStore } from "../../stores/authStore";
import { ROUTES } from "../../router/routes";
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

const inputClasses =
  "w-full bg-surface-container-high border border-outline-variant focus:border-secondary-fixed-dim rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors";
const labelClasses = "block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5";

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
        <label className={labelClasses}>Name</label>
        <input {...register("name")} type="text" placeholder="e.g. Acme Corp" className={inputClasses} />
        {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Industry</label>
          <input {...register("industry")} type="text" placeholder="e.g. Software" className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Website</label>
          <input {...register("website")} type="text" placeholder="https://…" className={inputClasses} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Company Size</label>
          <select {...register("companySize")} className={inputClasses}>
            <option value="">Select…</option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>{size} employees</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClasses}>Location</label>
          <input {...register("location")} type="text" placeholder="e.g. San Francisco, CA" className={inputClasses} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>LinkedIn URL</label>
          <input {...register("linkedInUrl")} type="text" placeholder="https://linkedin.com/company/…" className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Twitter / X URL</label>
          <input {...register("twitterUrl")} type="text" placeholder="https://x.com/…" className={inputClasses} />
        </div>
      </div>
      <div>
        <label className={labelClasses}>Description</label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="What does your organization do?"
          className={`${inputClasses} resize-none`}
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
    <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
      <span className="text-sm font-semibold font-headline text-on-surface">Set up your organization</span>
      <p className="text-[12.5px] font-body text-on-surface-variant mt-1.5 mb-4">
        You'll need an organization before you can post jobs. You'll be added as the owner.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <OrganizationFormFields register={register} errors={errors} />
        <button
          type="submit"
          disabled={createOrganization.isPending}
          className="flex items-center justify-center gap-2 h-[46px] px-5 rounded-[10px] bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[13.5px] hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {createOrganization.isPending && (
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: "16px" }}>
              progress_activity
            </span>
          )}
          Create Organization
        </button>
      </form>
    </div>
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
    <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
      <span className="text-sm font-semibold font-headline text-on-surface">Edit Organization</span>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <OrganizationFormFields register={register} errors={errors} />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={updateOrganization.isPending}
            className="flex items-center justify-center gap-2 h-[46px] px-5 rounded-[10px] bg-secondary-fixed-dim text-on-secondary-fixed font-semibold font-body text-[13.5px] hover:opacity-90 transition-opacity disabled:opacity-60"
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
            className="flex items-center justify-center h-[46px] px-5 rounded-[10px] border border-outline-variant text-on-surface-variant font-semibold font-body text-[13.5px] hover:bg-surface-container-highest transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function CompanyHeader({
  organization,
  onEdit,
}: Readonly<{ organization: Organization; onEdit: () => void }>) {
  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5 flex items-center gap-4">
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-on-secondary-fixed shrink-0"
        style={{ background: "linear-gradient(135deg,#F4A340,#E0852A)" }}
      >
        {organization.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-[20px] font-semibold font-headline text-on-surface tracking-tight truncate">
          {organization.name}
        </h1>
        <div className="flex items-center gap-3.5 mt-1.5 flex-wrap">
          {organization.industry && (
            <span className="flex items-center gap-1.5 text-[12.5px] font-body text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>category</span>
              {organization.industry}
            </span>
          )}
          {organization.companySize && (
            <span className="flex items-center gap-1.5 text-[12.5px] font-body text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>groups</span>
              {organization.companySize} employees
            </span>
          )}
          {organization.location && (
            <span className="flex items-center gap-1.5 text-[12.5px] font-body text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>location_on</span>
              {organization.location}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] border border-outline-variant text-on-surface font-semibold text-[12.5px] hover:bg-surface-container-highest transition-colors shrink-0"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
        Edit
      </button>
    </div>
  );
}

function AboutCard({ organization }: Readonly<{ organization: Organization }>) {
  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
      <span className="text-sm font-semibold font-headline text-on-surface">About</span>
      {organization.description ? (
        <p className="text-[13px] leading-6 font-body text-on-surface-variant mt-3 whitespace-pre-line">
          {organization.description}
        </p>
      ) : (
        <p className="text-[13px] font-body text-on-surface-variant mt-3">No description yet.</p>
      )}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-outline-variant/60">
        {organization.website && (
          <a
            href={organization.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12.5px] font-body text-secondary-fixed-dim hover:underline break-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>language</span>
            {organization.website}
          </a>
        )}
        {organization.linkedInUrl && (
          <a
            href={organization.linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12.5px] font-body text-secondary-fixed-dim hover:underline"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>link</span>
            LinkedIn
          </a>
        )}
        {organization.twitterUrl && (
          <a
            href={organization.twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12.5px] font-body text-secondary-fixed-dim hover:underline"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>link</span>
            Twitter / X
          </a>
        )}
        <span className="flex items-center gap-1.5 text-[12.5px] font-body text-on-surface-variant">
          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>calendar_today</span>
          Created {formatDate(organization.createdAt)}
        </span>
      </div>
    </div>
  );
}

function OpenRolesCard({ jobs, isLoading }: Readonly<{ jobs: JobSummaryLite[]; isLoading: boolean }>) {
  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
      <div className="px-5 py-[15px] border-b border-outline-variant">
        <span className="text-[14.5px] font-semibold font-headline text-on-surface">Open roles</span>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-highest animate-pulse rounded-lg h-14" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon="work_off" title="No open roles" description="Open roles will appear here." />
      ) : (
        <div>
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={ROUTES.RECRUITER_JOB_PIPELINE(job.id)}
              className="flex items-center justify-between gap-3 px-5 h-14 border-b border-outline-variant/60 last:border-b-0 hover:bg-surface-container-highest transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium font-body text-on-surface truncate">{job.title}</p>
                <p className="text-[11.5px] font-body text-on-surface-variant truncate">
                  {[job.location, job.jobType.replace("-", " ")].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className="font-mono text-[12.5px] font-semibold text-on-surface shrink-0">
                {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant shrink-0" style={{ fontSize: "18px" }}>
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamMembers({ organization }: Readonly<{ organization: Organization }>) {
  const { user } = useAuthStore();
  const members = organization.members ?? [];
  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
      <span className="text-sm font-semibold font-headline text-on-surface">Hiring team</span>
      {members.length === 0 ? (
        <p className="text-[12.5px] font-body text-on-surface-variant mt-3">No members yet.</p>
      ) : (
        <div className="flex flex-col mt-3">
          {members.map((member) => {
            const isYou = member.recruiterId === user?.id;
            const name = isYou ? `${user.firstName} ${user.lastName}`.trim() : "Team member";
            const initials = isYou
              ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
              : "TM";
            return (
              <div key={member.recruiterId} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center shrink-0 text-xs font-bold text-on-surface-variant">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium font-body text-on-surface truncate">
                    {name} {isYou && <span className="text-on-surface-variant font-normal">(You)</span>}
                  </p>
                  <p className="text-[11.5px] font-body text-on-surface-variant capitalize">
                    {member.role} · joined {formatDate(member.joinedAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JoinOrganizationPanel() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(handle);
  }, [query]);

  const searchQuery = useSearchOrganizations(debouncedQuery);
  const joinByCode = useJoinByCode();

  const results = searchQuery.data ?? [];

  const handleJoinByCode = (orgId: string) => {
    const code = (codeInputs[orgId] ?? "").trim();
    if (!code) return;
    joinByCode.mutate(code, {
      onSuccess: () => toast.success("Joined organization"),
      onError: (error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 404) toast.error("Invalid join code");
        else if (status === 409) toast.error("You already belong to an organization");
        else toast.error("Failed to join organization");
      },
    });
  };

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
      <span className="text-sm font-semibold font-headline text-on-surface">Join an organization</span>
      <p className="text-[12.5px] font-body text-on-surface-variant mt-1.5 mb-4">
        Search for your company's organization, then join instantly with an invite code shared by
        a colleague.
      </p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder="Search organizations by name…"
        className={inputClasses}
      />

      <div className="mt-4 flex flex-col gap-3">
        {debouncedQuery && searchQuery.isLoading && (
          <p className="text-[12.5px] font-body text-on-surface-variant">Searching…</p>
        )}
        {debouncedQuery && !searchQuery.isLoading && results.length === 0 && (
          <p className="text-[12.5px] font-body text-on-surface-variant">No organizations found.</p>
        )}
        {results.map((org) => (
          <div key={org.id} className="border border-outline-variant rounded-lg p-3.5">
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium font-body text-on-surface truncate">{org.name}</p>
              <p className="text-[11.5px] font-body text-on-surface-variant truncate">
                {[org.industry, org.location, `${org.memberCount} member${org.memberCount === 1 ? "" : "s"}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                value={codeInputs[org.id] ?? ""}
                onChange={(e) => setCodeInputs((prev) => ({ ...prev, [org.id]: e.target.value }))}
                type="text"
                placeholder="Have a code? Enter it here"
                className={`${inputClasses} flex-1 py-2 text-[12.5px]`}
              />
              <button
                type="button"
                onClick={() => handleJoinByCode(org.id)}
                disabled={joinByCode.isPending || !(codeInputs[org.id] ?? "").trim()}
                className="shrink-0 h-9 px-4 rounded-[10px] bg-secondary-fixed-dim text-on-secondary-fixed font-semibold text-[12.5px] hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoOrganizationSection() {
  const [tab, setTab] = useState<"create" | "join">("create");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 bg-surface-container-high border border-outline-variant rounded-xl p-1.5 w-fit">
        {(["create", "join"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-semibold text-[12.5px] font-label transition-colors ${
              tab === t
                ? "bg-secondary-fixed-dim text-on-secondary-fixed"
                : "text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            {t === "create" ? "Create Organization" : "Join Organization"}
          </button>
        ))}
      </div>
      {tab === "create" ? <CreateOrganizationForm /> : <JoinOrganizationPanel />}
    </div>
  );
}

function InviteTeammatesCard({ organization }: Readonly<{ organization: Organization }>) {
  const regenerateJoinCode = useRegenerateJoinCode();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!organization.joinCode) return;
    navigator.clipboard.writeText(organization.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (
      organization.joinCode &&
      !window.confirm("Regenerating will invalidate the current join code. Continue?")
    )
      return;
    regenerateJoinCode.mutate(undefined, {
      onSuccess: () => toast.success("Join code regenerated"),
      onError: () => toast.error("Failed to regenerate join code"),
    });
  };

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl p-5">
      <span className="text-sm font-semibold font-headline text-on-surface">Invite teammates</span>
      <p className="text-[12.5px] font-body text-on-surface-variant mt-1.5 mb-3">
        Share this code with colleagues so they can join your organization instantly.
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-surface-container-highest border border-outline-variant rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface tracking-widest">
          {organization.joinCode ?? "—"}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!organization.joinCode}
          className="h-[42px] px-4 rounded-[10px] border border-outline-variant text-on-surface font-semibold text-[12.5px] hover:bg-surface-container-highest transition-colors disabled:opacity-60"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenerateJoinCode.isPending}
          className="h-[42px] px-4 rounded-[10px] border border-outline-variant text-on-surface font-semibold text-[12.5px] hover:bg-surface-container-highest transition-colors disabled:opacity-60"
        >
          {organization.joinCode ? "Regenerate" : "Generate"}
        </button>
      </div>
    </div>
  );
}

interface JobSummaryLite {
  id: string;
  title: string;
  location: string | null;
  jobType: string;
  applicantCount: number;
}

export default function RecruiterOrganizationPage() {
  const { data: organization, isLoading, isError, error } = useMyOrganization();
  const jobsQuery = useMyJobs();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const status = (error as { response?: { status?: number } })?.response?.status;
  const notFound = isError && status === 404;

  const isOwner = organization?.members?.find((m) => m.recruiterId === user?.id)?.role === "owner";

  const jobs = jobsQuery.data ?? [];
  const openJobs = jobs.filter((j) => j.status === "open");
  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0);

  const statCells = [
    { icon: "work_outline", label: "Open Roles", value: openJobs.length },
    { icon: "groups", label: "Team Members", value: organization?.members?.length ?? 0 },
    { icon: "work", label: "Total Jobs", value: jobs.length },
    { icon: "group", label: "Total Applicants", value: totalApplicants },
  ];

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4">
      <div>
        <h1 className="text-[23px] font-semibold font-headline text-on-surface tracking-tight">
          Company
        </h1>
        <p className="text-on-surface-variant font-body text-sm mt-1">
          Manage your organization profile.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-surface-container-high animate-pulse rounded-xl h-48" />
      ) : organization ? (
        isEditing ? (
          <EditOrganizationForm organization={organization} onClose={() => setIsEditing(false)} />
        ) : (
          <>
            <CompanyHeader organization={organization} onEdit={() => setIsEditing(true)} />

            <div className="flex flex-col sm:flex-row bg-surface-container-high border border-outline-variant rounded-xl overflow-hidden">
              {statCells.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex-1 px-5 py-[18px] ${
                    i > 0 ? "border-t sm:border-t-0 sm:border-l border-outline-variant" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>{s.icon}</span>
                    <span className="text-[11.5px] font-medium font-label tracking-wide uppercase">{s.label}</span>
                  </div>
                  <div className="text-[26px] font-semibold font-headline text-on-surface leading-none mt-3">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-4 items-start">
              <div className="flex flex-col gap-4">
                <AboutCard organization={organization} />
                <OpenRolesCard jobs={openJobs} isLoading={jobsQuery.isLoading} />
              </div>
              <div className="flex flex-col gap-4">
                {isOwner && <InviteTeammatesCard organization={organization} />}
                <TeamMembers organization={organization} />
              </div>
            </div>
          </>
        )
      ) : notFound ? (
        <NoOrganizationSection />
      ) : (
        <p className="text-sm font-body text-error">Failed to load organization.</p>
      )}
    </div>
  );
}
