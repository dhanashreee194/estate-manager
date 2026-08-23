import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inviteUser } from "../api/user";
import "./inviteUserModal.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

type InviteRole = "SUPERVISOR" | "SALES" | "ACCOUNTANT";

export default function InviteUserModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES" as InviteRole,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const resetState = () => {
    setError(null);
    setSuccess(null);
    setLoading(false);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "SALES",
    });
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError(t("invite.allRequired"));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await inviteUser(form);

      setSuccess(t("invite.success"));

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || t("common.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t("invite.title")}</h2>

        <div className="modal-form">
          {success && <div className="alert success">{success}</div>}
          {error && <div className="alert error">{error}</div>}

          <input
            placeholder={t("invite.fullName")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder={t("common.email")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder={t("invite.tempPassword")}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as InviteRole })
            }
          >
            <option value="SUPERVISOR">{t("invite.roleSupervisor")}</option>
            <option value="SALES">{t("invite.roleSales")}</option>
            <option value="ACCOUNTANT">{t("invite.roleAccountant")}</option>
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
              {loading ? t("common.saving") : t("nav.inviteUser")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
