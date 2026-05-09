import { useState } from "react";
import BuildingList from "./BuildingList";
import PlotList from "./PlotList";
import { useAppSelector } from "../../../store/hooks";

export default function UnitsOverview() {
  const projectId = useAppSelector((state) => state.project.currentProjectId);
  const [openWingId, setOpenWingId] = useState<string | null>(null);

  // TEMP: Replace later with API data
  const buildings: any[] = [];
  const units: any[] = [];

  return (
    <div className="units-section">
      <div className="section-header">
        <h3>Project Units</h3>
        <button className="primary-btn">+ Add Building / Plot</button>
      </div>

      <PlotList units={units} />

      <BuildingList
        buildings={buildings}
        units={units}
        onAddFlat={(wingId) => setOpenWingId(wingId)}
      />

      {/* Flat Modal */}
      {openWingId && (
        <UnitCreateModal
          type="FLAT"
          parentUnitId={openWingId}
          onClose={() => setOpenWingId(null)}
        />
      )}
    </div>
  );
}
