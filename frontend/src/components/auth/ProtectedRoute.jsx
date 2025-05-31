import React from "react";
import { useAuth } from "./AuthProvider";
import { Outlet, Navigate } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const { currentUser } = useAuth();

  // Show loading while user info is being fetched
  if (currentUser === undefined) {
    return <div>Loading...</div>;
  }

  // Not logged in -> redirect to login page
  if (currentUser === null) {
    return <Navigate to="/login" replace />;
  }

  // Normalize allowedRoles to array for flexible usage
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // If user's role not allowed -> redirect to unauthorized page
  if (allowedRoles && !roles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all good, render the nested routes/components
  return <Outlet />;
}

export default ProtectedRoute;
