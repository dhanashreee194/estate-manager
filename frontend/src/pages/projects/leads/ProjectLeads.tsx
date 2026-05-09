import { DndContext, closestCorners } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LeadColumn from "../../leads/LeadColumn";
import "../../leads/lead.css";
import { getKanbanLeads, updateLeadStatus } from "../../../api/lead";
import AddLeadModal from "../../leads/AddLeadModal";
import LeadDetailsModal from "../../leads/LeadDetailsModal";
import LeadEditModal from "../../leads/LeadEditModal";

const statuses = [
  "NEW",
  "FOLLOW_UP",
  "VISIT_SCHEDULED",
  "NEGOTIATION",
  "CONVERTED",
  "LOST",
];

export default function ProjectLeads() {
  const { projectId } = useParams();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const load = async () => {
    try {
      const res = await getKanbanLeads();
      // Filter leads by projectId
      const filteredData: any = {};
      for (const status of statuses) {
        filteredData[status] = res[status]?.filter((lead: any) => lead.projectId === projectId) || [];
      }
      setData(filteredData);
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const leadId = active.id;
    const newStatus = over.id;

    // optimistic update
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
      load(); // reload if backend fails
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading leads...</div>;
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="lead-header">
        <h2>Project Leads</h2>
        <button className="primary" onClick={() => setModalOpen(true)}>
          + Add Lead
        </button>
      </div>
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
