import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useCreateJob, useUpdateJob } from "../../../api/job/job.api";
import type { Job, JobSummary } from "../../../types/job.types";

const JOB_TYPES = ["full-time", "part-time", "contract", "remote"];
const EXPERIENCE_LEVELS = ["junior", "mid", "senior"];

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
  jobType: z.string().min(1, "Job type is required"),
  experienceLevel: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
});

type JobForm = z.infer<typeof jobSchema>;

function toNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function JobFormModal({
  job,
  onClose,
}: Readonly<{
  job: JobSummary | Job | null;
  onClose: () => void;
}>) {
  const isEditing = !!job;
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const isPending = createJob.isPending || updateJob.isPending;

  const { register, handleSubmit, formState: { errors } } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title ?? "",
      description: "description" in (job ?? {}) ? (job as Job).description : "",
      location: job?.location ?? "",
      jobType: job?.jobType ?? "",
      experienceLevel: job?.experienceLevel ?? "",
      salaryMin: job?.salaryMin?.toString() ?? "",
      salaryMax: job?.salaryMax?.toString() ?? "",
    },
  });

  const onSubmit = (data: JobForm) => {
    const payload = {
      title: data.title,
      description: data.description,
      location: data.location || undefined,
      jobType: data.jobType,
      experienceLevel: data.experienceLevel || undefined,
      salaryMin: toNumber(data.salaryMin),
      salaryMax: toNumber(data.salaryMax),
    };

    if (isEditing && job) {
      updateJob.mutate(
        { id: job.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Job updated");
            onClose();
          },
          onError: () => toast.error("Failed to update job"),
        }
      );
    } else {
      createJob.mutate(payload, {
        onSuccess: () => {
          toast.success("Job created as draft");
          onClose();
        },
        onError: (error) => {
          const message = (error as { response?: { data?: { message?: string } } })
            ?.response?.data?.message;
          toast.error(message ?? "Failed to create job");
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container rounded-2xl border border-outline-variant w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="font-headline font-bold text-on-surface text-lg">
            {isEditing ? "Edit Job" : "Post a Job"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              {...register("title")}
              type="text"
              placeholder="e.g. Senior Backend Engineer"
              className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
            />
            {errors.title && <p className="text-xs text-error mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Describe the role, responsibilities, and requirements…"
              className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors resize-none"
            />
            {errors.description && (
              <p className="text-xs text-error mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
                Job Type
              </label>
              <select
                {...register("jobType")}
                className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors capitalize"
              >
                <option value="">Select…</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
              {errors.jobType && <p className="text-xs text-error mt-1">{errors.jobType.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
                Experience Level
              </label>
              <select
                {...register("experienceLevel")}
                className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors capitalize"
              >
                <option value="">Any</option>
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l} value={l} className="capitalize">{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
              Location
            </label>
            <input
              {...register("location")}
              type="text"
              placeholder="e.g. Remote, San Francisco…"
              className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
                Salary Min
              </label>
              <input
                {...register("salaryMin")}
                type="number"
                placeholder="e.g. 80000"
                className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider mb-1.5">
                Salary Max
              </label>
              <input
                {...register("salaryMax")}
                type="number"
                placeholder="e.g. 120000"
                className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isPending && (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: "16px" }}>
                  progress_activity
                </span>
              )}
              {isEditing ? "Save Changes" : "Create Job"}
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
      </div>
    </div>
  );
}
