import { useState } from "react";
import { useTranslation } from "react-i18next";

import LabourAttendance from "./LabourAttendance";
import LabourList from "./LabourList";
import LabourAssign from "./LabourAssign";

type LabourTab = "labours" | "assign" | "attendance";

export default function ProjectLabour() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<LabourTab>("labours");

  return (
    <div>
      <div className="labour-tabs">
        <button
          className={activeTab === "labours" ? "active" : ""}
          onClick={() => setActiveTab("labours")}
        >
          {t("labour.labours")}
        </button>

        <button
          className={activeTab === "assign" ? "active" : ""}
          onClick={() => setActiveTab("assign")}
        >
          {t("labour.assign")}
        </button>

        <button
          className={activeTab === "attendance" ? "active" : ""}
          onClick={() => setActiveTab("attendance")}
        >
          {t("labour.attendance")}
        </button>
      </div>

      <div className="labour-body">
        {activeTab === "labours" && <LabourList />}
        {activeTab === "assign" && <LabourAssign />}
        {activeTab === "attendance" && <LabourAttendance />}
      </div>
    </div>
  );
}
