import { useState } from "react";
import { createLead } from "../../api/lead";
import "./lead.css";

export default function AddLeadModal({
  open,
  onClose,
  onSuccess,
  defaultProjectId,
}: any) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    source: "",
    budget: "",
    requirement: "",
  });

  if (!open) return null;

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async () => {
    try {
      await createLead({
        ...form,
        budget: form.budget ? Number(form.budget) : null,
        ...(defaultProjectId && { projectId: defaultProjectId }),
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Lead create failed", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Lead</h2>

        <input name="name" placeholder="Name" onChange={handleChange} />

        <input name="phone" placeholder="Phone" onChange={handleChange} />

        <input name="email" placeholder="Email" onChange={handleChange} />

        <input
          name="source"
          placeholder="Source (Facebook, Website...)"
          onChange={handleChange}
        />

        <input name="budget" placeholder="Budget" onChange={handleChange} />

        <textarea
          name="requirement"
          placeholder="Requirement"
          onChange={handleChange}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={submit}>
            Create Lead
          </button>
        </div>
      </div>
    </div>
  );
}
