import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createLabour, getLabours } from "../../api/labour";
import "./labour.css";
export default function LabourList() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    dailyWage: 0,
  });

  const { data: labours = [], isLoading } = useQuery({
    queryKey: ["labours"],
    queryFn: getLabours,
  });

  const mutation = useMutation({
    mutationFn: createLabour,
    onSuccess: () => {
      setForm({ name: "", category: "", dailyWage: 0 });
    },
  });

  return (
    <div className="page-card">
      <h3>Create Labour</h3>

      <div className="form-row">
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
          onChange={(e) => setForm({ ...form, dailyWage: +e.target.value })}
        />
        <button className="primary-btn" onClick={() => mutation.mutate(form)}>
          Create Labour
        </button>
      </div>

      {/* 🔽 LABOUR LIST */}
      <div className="table">
        <div className="table-header">
          <span>Name</span>
          <span>Category</span>
          <span>Daily Wage</span>
        </div>

        {isLoading && (
          <div className="table-row">
            <span>Loading…</span>
          </div>
        )}

        {labours.map((labour: any) => (
          <div key={labour.id} className="table-row">
            <span>{labour.name}</span>
            <span>{labour.category}</span>
            <span>₹{labour.dailyWage}</span>
          </div>
        ))}

        {!isLoading && labours.length === 0 && (
          <div className="table-row">
            <span>No labours created yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
