import { useState, useEffect } from "react";
import { updateCustomer } from "../../api/customer";

export default function EditCustomerModal({ customer, onClose, onSaved }: any) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (customer) {
      setForm(customer);
    }
  }, [customer]);

  if (!customer) return null;

  const change = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const save = async () => {
    await updateCustomer(customer.id, form);
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Customer</h2>

        <input name="name" value={form.name || ""} onChange={change} />
        <input name="phone" value={form.phone || ""} onChange={change} />
        <input name="email" value={form.email || ""} onChange={change} />
        <input name="address" value={form.address || ""} onChange={change} />

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
          <button onClick={save} className="primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
