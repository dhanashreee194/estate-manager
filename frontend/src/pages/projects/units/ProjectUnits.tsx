import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import PlotList from "./PlotList";
import BuildingList from "./BuildingList";
import UnitCreateModal from "./UnitCreateModal";

import { getProjectUnits } from "../../../api/unit";
import { getProjectBuildings } from "../../../api/building";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentProjectId } from "../../../store/projectSlice";

import "./units.css";

export default function ProjectUnits() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const dispatch = useAppDispatch();
  const [openType, setOpenType] = useState<
    null | "PLOT" | "BUILDING" | "WING" | "FLAT"
  >(null);

  const [selectedWingId, setSelectedWingId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      dispatch(setCurrentProjectId(projectId));
    }
  }, [projectId, dispatch]);

  const { data: units = [] } = useQuery({
    queryKey: ["units", projectId],
    queryFn: () => getProjectUnits(projectId!),
    enabled: !!projectId,
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ["buildings", projectId],
    queryFn: () => getProjectBuildings(projectId!),
    enabled: !!projectId,
  });

  return (
    <div className="units-page">
      <div className="units-header">
        <h3>Project Units</h3>

        <div className="units-actions">
          {projectId && (
            <Link
              className="secondary-btn"
              to={`/dashboard/marketing?projectId=${projectId}`}
            >
              {t("marketing.promoteProject")}
            </Link>
          )}
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
