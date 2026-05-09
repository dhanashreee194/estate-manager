import { useState, useEffect } from "react";
import { updateLead } from "../../api/lead";
import "./lead.css";

export default function LeadEditModal({ lead, onClose, onSaved }: any) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (lead) {
      setForm(lead);
    }
  }, [lead]);

  if (!lead) return null;

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const save = async () => {
    try {
      await updateLead(lead.id, form);
      onSaved();
      onClose();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Lead</h2>

        <input name="name" value={form.name || ""} onChange={handleChange} />

        <input name="phone" value={form.phone || ""} onChange={handleChange} />

        <input name="email" value={form.email || ""} onChange={handleChange} />

        <input
          name="source"
          value={form.source || ""}
          onChange={handleChange}
        />

        <input
          name="budget"
          value={form.budget || ""}
          onChange={handleChange}
        />

        <textarea
          name="requirement"
          value={form.requirement || ""}
          onChange={handleChange}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>

          <button className="primary" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
