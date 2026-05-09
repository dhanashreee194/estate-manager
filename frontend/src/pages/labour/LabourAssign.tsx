import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignLabour,
  getAssignedLabours,
  getLabours,
  removeAssignedLabour,
} from "../../api/labour";
import { useState } from "react";
import "./labour.css";

export default function LabourAssign() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [labourId, setLabourId] = useState("");

  // 🔹 All labours
  const { data: labours = [] } = useQuery({
    queryKey: ["labours"],
    queryFn: getLabours,
  });

  // 🔹 Assigned labours
  const { data: assigned = [] } = useQuery({
    queryKey: ["assigned-labours", projectId],
    queryFn: () => getAssignedLabours(projectId!),
    enabled: !!projectId,
  });

  const assignMutation = useMutation({
    mutationFn: assignLabour,
    onSuccess: () => {
      setLabourId("");
      queryClient.invalidateQueries({
        queryKey: ["assigned-labours", projectId],
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeAssignedLabour,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assigned-labours", projectId],
      });
    },
  });

  return (
    <div className="page-card">
      <h3>Assign Labour to Project</h3>

      {/* 🔹 Beautified Assign Section */}
      <div className="form-row align-center">
        <select
          className="select-box"
          value={labourId}
          onChange={(e) => setLabourId(e.target.value)}
        >
          <option value="">Select labour</option>
          {labours.map((l: any) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.category}) – ₹{l.dailyWage}
            </option>
          ))}
        </select>

        <button
          className="primary-btn"
          disabled={!labourId || assignMutation.isPending}
          onClick={() =>
            assignMutation.mutate({
              labourId,
              projectId: projectId!,
            })
          }
        >
          {assignMutation.isPending ? "Assigning..." : "Assign"}
        </button>
      </div>

      {/* 🔽 ASSIGNED LABOURS TABLE */}
      <div className="table">
        <div className="table-header">
          <span>Name</span>
          <span>Category</span>
          <span>Daily Wage</span>
          <span>Action</span>
        </div>

        {assigned.map((a: any) => (
          <div key={a.id} className="table-row">
            <span>{a.labour.name}</span>
            <span>{a.labour.category}</span>
            <span>₹{a.labour.dailyWage}</span>
            <span>
              <button
                className="danger-btn"
                onClick={() => removeMutation.mutate(a.id)}
              >
                Remove
              </button>
            </span>
          </div>
        ))}

        {assigned.length === 0 && (
          <div className="table-row">
            <span>No labours assigned yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
