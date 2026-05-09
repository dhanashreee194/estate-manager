import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAttendance,
  getAssignedLabours,
  getProjectAttendance,
  markAttendance,
  updateAttendance,
} from "../../api/labour";
import { useEffect, useState } from "react";
import "./labour.css";
export default function LabourAttendance() {
  const { projectId } = useParams();
  const [labourId, setLabourId] = useState("");
  const [present, setPresent] = useState(true);
  const [wage, setWage] = useState(0);
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPresent, setEditPresent] = useState(true);
  const [editWage, setEditWage] = useState(0);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => updateAttendance(id, data),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({
        queryKey: ["attendance", projectId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", projectId],
      });
    },
  });

  const { data = [] } = useQuery({
    queryKey: ["attendance", projectId],
    queryFn: () => getProjectAttendance(projectId!),
    enabled: !!projectId,
  });

  const { data: assigned = [] } = useQuery({
    queryKey: ["assigned-labours", projectId],
    queryFn: () => getAssignedLabours(projectId!),
    enabled: !!projectId,
  });

  const mutation = useMutation({
    mutationFn: markAttendance,
    onSuccess: () => {
      // 🔁 Refetch attendance immediately
      queryClient.invalidateQueries({
        queryKey: ["attendance", projectId],
      });

      // optional UX cleanup
      setLabourId("");
    },
  });
  useEffect(() => {
    const selected = assigned.find((a: any) => a.labour.id === labourId);
    if (selected) {
      setWage(selected.labour.dailyWage);
    }
  }, [labourId, assigned]);
  return (
    <div className="page-card">
      <h3>Mark Attendance</h3>

      <div className="form-row">
        <select
          className="form-control"
          value={labourId}
          onChange={(e) => setLabourId(e.target.value)}
        >
          <option value="">Select labour</option>
          {assigned.map((a: any) => (
            <option key={a.labour.id} value={a.labour.id}>
              {a.labour.name} ({a.labour.category})
            </option>
          ))}
        </select>

        <input
          type="number"
          className="form-control"
          placeholder="Wage"
          value={wage}
          onChange={(e) => setWage(+e.target.value)}
        />

        <div className="checkbox-field">
          <input
            type="checkbox"
            checked={present}
            onChange={(e) => setPresent(e.target.checked)}
          />
          <span>Present</span>
        </div>

        <button
          className="primary-btn"
          onClick={() =>
            mutation.mutate({
              labourId,
              projectId: projectId!,
              date: new Date().toISOString(),
              present,
              wageForDay: wage,
            })
          }
        >
          {mutation.isPending ? "Marking..." : "Mark"}
        </button>
      </div>

      <div className="table">
        <div className="table-header1">
          <span>Name</span>
          <span>Status</span>
          <span>Wage</span>
          <span>Date</span>
          <span className="actions-col">Actions</span>
        </div>

        {data.map((row: any) => (
          <div key={row.id} className="table-row1">
            <span>{row.labour.name}</span>

            <span className={row.present ? "positive" : "negative"}>
              {row.present ? "Present" : "Absent"}
            </span>

            <span>₹{row.wageForDay}</span>

            <span>{new Date(row.date).toLocaleDateString()}</span>

            <span className="actions-col">
              <button
                className="icon-btn edit"
                title="Edit attendance"
                onClick={() => setEditingId(row)}
              >
                ✏️
              </button>

              <button
                className="icon-btn delete"
                title="Delete attendance"
                onClick={() => deleteMutation.mutate(row.id)}
              >
                🗑️
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
