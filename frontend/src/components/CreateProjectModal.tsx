import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      setError(t("createProject.required"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createProject(form);

      setSuccess(t("createProject.success"));

      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || t("common.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t("createProject.title")}</h2>

        <div className="modal-form">
          {success && <div className="alert success">{success}</div>}
          {error && <div className="alert error">{error}</div>}

          <input
            placeholder={t("createProject.name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder={t("createProject.location")}
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
            <option value="ACTIVE">{t("common.active")}</option>
            <option value="INACTIVE">{t("common.inactive")}</option>
          </select>

          <div className="modal-actions">
            <button
              className="btn-outline"
              onClick={handleClose}
              disabled={loading}
            >
              {t("common.cancel")}
            </button>

            <button className="btn-primary" onClick={submit} disabled={loading}>
              {loading ? t("common.saving") : t("nav.createProject")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
