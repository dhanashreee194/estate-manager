import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import PlotList from "./PlotList";
import BuildingList from "./BuildingList";
import UnitCreateModal from "./UnitCreateModal";

import { getProjectUnits } from "../../../api/unit";
import { getProjectBuildings } from "../../../api/building";
import { getWingsByProject } from "../../../api/wing";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentProjectId } from "../../../store/projectSlice";

import "./units.css";

export default function ProjectUnits() {
  const { projectId } = useParams();
  const dispatch = useAppDispatch();
  const [openType, setOpenType] = useState<
    null | "PLOT" | "BUILDING" | "WING" | "FLAT"
  >(null);

  const [selectedWingId, setSelectedWingId] = useState<string | null>(null);

  // Set current project ID in Redux
  useEffect(() => {
    if (projectId) {
      dispatch(setCurrentProjectId(projectId));
    }
  }, [projectId, dispatch]);

  /** Units = plots + flats + row houses */
  const { data: units = [] } = useQuery({
    queryKey: ["units", projectId],
    queryFn: () => getProjectUnits(projectId!),
    enabled: !!projectId,
  });

  /** Buildings */
  const { data: buildings = [] } = useQuery({
    queryKey: ["buildings", projectId],
    queryFn: () => getProjectBuildings(projectId!),
    enabled: !!projectId,
  });

  /** Wings */
  // TODO: Backend needs to implement GET /wing/project/{projectId} endpoint
  // const { data: wings = [] } = useQuery({
  //   queryKey: ["wings", projectId],
  //   queryFn: () => getWingsByProject(projectId!),
  //   enabled: !!projectId,
  // });
  const wings = []; // Using empty array until backend implements the endpoint

  console.log("Wings:", wings, buildings, units);
  return (
    <div className="units-page">
      <div className="units-header">
        <h3>Project Units</h3>

        <div className="units-actions">
          <button className="secondary-btn" onClick={() => setOpenType("PLOT")}>
            + Plot
          </button>
          <button
            className="secondary-btn"
            onClick={() => setOpenType("BUILDING")}
          >
            + Building
          </button>
          <button className="primary-btn" onClick={() => setOpenType("WING")}>
            + Wing
          </button>
        </div>
      </div>
      <PlotList units={units} />
      <BuildingList
        buildings={buildings}
        units={units}
        onAddFlat={(wingId) => {
          setSelectedWingId(wingId);
          setOpenType("FLAT");
        }}
      />
      {openType && (
        <UnitCreateModal
          type={openType}
          parentUnitId={openType === "FLAT" ? selectedWingId! : undefined}
          onClose={() => {
            setOpenType(null);
            setSelectedWingId(null);
          }}
        />
      )}
    </div>
  );
}
