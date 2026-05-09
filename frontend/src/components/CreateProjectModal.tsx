import { useState } from "react";

import "./inviteUserModal.css"; // reuse modal styles
import { createProject } from "../api/project";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CreateProjectModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    location: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setForm({ name: "", location: "", status: "ACTIVE" });
    setError(null);
    setSuccess(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!form.name || !form.location) {
      setError("Project name and location are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createProject(form);

      setSuccess("Project created successfully 🎉");

      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create Project</h2>

        <div className="modal-form">
          {success && <div className="alert success">{success}</div>}
          {error && <div className="alert error">{error}</div>}

          <input
            placeholder="Project Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as "ACTIVE" | "INACTIVE",
              })
            }
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <div className="modal-actions">
            <button
              className="btn-outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
