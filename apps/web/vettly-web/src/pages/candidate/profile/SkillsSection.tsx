import { useState } from "react";
import { toast } from "react-toastify";
import { useSkills, useAddSkill, useDeleteSkill } from "../../../api/candidate/candidate.api";
import { ProfilePanel } from "../components/ProfilePanel";

export function SkillsSection() {
  const { data: skills = [], isLoading } = useSkills();
  const addSkill = useAddSkill();
  const deleteSkill = useDeleteSkill();

  const [inputValue, setInputValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    const name = inputValue.trim();
    if (!name) return;
    addSkill.mutate(
      { name },
      {
        onSuccess: () => {
          toast.success("Skill added");
          setInputValue("");
        },
        onError: () => toast.error("Failed to add skill"),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteSkill.mutate(id, {
      onSuccess: () => {
        toast.success("Skill removed");
        setConfirmDeleteId(null);
      },
      onError: () => toast.error("Failed to remove skill"),
    });
  };

  return (
    <ProfilePanel title="Skills">
      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-high animate-pulse rounded-full h-8 w-20" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 items-center">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-bold font-label"
            >
              {skill.name}
              {skill.level && (
                <span className="text-xs opacity-70 font-normal">· {skill.level}</span>
              )}
              {confirmDeleteId === skill.id ? (
                <span className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => handleDelete(skill.id)}
                    disabled={deleteSkill.isPending}
                    className="text-error hover:opacity-80 transition-opacity text-xs font-bold"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-on-surface-variant hover:opacity-80 transition-opacity text-xs"
                  >
                    ✗
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(skill.id)}
                  className="ml-0.5 text-on-secondary-container/60 hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
                </button>
              )}
            </span>
          ))}

          {/* Add skill input */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Add skill…"
              className="px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface text-sm font-body border border-dashed border-outline-variant focus:border-secondary focus:outline-none transition-colors w-32 focus:w-44"
            />
            <button
              onClick={handleAdd}
              disabled={!inputValue.trim() || addSkill.isPending}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary text-on-secondary disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {addSkill.isPending ? (
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: "14px" }}>progress_activity</span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
              )}
            </button>
          </div>
        </div>
      )}

      {skills.length === 0 && !isLoading && (
        <p className="text-sm text-on-surface-variant font-body mt-3">
          Type a skill name above and press Enter to add it.
        </p>
      )}
    </ProfilePanel>
  );
}
