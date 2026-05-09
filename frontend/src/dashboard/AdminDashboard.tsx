import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { getAdminDashboard } from "../api/dashboard";
import "./dashboard.css";
import type { AdminDashboardData } from "./dashboard";
import HeaderActionButton from "../components/HeaderActionButton";
import InviteUserModal from "../components/InviteUserModal";
import { inviteUser } from "../api/user";
import CreateProjectModal from "../components/CreateProjectModal";

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  useEffect(() => {
    console.log("inviteOpen:", inviteOpen);
  }, [inviteOpen]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">🏗️ Estate Manager</h2>

        <nav className="nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/dashboard/projects"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Projects
          </NavLink>

          <NavLink
            to="/dashboard/inventory"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Inventory
          </NavLink>

          <NavLink
            to="/dashboard/bookings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Bookings
          </NavLink>

          <NavLink
            to="/dashboard/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Users
          </NavLink>
          <NavLink
            to="/dashboard/leads"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Leads
          </NavLink>

          <NavLink
            to="/dashboard/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Reports
          </NavLink>

          <NavLink
            to="/dashboard/comprehensive-reports"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            📊 Advanced Reports
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      {/* Main Area */}
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Welcome 👋</h1>

          <div className="header-actions">
            <HeaderActionButton
              variant="outline"
              onClick={() => setInviteOpen(true)}
            >
              Invite User
            </HeaderActionButton>

            <HeaderActionButton
              variant="primary"
              onClick={() => setCreateProjectOpen(true)}
            >
              + Create Project
            </HeaderActionButton>
          </div>
        </div>

        {/* Stats */}

        <div className="dashboard-content">
          <Outlet />
        </div>
        <InviteUserModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
        />

        <CreateProjectModal
          open={createProjectOpen}
          onClose={() => setCreateProjectOpen(false)}
          onSuccess={() => {
            // optional: refresh dashboard or projects list
            console.log("Project created");
          }}
        />
      </main>
    </div>
  );
}
