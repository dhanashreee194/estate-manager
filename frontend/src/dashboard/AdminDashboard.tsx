import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./dashboard.css";
import HeaderActionButton from "../components/HeaderActionButton";
import InviteUserModal from "../components/InviteUserModal";
import CreateProjectModal from "../components/CreateProjectModal";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeSwitcher from "../components/ThemeSwitcher";
import {
  canAccess,
  getCurrentRole,
  getStoredUser,
  NAV_ITEMS,
} from "../auth/roles";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const location = useLocation();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = getCurrentRole();
  const user = getStoredUser();

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

  const navLabel = (key: string) => {
    if (key === "advancedReports") return `📊 ${t("nav.advancedReports")}`;
    return t(`nav.${key}`);
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

        {role && (
          <div className="role-badge" title={user?.name || ""}>
            {t(`roles.${role}`)}
          </div>
        )}

        <nav className="nav">
          {NAV_ITEMS.filter((item) => canAccess(item.key, role)).map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {navLabel(item.key)}
            </NavLink>
          ))}
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
            <h1>
              {t("nav.welcome")}
              {user?.name ? `, ${user.name}` : ""} 👋
            </h1>
          </div>

          <div className="header-actions">
            <ThemeSwitcher compact />
            <LanguageSwitcher compact />
            {canAccess("inviteUser", role) && (
              <HeaderActionButton
                variant="outline"
                onClick={() => setInviteOpen(true)}
              >
                {t("nav.inviteUser")}
              </HeaderActionButton>
            )}

            {canAccess("createProject", role) && (
              <HeaderActionButton
                variant="primary"
                onClick={() => setCreateProjectOpen(true)}
              >
                + {t("nav.createProject")}
              </HeaderActionButton>
            )}
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
