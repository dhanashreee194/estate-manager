import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  assignLabour,
  getAssignedLabours,
  getLabours,
  removeAssignedLabour,
} from "../../api/labour";
import { useState } from "react";
import "./labour.css";

export default function LabourAssign() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [labourId, setLabourId] = useState("");

  const { data: labours = [] } = useQuery({
    queryKey: ["labours"],
    queryFn: getLabours,
  });

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
      <h3>{t("labour.assignToProject")}</h3>

      <div className="form-row align-center">
        <select
          className="select-box"
          value={labourId}
          onChange={(e) => setLabourId(e.target.value)}
        >
          <option value="">{t("labour.selectLabour")}</option>
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
          {assignMutation.isPending ? t("common.saving") : t("labour.assign")}
        </button>
      </div>

      <div className="table">
        <div className="table-header">
          <span>{t("common.name")}</span>
          <span>{t("labour.category")}</span>
          <span>{t("labour.dailyWage")}</span>
          <span>{t("common.actions")}</span>
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
                {t("common.remove")}
              </button>
            </span>
          </div>
        ))}

        {assigned.length === 0 && (
          <div className="table-row">
            <span>{t("labour.noAssigned")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
