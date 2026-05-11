import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  useEducation,
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
} from "../../../api/candidate/candidate.api";
import { SectionCard } from "../components/SectionCard";
import type { Education } from "../../../types/candidate.types";

const eduSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  gpa: z.coerce.number().min(0).max(4).optional().or(z.literal("")),
});

type EduForm = z.infer<typeof eduSchema>;

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

function EducationForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: Education;
  onSave: (data: EduForm) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<EduForm>({
    resolver: zodResolver(eduSchema),
    defaultValues: initial
      ? {
          institution: initial.institution,
          degree: initial.degree,
          field: initial.field,
          startDate: isoToMonth(initial.startDate),
          endDate: initial.endDate ? isoToMonth(initial.endDate) : "",
          gpa: initial.gpa ?? undefined,
        }
      : {},
  });

  const onSubmit = (data: EduForm) => {
    onSave({
      ...data,
      startDate: monthToIso(data.startDate),
      endDate: data.endDate ? monthToIso(data.endDate) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-surface-container-low rounded-2xl p-5 border border-outline-variant">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">Institution *</label>
          <input
            {...register("institution")}
            placeholder="e.g. Massachusetts Institute of Technology"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
          {errors.institution && <p className="text-xs text-error mt-1">{errors.institution.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">Degree *</label>
          <input
            {...register("degree")}
            placeholder="e.g. Bachelor of Science"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
          {errors.degree && <p className="text-xs text-error mt-1">{errors.degree.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">Field *</label>
          <input
            {...register("field")}
            placeholder="e.g. Computer Science"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
          {errors.field && <p className="text-xs text-error mt-1">{errors.field.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">Start Date *</label>
          <input
            {...register("startDate")}
            type="month"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
          {errors.startDate && <p className="text-xs text-error mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">End Date</label>
          <input
            {...register("endDate")}
            type="month"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
          <p className="text-xs text-on-surface-variant mt-1">Leave blank if ongoing</p>
        </div>
        <div>
          <label className="text-xs font-bold font-label text-on-surface-variant uppercase tracking-wider block mb-1.5">GPA (0–4)</label>
          <input
            {...register("gpa")}
            type="number"
            step="0.01"
            min="0"
            max="4"
            placeholder="e.g. 3.8"
            className="w-full bg-surface-container-high border border-outline-variant focus:border-secondary rounded-xl px-4 py-2.5 text-sm font-body text-on-surface outline-none transition-colors"
          />
          {errors.gpa && <p className="text-xs text-error mt-1">{errors.gpa.message}</p>}
        </div>
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
          {initial ? "Save Changes" : "Add Education"}
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

export function EducationSection() {
  const { data: educations = [], isLoading } = useEducation();
  const addEdu = useAddEducation();
  const updateEdu = useUpdateEducation();
  const deleteEdu = useDeleteEducation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = (data: EduForm) => {
    const payload = { ...data, gpa: data.gpa === "" ? undefined : Number(data.gpa) };
    addEdu.mutate(payload as Parameters<typeof addEdu.mutate>[0], {
      onSuccess: () => {
        toast.success("Education added");
        setShowAddForm(false);
      },
      onError: () => toast.error("Failed to add education"),
    });
  };

  const handleUpdate = (id: string, data: EduForm) => {
    const payload = { ...data, gpa: data.gpa === "" ? undefined : Number(data.gpa) };
    updateEdu.mutate(
      { id, data: payload as Parameters<typeof updateEdu.mutate>[0]["data"] },
      {
        onSuccess: () => {
          toast.success("Education updated");
          setEditingId(null);
        },
        onError: () => toast.error("Failed to update education"),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteEdu.mutate(id, {
      onSuccess: () => {
        toast.success("Education deleted");
        setConfirmDeleteId(null);
      },
      onError: () => toast.error("Failed to delete education"),
    });
  };

  return (
    <SectionCard
      title="Education"
      icon="school"
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
          <EducationForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
            isPending={addEdu.isPending}
          />
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-surface-container-high animate-pulse rounded-xl h-20" />
            ))}
          </div>
        ) : educations.length === 0 && !showAddForm ? (
          <div className="text-center py-8 space-y-2">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "36px" }}>school</span>
            <p className="text-sm font-body text-on-surface-variant">No education added yet.</p>
          </div>
        ) : (
          educations.map((edu) => (
            <div key={edu.id}>
              {editingId === edu.id ? (
                <EducationForm
                  initial={edu}
                  onSave={(data) => handleUpdate(edu.id, data)}
                  onCancel={() => setEditingId(null)}
                  isPending={updateEdu.isPending}
                />
              ) : (
                <div className="flex items-start gap-4 py-3 border-b border-outline-variant last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-secondary-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "18px" }}>school</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold font-body text-on-surface">{edu.degree} in {edu.field}</p>
                    <p className="text-sm text-on-surface-variant font-body">{edu.institution}</p>
                    <p className="text-xs text-on-surface-variant font-label mt-0.5">
                      {formatMonthYear(edu.startDate)} — {edu.endDate ? formatMonthYear(edu.endDate) : "Present"}
                      {edu.gpa != null && ` · GPA ${edu.gpa}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingId(edu.id); setShowAddForm(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
                    </button>
                    {confirmDeleteId === edu.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(edu.id)}
                          disabled={deleteEdu.isPending}
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
                        onClick={() => setConfirmDeleteId(edu.id)}
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
