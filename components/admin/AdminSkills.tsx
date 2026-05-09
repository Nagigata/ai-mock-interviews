"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, Layers, Lock, Plus, Unlock, X } from "lucide-react";
import {
  createAdminSkill,
  updateAdminSkill,
} from "@/lib/actions/admin.actions";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSelectFilter from "@/components/admin/AdminSelectFilter";
import AdminStatePanel from "@/components/admin/AdminStatePanel";

interface AdminSkillsProps {
  skills: any[] | null;
  currentStatus: string;
}

interface SkillStatusDialog {
  id: string;
  name: string;
  slug: string;
  challengeCount: number;
  isActive: boolean;
}

interface SkillNoticeDialog {
  title: string;
  description: string;
  warning?: string;
}

const emptySkillForm = {
  name: "",
  slug: "",
  description: "",
  icon: "",
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const statusOptions = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
];

export default function AdminSkillsClient({
  skills,
  currentStatus,
}: AdminSkillsProps) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusDialog, setStatusDialog] = useState<SkillStatusDialog | null>(
    null,
  );
  const [noticeDialog, setNoticeDialog] = useState<SkillNoticeDialog | null>(
    null,
  );
  const [editForm, setEditForm] = useState(emptySkillForm);
  const [form, setForm] = useState(emptySkillForm);

  const getErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const handleStatusFilterChange = (value: string) => {
    const params = new URLSearchParams();
    if (value !== "all") params.set("status", value);
    router.push(`/admin/skills${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const validateSkillForm = (
    skillForm: typeof emptySkillForm,
    currentSkillId?: string,
  ) => {
    const name = skillForm.name.trim();
    const slug = skillForm.slug.trim();
    const normalizedName = name.toLowerCase();
    const normalizedSlug = slug.toLowerCase();

    if (!name || !slug) {
      return {
        title: "Invalid Skill",
        description: "Name and slug are required.",
        warning: "Please fill in both fields before saving.",
      };
    }

    const duplicatedName = skills?.find(
      (skill: any) =>
        skill.name?.trim().toLowerCase() === normalizedName &&
        (!currentSkillId || skill.id !== currentSkillId),
    );

    if (duplicatedName) {
      return {
        title: "Duplicated Name",
        description: `The name "${name}" is already used by another skill.`,
        warning: "Please choose a unique skill name before saving.",
      };
    }

    const duplicatedSlug = skills?.find(
      (skill: any) =>
        skill.slug?.trim().toLowerCase() === normalizedSlug &&
        (!currentSkillId || skill.id !== currentSkillId),
    );

    if (duplicatedSlug) {
      return {
        title: "Duplicated Slug",
        description: `The slug "${slug}" is already used by another skill.`,
        warning: "Please choose a unique slug before saving.",
      };
    }

    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateSkillForm(form);
    if (validationError) {
      setNoticeDialog(validationError);
      return;
    }

    setCreating(true);
    try {
      await createAdminSkill({
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim(),
      });
      setShowCreateForm(false);
      setForm(emptySkillForm);
      router.refresh();
    } catch (error) {
      setNoticeDialog({
        title: "Create Skill Failed",
        description: getErrorMessage(error, "Failed to create skill"),
        warning:
          "Please check whether the skill name and slug are unique, then try again.",
      });
    }
    setCreating(false);
  };

  const handleStartEdit = (skill: any) => {
    setEditingId(skill.id);
    setEditForm({
      name: skill.name,
      slug: skill.slug,
      description: skill.description || "",
      icon: skill.icon || "",
    });
  };

  const handleSaveEdit = async (id: string) => {
    const validationError = validateSkillForm(editForm, id);
    if (validationError) {
      setNoticeDialog(validationError);
      return;
    }

    try {
      await updateAdminSkill(id, {
        ...editForm,
        name: editForm.name.trim(),
        slug: editForm.slug.trim(),
      });
      setEditingId(null);
      router.refresh();
    } catch (error) {
      setNoticeDialog({
        title: "Update Skill Failed",
        description: getErrorMessage(error, "Failed to update skill"),
        warning:
          "Please check whether the skill name and slug are unique, then try again.",
      });
    }
  };

  const openStatusDialog = (skill: any) => {
    setStatusDialog({
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      challengeCount: skill._count?.challenges || 0,
      isActive: skill.isActive !== false,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusDialog) return;

    setStatusUpdatingId(statusDialog.id);
    try {
      await updateAdminSkill(statusDialog.id, {
        isActive: !statusDialog.isActive,
      });
      setStatusDialog(null);
      router.refresh();
    } catch (error) {
      setNoticeDialog({
        title: statusDialog.isActive
          ? "Disable Skill Failed"
          : "Enable Skill Failed",
        description: getErrorMessage(
          error,
          statusDialog.isActive
            ? "Failed to disable skill"
            : "Failed to enable skill",
        ),
      });
    }
    setStatusUpdatingId(null);
  };

  if (!skills) {
    return (
      <AdminStatePanel
        title="Failed to load skills"
        description="The skill taxonomy could not be loaded. Please refresh the page or try again later."
        tone="danger"
        className="h-[60vh]"
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminPageHeader
        eyebrow="Skill taxonomy"
        title="Skill Management"
        description="Manage the learning tracks that organize challenges across the preparation experience."
        icon={Layers}
        metrics={[`${skills.length} total skills`]}
        actions={
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 rounded-xl bg-primary-200/15 px-4 py-2 text-sm font-medium text-primary-200 transition-colors hover:bg-primary-200/25"
          >
            {showCreateForm ? (
              <X className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {showCreateForm ? "Cancel" : "New Skill"}
          </button>
        }
      />

      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-2xl border border-white/10 bg-dark-200/50 p-6"
        >
          <h3 className="text-base font-semibold text-white">Create Skill</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-light-400">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, slug: toSlug(name) });
                }}
                className="w-full rounded-lg border border-white/10 bg-dark-100 px-3 py-2 text-sm text-white focus:border-primary-200/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-light-400">Slug</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-dark-100 px-3 py-2 text-sm text-white focus:border-primary-200/50 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-light-400">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-dark-100 px-3 py-2 text-sm text-white focus:border-primary-200/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-light-400">
              Icon URL
            </label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-dark-100 px-3 py-2 text-sm text-white focus:border-primary-200/50 focus:outline-none"
              placeholder="https://cdn.jsdelivr.net/..."
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-primary-200 px-6 py-2 text-sm font-bold text-dark-100 transition-colors hover:bg-primary-200/80 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Skill"}
          </button>
        </form>
      )}

      <AdminFilterBar className="lg:justify-end">
        <div className="grid gap-3 sm:grid-cols-1">
          <AdminSelectFilter
            label="Status"
            value={currentStatus || "all"}
            options={statusOptions}
            onChange={handleStatusFilterChange}
          />
        </div>
      </AdminFilterBar>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.length ? skills.map((skill: any) => (
          <div
            key={skill.id}
            className="flex min-h-[160px] rounded-2xl border border-white/5 bg-dark-200/50 p-5 transition-all hover:border-white/10"
          >
            {editingId === skill.id ? (
              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-dark-100 px-3 py-1.5 text-sm text-white focus:outline-none"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={editForm.slug}
                  onChange={(e) =>
                    setEditForm({ ...editForm, slug: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-dark-100 px-3 py-1.5 text-sm text-white focus:outline-none"
                  placeholder="Slug"
                />
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-dark-100 px-3 py-1.5 text-sm text-white focus:outline-none"
                  placeholder="Description"
                />
                <input
                  type="text"
                  value={editForm.icon}
                  onChange={(e) =>
                    setEditForm({ ...editForm, icon: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-dark-100 px-3 py-1.5 text-sm text-white focus:outline-none"
                  placeholder="Icon URL"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(skill.id)}
                    className="rounded-lg bg-primary-200 px-3 py-1 text-xs font-medium text-dark-100"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-white/10 px-3 py-1 text-xs text-light-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col">
                <div className="flex items-start gap-3">
                  {skill.icon ? (
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="mt-0.5 size-8 object-contain"
                    />
                  ) : (
                    <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-primary-200/10">
                      <Code2 className="size-4 text-primary-200" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {skill.name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          skill.isActive === false
                            ? "bg-red-500/15 text-red-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {skill.isActive === false ? "Disabled" : "Active"}
                      </span>
                    </div>
                    <p className="text-xs text-light-400">{skill.slug}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-xs text-light-400">
                  {skill.description || "No description"}
                </p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                  <span className="text-xs text-light-400">
                    {skill._count?.challenges || 0} challenges
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(skill)}
                      className="rounded-lg border border-white/10 px-3 py-1 text-xs text-light-400 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openStatusDialog(skill)}
                      disabled={statusUpdatingId === skill.id}
                      className={`rounded-lg border p-1.5 transition-colors disabled:opacity-50 ${
                        skill.isActive === false
                          ? "border-emerald-400/10 text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400"
                          : "border-red-400/10 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                      }`}
                      title={
                        skill.isActive === false
                          ? "Enable skill"
                          : "Disable skill"
                      }
                    >
                      {skill.isActive === false ? (
                        <Unlock className="size-3.5" />
                      ) : (
                        <Lock className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )) : (
          <AdminStatePanel
            title="No skills found"
            description="Try changing the status filter."
            className="col-span-full"
          />
        )}
      </div>

      {statusDialog && (
        <AdminConfirmDialog
          title={statusDialog.isActive ? "Disable Skill" : "Enable Skill"}
          description={
            statusDialog.isActive
              ? "This skill and its challenges will be hidden from users."
              : "This skill and its active challenges will be visible to users again."
          }
          itemName={statusDialog.name}
          itemMeta={`${statusDialog.slug} • ${statusDialog.challengeCount} challenge(s)`}
          warning={
            statusDialog.isActive
              ? "Existing challenges, submissions, and bookmarks will be kept for history."
              : undefined
          }
          confirmLabel={statusDialog.isActive ? "Disable" : "Enable"}
          variant={statusDialog.isActive ? "danger" : "success"}
          loading={statusUpdatingId === statusDialog.id}
          onCancel={() => setStatusDialog(null)}
          onConfirm={handleConfirmStatusChange}
        />
      )}

      {noticeDialog && (
        <AdminConfirmDialog
          title={noticeDialog.title}
          description={noticeDialog.description}
          warning={noticeDialog.warning}
          confirmLabel="Got it"
          variant="warning"
          hideCancel
          onCancel={() => setNoticeDialog(null)}
          onConfirm={() => setNoticeDialog(null)}
        />
      )}
    </div>
  );
}
