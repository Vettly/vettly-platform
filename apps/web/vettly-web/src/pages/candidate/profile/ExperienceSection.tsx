import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  useExperience,
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
} from "../../../api/candidate/candidate.api";
import { SectionCard } from "../components/SectionCard";
import type { Experience } from "../../../types/candidate.types";

const expSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().max(500).optional(),
});

type ExpForm = z.infer<typeof expSchema>;

function formatMonthYear(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function isoToMonth(iso: string) {
  return iso.slice(0, 7);
}

function monthToIso(month: string) {
  return month ? `${month}-01` : "";
}

function ExperienceForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: Experience;
  onSave: (data: ExpForm) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ExpForm>({
    resolver: zodResolver(expSchema),
    defaultValues: initial
      ? {
          company: initial.company,
          role: initial.role,
          startDate: isoToMonth(initial.startDate),
          endDate: initial.endDate ? isoToMonth(initial.endDate) : "",
          description: initial.description ?? "",
        }
      : {},
  });

  const onSubmit = (data: ExpForm) => {
    onSave({
      ...data,
      startDate: monthToIso(data.startDate),
      endDate: data.endDate ? monthToIso(data.endDate) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-surface-container-low rounded-2xl p-5 border border-outline-variant">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">
            Company *
          </label>
          <input
            {...register("company")}
            placeholder="e.g. Acme Corp"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
          {errors.company && <p className="text-xs text-error mt-1">{errors.company.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">
            Role *
          </label>
          <input
            {...register("role")}
            placeholder="e.g. Software Engineer"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
          {errors.role && <p className="text-xs text-error mt-1">{errors.role.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">
            Start Date *
          </label>
          <input
            {...register("startDate")}
            type="month"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
          {errors.startDate && <p className="text-xs text-error mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">
            End Date
          </label>
          <input
            {...register("endDate")}
            type="month"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
          <p className="text-xs text-on-surface-variant mt-1">Leave blank if current</p>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Describe your responsibilities and achievements…"
          className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors resize-none"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isPending && (
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: "16px" }}>progress_activity</span>
          )}
          {initial ? "Save Changes" : "Add Experience"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-bold font-body text-sm hover:bg-surface-container transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ExperienceSection() {
  const { data: experiences = [], isLoading } = useExperience();
  const addExp = useAddExperience();
  const updateExp = useUpdateExperience();
  const deleteExp = useDeleteExperience();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = (data: ExpForm) => {
    addExp.mutate(data as Parameters<typeof addExp.mutate>[0], {
      onSuccess: () => {
        toast.success("Experience added");
        setShowAddForm(false);
      },
      onError: () => toast.error("Failed to add experience"),
    });
  };

  const handleUpdate = (id: string, data: ExpForm) => {
    updateExp.mutate(
      { id, data: data as Parameters<typeof updateExp.mutate>[0]["data"] },
      {
        onSuccess: () => {
          toast.success("Experience updated");
          setEditingId(null);
        },
        onError: () => toast.error("Failed to update experience"),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteExp.mutate(id, {
      onSuccess: () => {
        toast.success("Experience deleted");
        setConfirmDeleteId(null);
      },
      onError: () => toast.error("Failed to delete experience"),
    });
  };

  return (
    <SectionCard
      title="Experience"
      icon="work_history"
      action={
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); }}
          className="flex items-center gap-1.5 text-sm font-bold font-label text-secondary hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
          Add
        </button>
      }
    >
      <div className="space-y-4">
        {showAddForm && (
          <ExperienceForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            isPending={addExp.isPending}
          />
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-surface-container-high animate-pulse rounded-xl h-20" />
            ))}
          </div>
        ) : experiences.length === 0 && !showAddForm ? (
          <div className="text-center py-8 space-y-2">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "36px" }}>work_history</span>
            <p className="text-sm font-body text-on-surface-variant">No experience added yet.</p>
          </div>
        ) : (
          experiences.map((exp) => (
            <div key={exp.id}>
              {editingId === exp.id ? (
                <ExperienceForm
                  initial={exp}
                  onSave={(data) => handleUpdate(exp.id, data)}
                  onCancel={() => setEditingId(null)}
                  isPending={updateExp.isPending}
                />
              ) : (
                <div className="flex items-start gap-4 py-3 border-b border-outline-variant last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "18px" }}>business</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold font-body text-on-surface">{exp.role}</p>
                    <p className="text-sm text-on-surface-variant font-body">{exp.company}</p>
                    <p className="text-xs text-on-surface-variant font-label mt-0.5">
                      {formatMonthYear(exp.startDate)} — {exp.endDate ? formatMonthYear(exp.endDate) : "Present"}
                    </p>
                    {exp.description && (
                      <p className="text-sm font-body text-on-surface-variant mt-1 line-clamp-2">{exp.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingId(exp.id); setShowAddForm(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                    </button>
                    {confirmDeleteId === exp.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(exp.id)}
                          disabled={deleteExp.isPending}
                          className="text-xs font-bold font-label text-error hover:underline px-2"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs font-label text-on-surface-variant hover:underline px-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(exp.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error-container hover:text-on-error-container text-on-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}
