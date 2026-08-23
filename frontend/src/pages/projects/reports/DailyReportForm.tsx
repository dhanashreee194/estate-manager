import { useState } from "react";
import { useParams } from "react-router-dom";

import { createReport, addLabour, addMaterial } from "../../../api/report";
import "../projects.css";
export default function DailyReportForm() {
  const { projectId } = useParams();

  const [date, setDate] = useState("");
  const [work, setWork] = useState("");

  const [labour, setLabour] = useState({
    agency: "",
    skilled: 0,
    men: 0,
    women: 0,
  });

  const [material, setMaterial] = useState({
    material: "",
    size: "",
    stock: 0,
    consumed: 0,
    balance: 0,
  });

  const submit = async () => {
    if (!date || !work) return alert("Fill required");

    // 1️⃣ Create Report
    const report = await createReport({
      projectId,
      date,
      workDetails: work,
    });

    const reportId = report.id;

    // 2️⃣ Save Labour
    await addLabour(reportId, {
      ...labour,
      total: labour.skilled + labour.men + labour.women,
    });

    // 3️⃣ Save Material
    await addMaterial(reportId, {
      ...material,
    });

    alert("Daily Report Saved ✅");

    reset();
  };

  const reset = () => {
    setDate("");
    setWork("");
    setLabour({
      agency: "",
      skilled: 0,
      men: 0,
      women: 0,
    });
    setMaterial({
      material: "",
      size: "",
      stock: 0,
      consumed: 0,
      balance: 0,
    });
  };

  return (
    <div className="card">
      <h4>📝 Daily Report</h4>

      {/* Date */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Work */}
      <textarea
        placeholder="Work details"
        value={work}
        onChange={(e) => setWork(e.target.value)}
      />

      {/* Labour */}

      <h5>👷 Labour</h5>

      <input
        placeholder="Agency"
        value={labour.agency}
        onChange={(e) => setLabour({ ...labour, agency: e.target.value })}
      />

      <input
        type="number"
        placeholder="Skilled"
        value={labour.skilled}
        onChange={(e) => setLabour({ ...labour, skilled: +e.target.value })}
      />

      <input
        type="number"
        placeholder="Men"
        value={labour.men}
        onChange={(e) => setLabour({ ...labour, men: +e.target.value })}
      />

      <input
        type="number"
        placeholder="Women"
        value={labour.women}
        onChange={(e) => setLabour({ ...labour, women: +e.target.value })}
      />

      {/* Material */}

      <h5>🧱 Material</h5>

      <input
        placeholder="Material"
        value={material.material}
        onChange={(e) => setMaterial({ ...material, material: e.target.value })}
      />

      <input
        placeholder="Size"
        value={material.size}
        onChange={(e) => setMaterial({ ...material, size: e.target.value })}
      />

      <input
        type="number"
        placeholder="Stock"
        value={material.stock}
        onChange={(e) => setMaterial({ ...material, stock: +e.target.value })}
      />

      <input
        type="number"
        placeholder="Consumed"
        value={material.consumed}
        onChange={(e) =>
          setMaterial({ ...material, consumed: +e.target.value })
        }
      />

      <input
        type="number"
        placeholder="Balance"
        value={material.balance}
        onChange={(e) => setMaterial({ ...material, balance: +e.target.value })}
      />

      <button onClick={submit}>Save Daily Report</button>
    </div>
  );
}
