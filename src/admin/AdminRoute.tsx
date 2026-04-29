import React from "react";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../constants/auth";
import { useAuth } from "../context/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!isAdmin(user)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default AdminRoute;
