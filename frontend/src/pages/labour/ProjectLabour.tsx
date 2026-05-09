import { useState } from "react";

import LabourAttendance from "./LabourAttendance";
import LabourList from "./LabourList";
import LabourAssign from "./LabourAssign";

type LabourTab = "labours" | "assign" | "attendance";

export default function ProjectLabour() {
  const [activeTab, setActiveTab] = useState<LabourTab>("labours");

  return (
    <div>
      {/* Tabs */}
      <div className="labour-tabs">
        <button
          className={activeTab === "labours" ? "active" : ""}
          onClick={() => setActiveTab("labours")}
        >
          Labours
        </button>

        <button
          className={activeTab === "assign" ? "active" : ""}
          onClick={() => setActiveTab("assign")}
        >
          Assign
        </button>

        <button
          className={activeTab === "attendance" ? "active" : ""}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>
      </div>

      {/* Body */}
      <div className="labour-body">
        {activeTab === "labours" && <LabourList />}
        {activeTab === "assign" && <LabourAssign />}
        {activeTab === "attendance" && <LabourAttendance />}
      </div>
    </div>
  );
}
