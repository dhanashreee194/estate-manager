import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  deleteAttendance,
  getAssignedLabours,
  getProjectAttendance,
  markAttendance,
} from "../../api/labour";
import { useEffect, useState } from "react";
import "./labour.css";

export default function LabourAttendance() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const [labourId, setLabourId] = useState("");
  const [present, setPresent] = useState(true);
  const [wage, setWage] = useState(0);
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({
        queryKey: ["attendance", projectId],
      });

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
      <h3>{t("labour.markAttendance")}</h3>

      <div className="form-row">
        <select
          className="form-control"
          value={labourId}
          onChange={(e) => setLabourId(e.target.value)}
        >
          <option value="">{t("labour.selectLabour")}</option>
          {assigned.map((a: any) => (
            <option key={a.labour.id} value={a.labour.id}>
              {a.labour.name} ({a.labour.category})
            </option>
          ))}
        </select>

        <input
          type="number"
          className="form-control"
          placeholder={t("labour.wage")}
          value={wage}
          onChange={(e) => setWage(+e.target.value)}
        />

        <div className="checkbox-field">
          <input
            type="checkbox"
            checked={present}
            onChange={(e) => setPresent(e.target.checked)}
          />
          <span>{t("labour.present")}</span>
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
          {mutation.isPending ? t("common.saving") : t("common.confirm")}
        </button>
      </div>

      <div className="table">
        <div className="table-header1">
          <span>{t("common.name")}</span>
          <span>{t("common.status")}</span>
          <span>{t("labour.wage")}</span>
          <span>{t("common.date")}</span>
          <span className="actions-col">{t("common.actions")}</span>
        </div>

        {data.map((row: any) => (
          <div key={row.id} className="table-row1">
            <span>{row.labour.name}</span>

            <span className={row.present ? "positive" : "negative"}>
              {row.present ? t("labour.present") : "Absent"}
            </span>

            <span>₹{row.wageForDay}</span>

            <span>{new Date(row.date).toLocaleDateString()}</span>

            <span className="actions-col">
              <button
                className="icon-btn delete"
                title={t("labour.deleteAttendance")}
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
