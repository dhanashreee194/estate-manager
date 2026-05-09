import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { assignLabour } from "../../api/labour";
import { useState } from "react";
import "./labour.css";
export default function LabourAssignment() {
  const { projectId } = useParams();
  const [labourId, setLabourId] = useState("");

  const mutation = useMutation({
    mutationFn: assignLabour,
    onSuccess: () => {
      setLabourId("");
      alert("Labour assigned");
    },
  });

  return (
    <div className="card">
      <h3>Assign Labour</h3>

      <select value={labourId} onChange={(e) => setLabourId(e.target.value)}>
        <option value="">Select labour</option>
        {/* populate from labour list */}
      </select>

      <button
        onClick={() =>
          mutation.mutate({
            labourId,
            projectId: projectId!,
          })
        }
      >
        Assign
      </button>
    </div>
  );
}
