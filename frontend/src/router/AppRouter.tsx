import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../auth/Login";
import Signup from "../auth/Signup";
import AdminDashboard from "../dashboard/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import ProjectInventory from "../pages/inventory/ProjectInventory";
import ProjectDashboard from "../pages/projects/ProjectDashboard";
import ProjectsList from "../pages/projects/ProjectsList";
import DashboardOverview from "../dashboard/DashboardOverview";
import ProjectInventoryInward from "../pages/inventory/ProjectInventoryInward";
import ProjectInventoryStock from "../pages/inventory/ProjectInventoryStock";
import ProjectInventoryOutward from "../pages/inventory/ProjectInventoryOutward";
import ProjectInventoryRequirements from "../pages/inventory/ProjectInventoryRequirements";
import CompanyInventory from "../pages/inventory/CompanyInventory";
import LabourPage from "../pages/labour/ProjectLabour";
import ProjectOverview from "../pages/projects/Overview/ProjectOverview";
import ProjectUnits from "../pages/projects/units/ProjectUnits";
import BookingsPage from "../pages/bookings/BookingsPage";
import ReportsPage from "../pages/projects/reports/ReportsPage";
import ExpensesPage from "../pages/projects/expenses/ExpensesPage";
import LeadKanban from "../pages/leads/LeadKanban";
import UsersPage from "../pages/users/UsersPage";
import CompanyReportsPage from "../pages/reports/CompanyReportsPage";
import ProjectLeads from "../pages/projects/leads/ProjectLeads";
import ComprehensiveReports from "../pages/reports/ComprehensiveReports";
import VendorsPage from "../pages/vendors/VendorsPage";
import ProjectLayoutMap from "../pages/projects/layout/ProjectLayoutMap";
import BrokersPage from "../pages/brokers/BrokersPage";
import FinancePage from "../pages/finance/FinancePage";
import LandPage from "../pages/land/LandPage";
import CollectionsPage from "../pages/collections/CollectionsPage";
import RemindersPage from "../pages/reminders/RemindersPage";
import MarketingPage from "../pages/marketing/MarketingPage";
import CampaignLandingPage from "../pages/marketing/CampaignLandingPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/c/:code" element={<CampaignLandingPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="/dashboard/inventory" element={<CompanyInventory />} />
        <Route path="/dashboard/vendors" element={<VendorsPage />} />
        <Route path="/dashboard/brokers" element={<BrokersPage />} />
        <Route path="/dashboard/finance" element={<FinancePage />} />
        <Route path="/dashboard/land" element={<LandPage />} />
        <Route path="/dashboard/collections" element={<CollectionsPage />} />
        <Route path="/dashboard/reminders" element={<RemindersPage />} />
        <Route path="/dashboard/marketing" element={<MarketingPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="/dashboard/leads" element={<LeadKanban />} />
        <Route path="/dashboard/users" element={<UsersPage />} />
        <Route path="/dashboard/reports" element={<CompanyReportsPage />} />
        <Route
          path="/dashboard/comprehensive-reports"
          element={<ComprehensiveReports />}
        />
        {/* Dashboard modules */}
        <Route path="projects" element={<ProjectsList />} />

        <Route path="projects/:projectId" element={<ProjectDashboard />}>
          <Route path="overview" element={<ProjectOverview />} />
          <Route path="units" element={<ProjectUnits />} />
          <Route path="layout" element={<ProjectLayoutMap />} />
          <Route path="inventory" element={<ProjectInventory />}>
            <Route path="stock" element={<ProjectInventoryStock />} />
            <Route path="inward" element={<ProjectInventoryInward />} />
            <Route path="outward" element={<ProjectInventoryOutward />} />
            <Route
              path="requirements"
              element={<ProjectInventoryRequirements />}
            />
          </Route>
          <Route
            path="/dashboard/projects/:projectId/labour"
            element={<LabourPage />}
          />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="leads" element={<ProjectLeads />} />
        </Route>
      </Route>
    </Routes>
  );
}
