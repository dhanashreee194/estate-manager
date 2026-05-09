import { useState } from "react";
import { inviteUser } from "../api/user";
import "./inviteUserModal.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function InviteUserModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES" as "SALES" | "ACCOUNTANT" | "ADMIN",
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
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await inviteUser(form);

      setSuccess("User invited successfully 🎉");

      // Auto-close after 1.5s
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to invite user. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Invite User</h2>

        <div className="modal-form">
          {/* Alerts */}
          {success && <div className="alert success">{success}</div>}
          {error && <div className="alert error">{error}</div>}

          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Temporary Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as any })}
          >
            <option value="SALES">Sales</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="ADMIN">Admin</option>
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
              {loading ? "Inviting..." : "Invite User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
