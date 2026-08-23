import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { canAccess, featureForPath, getCurrentRole } from "../auth/roles";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = getCurrentRole();
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  const feature = featureForPath(location.pathname);
  if (feature && !canAccess(feature, role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
