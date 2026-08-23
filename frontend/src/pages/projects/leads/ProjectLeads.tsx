import { DndContext, closestCorners } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LeadColumn from "../../leads/LeadColumn";
import "../../leads/lead.css";
import {
  getKanbanLeads,
  getLeadSourceSummary,
  updateLeadStatus,
} from "../../../api/lead";
import AddLeadModal from "../../leads/AddLeadModal";
import LeadEditModal from "../../leads/LeadEditModal";
import {
  LEAD_SOURCES,
  leadSourceLabel,
} from "../../../constants/leadSources";

const statuses = [
  "NEW",
  "FOLLOW_UP",
  "VISIT_SCHEDULED",
  "NEGOTIATION",
  "CONVERTED",
  "LOST",
];

export default function ProjectLeads() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [summary, setSummary] = useState<any>(null);

  const load = async () => {
    try {
      const filters: any = { projectId };
      if (sourceFilter) filters.source = sourceFilter;
      const [res, srcSummary] = await Promise.all([
        getKanbanLeads(filters),
        getLeadSourceSummary(projectId),
      ]);
      setData(res);
      setSummary(srcSummary);
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [projectId, sourceFilter]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const leadId = active.id;
    const newStatus = over.id;

    const updated = { ...data };
    let movedLead: any;

    for (const key of statuses) {
      updated[key] = updated[key]?.filter((l: any) => {
        if (l.id === leadId) {
          movedLead = l;
          return false;
        }
        return true;
      });
    }

    if (movedLead) {
      movedLead.status = newStatus;
      updated[newStatus] = [movedLead, ...(updated[newStatus] || [])];
    }

    setData(updated);

    try {
      await updateLeadStatus(leadId, newStatus);
    } catch (err) {
      console.error("Status update failed", err);
      load();
    }
  };

  if (loading && !Object.keys(data).length) {
    return <div style={{ padding: 20 }}>{t("leads.loading")}</div>;
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="lead-header">
        <h2>{t("leads.projectLeads")}</h2>
        <div className="lead-header-actions">
          <select
            className="source-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="">{t("leads.allSources")}</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button className="primary" onClick={() => setModalOpen(true)}>
            {t("leads.addLead")}
          </button>
        </div>
      </div>

      {summary?.sources?.length > 0 && (
        <div className="source-summary">
          {summary.sources.map((row: any) => (
            <button
              key={row.source}
              type="button"
              className={`source-summary-chip ${
                sourceFilter === row.source ? "active" : ""
              }`}
              onClick={() =>
                setSourceFilter(sourceFilter === row.source ? "" : row.source)
              }
              title={t("leads.convertedSummary", {
                converted: row.converted,
                rate: row.conversionRate,
              })}
            >
              <span>{leadSourceLabel(row.source)}</span>
              <strong>{row.total}</strong>
            </button>
          ))}
          <span className="source-summary-total">
            {t("leads.totalCount", { count: summary.total })}
          </span>
        </div>
      )}

      <div className="kanban-scroll">
        <div className="kanban-container">
          {statuses.map((status) => (
            <LeadColumn
              key={status}
              status={status}
              leads={data[status] || []}
              onLeadClick={(lead: any) => setSelectedLead(lead)}
            />
          ))}
        </div>
      </div>
      <AddLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={load}
        defaultProjectId={projectId}
      />
      <LeadEditModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onSaved={load}
      />
    </DndContext>
  );
}
