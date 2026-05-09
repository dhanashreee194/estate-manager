import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createLabour } from "../../api/labour";
import "./labour.css";
export default function LabourMaster() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    dailyWage: 0,
  });

  const mutation = useMutation({
    mutationFn: createLabour,
    onSuccess: () => {
      setForm({ name: "", category: "", dailyWage: 0 });
      alert("Labour created");
    },
  });

  return (
    <div className="card">
      <h3>Create Labour</h3>

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Category (Mason, Helper)"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />

      <input
        type="number"
        placeholder="Daily Wage"
        value={form.dailyWage}
        onChange={(e) =>
          setForm({ ...form, dailyWage: Number(e.target.value) })
        }
      />

      <button onClick={() => mutation.mutate(form)}>Create Labour</button>
    </div>
  );
}
