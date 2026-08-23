import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./dashboard.css";
import HeaderActionButton from "../components/HeaderActionButton";
import InviteUserModal from "../components/InviteUserModal";
import CreateProjectModal from "../components/CreateProjectModal";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeSwitcher from "../components/ThemeSwitcher";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const location = useLocation();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 960) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  const logout = () => {
    const theme = localStorage.getItem("estate-manager-theme");
    const lang = localStorage.getItem("estate-manager-lang");
    localStorage.clear();
    if (theme) localStorage.setItem("estate-manager-theme", theme);
    if (lang) localStorage.setItem("estate-manager-lang", lang);
    window.location.href = "/login";
  };

  return (
    <div className={`dashboard-layout ${sidebarOpen ? "nav-open" : ""}`}>
      <div
        className="sidebar-backdrop"
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <h2 className="logo">🏗️ {t("nav.brand")}</h2>
          <button
            type="button"
            className="sidebar-close"
            aria-label={t("common.closeMenu")}
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className="nav">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.dashboard")}
          </NavLink>

          <NavLink
            to="/dashboard/projects"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.projects")}
          </NavLink>

          <NavLink
            to="/dashboard/inventory"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.inventory")}
          </NavLink>

          <NavLink
            to="/dashboard/vendors"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.vendors")}
          </NavLink>

          <NavLink
            to="/dashboard/brokers"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.brokers")}
          </NavLink>

          <NavLink
            to="/dashboard/finance"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.finance")}
          </NavLink>

          <NavLink
            to="/dashboard/land"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.land")}
          </NavLink>

          <NavLink
            to="/dashboard/collections"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.collections")}
          </NavLink>

          <NavLink
            to="/dashboard/reminders"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.reminders")}
          </NavLink>

          <NavLink
            to="/dashboard/bookings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.bookings")}
          </NavLink>

          <NavLink
            to="/dashboard/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.users")}
          </NavLink>
          <NavLink
            to="/dashboard/leads"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.leads")}
          </NavLink>

          <NavLink
            to="/dashboard/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {t("nav.reports")}
          </NavLink>

          <NavLink
            to="/dashboard/comprehensive-reports"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            📊 {t("nav.advancedReports")}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <button className="logout-btn" onClick={logout}>
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <button
              type="button"
              className="menu-toggle"
              aria-label={t("common.openMenu")}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
            <h1>{t("nav.welcome")} 👋</h1>
          </div>

          <div className="header-actions">
            <ThemeSwitcher compact />
            <LanguageSwitcher compact />
            <HeaderActionButton
              variant="outline"
              onClick={() => setInviteOpen(true)}
            >
              {t("nav.inviteUser")}
            </HeaderActionButton>

            <HeaderActionButton
              variant="primary"
              onClick={() => setCreateProjectOpen(true)}
            >
              + {t("nav.createProject")}
            </HeaderActionButton>
          </div>
        </div>

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
            console.log("Project created");
          }}
        />
      </main>
    </div>
  );
}
