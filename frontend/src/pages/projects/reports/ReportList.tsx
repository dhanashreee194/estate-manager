import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getReports } from "../../../api/report";
import "../projects.css";
export default function ReportList() {
  const { projectId } = useParams();

  const [reports, setReports] = useState([]);

  useEffect(() => {
    load();
  }, [projectId]);

  const load = async () => {
    const data = await getReports(projectId!);
    setReports(data);
  };

  return (
    <div className="card">
      <h4>📊 Reports</h4>

      {reports.map((r: any) => (
        <div key={r.id} className="report-item">
          <b>{new Date(r.date).toDateString()}</b>

          <p>{r.workDetails}</p>

          <small>
            Labour: {r.labours.length} | Material: {r.materials.length}
          </small>
        </div>
      ))}
    </div>
  );
}
