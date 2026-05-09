import { useEffect, useState } from "react";

import {
  createReport,
  addLabour,
  addMaterial,
  updateReport,
} from "../../../api/report";
import "../projects.css";

export default function DailyReportModal({
  projectId,
  report,
  onClose,
  onSaved,
}: any) {
  const [date, setDate] = useState("");
  const [work, setWork] = useState("");
  const [loading, setLoading] = useState(false);
  const [labour, setLabour] = useState({
    agency: "",
    skilled: 0,
    men: 0,
    women: 0,
  });

  useEffect(() => {
    if (!report) {
      setDate("");
      setWork("");

      setLabour({
        agency: "",
        skilled: 0,
        men: 0,
        women: 0,
      });

      setMaterial({
        name: "",
        size: "",
        stock: 0,
        consumed: 0,
      });

      return;
    }

    setDate(report.date.split("T")[0]);
    setWork(report.workDetails);

    if (report?.labours?.length > 0) {
      const l = report.labours[0];

      setLabour({
        agency: l.agency || "",
        skilled: l.skilled || 0,
        men: l.men || 0,
        women: l.women || 0,
      });
    }

    if (report?.materials?.length > 0) {
      const m = report.materials[0];

      setMaterial({
        name: m.name || "",
        size: m.size || "",
        stock: m.stock || 0,
        consumed: m.consumed || 0,
      });
    }
  }, [report]);
  const [material, setMaterial] = useState({
    name: "",
    size: "",
    stock: 0,
    consumed: 0,
  });

  const labourTotal =
    Number(labour.skilled) + Number(labour.men) + Number(labour.women);

  const materialBalance = Math.max(
    0,
    Number(material.stock) - Number(material.consumed),
  );

  const submit = async () => {
    if (!date || !work) {
      alert("Fill required fields");
      return;
    }

    try {
      setLoading(true);

      let reportId = report?.id;

      // ======================
      // CREATE / UPDATE REPORT
      // ======================
      if (report) {
        const updateRes = await updateReport(report.id, {
          date,
          workDetails: work,
        });

        console.log("✅ UPDATE RESPONSE:", updateRes);
      } else {
        const createRes = await createReport({
          projectId,
          date,
          workDetails: work,
        });

        console.log("✅ CREATE RESPONSE:", createRes);

        reportId = createRes.id; // ⭐ IMPORTANT
      }

      if (!reportId) {
        throw new Error("Report ID not found");
      }

      // ======================
      // SAVE LABOUR
      // ======================
      if (labour.agency || labour.skilled || labour.men || labour.women) {
        const labourRes = await addLabour(reportId, labour);

        console.log("👷 LABOUR SAVED:", labourRes);
      }

      // ======================
      // SAVE MATERIAL
      // ======================
      if (
        material.name ||
        material.size ||
        material.stock ||
        material.consumed
      ) {
        const materialRes = await addMaterial(reportId, material);

        console.log("🧱 MATERIAL SAVED:", materialRes);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("❌ SAVE ERROR:", err);
      alert("Failed to save report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <h3>📝 New Daily Report</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Date */}
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Work */}
        <div className="form-group">
          <label>Work Details</label>
          <textarea
            className="dark-input"
            value={work}
            onChange={(e) => setWork(e.target.value)}
          />
        </div>

        {/* Labour */}
        <h4>👷 Labour Details</h4>

        <div className="report-grid-labels">
          <span>Agency</span>
          <span>Skilled</span>
          <span>Men</span>
          <span>Women</span>
          <span>Total</span>
        </div>

        <div className="report-grid">
          <input
            value={labour.agency}
            onChange={(e) => setLabour({ ...labour, agency: e.target.value })}
          />

          <input
            type="number"
            value={labour.skilled}
            onChange={(e) => setLabour({ ...labour, skilled: +e.target.value })}
          />

          <input
            type="number"
            value={labour.men}
            onChange={(e) => setLabour({ ...labour, men: +e.target.value })}
          />

          <input
            type="number"
            value={labour.women}
            onChange={(e) => setLabour({ ...labour, women: +e.target.value })}
          />

          <input value={labourTotal} disabled />
        </div>

        {/* Material */}
        <h4>🧱 Material Details</h4>

        <div className="report-grid-labels">
          <span>Material</span>
          <span>Size</span>
          <span>Stock</span>
          <span>Used</span>
          <span>Balance</span>
        </div>

        <div className="report-grid">
          <input
            value={material.name}
            onChange={(e) => setMaterial({ ...material, name: e.target.value })}
          />

          <input
            value={material.size}
            onChange={(e) => setMaterial({ ...material, size: e.target.value })}
          />

          <input
            type="number"
            value={material.stock}
            onChange={(e) =>
              setMaterial({ ...material, stock: +e.target.value })
            }
          />

          <input
            type="number"
            value={material.consumed}
            onChange={(e) =>
              setMaterial({ ...material, consumed: +e.target.value })
            }
          />

          <input value={materialBalance} disabled />
        </div>

        {/* Buttons */}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button disabled={loading} className="primary-btn" onClick={submit}>
            {loading ? "Saving..." : "Save Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
