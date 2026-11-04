import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext"; // 🧠 Pull active user hooks out of our root layer
import { LayoutShell } from "./components/LayoutShell";
import { RegisterGateway } from "./features/register/RegisterGateway";
import { BranchManagementGateway } from "./features/branch/BranchManagementGateway";
import { QueueDashboard } from "./features/queue/QueueDashboard";
import { CustomerGateway } from "./features/customer-portal/CustomerGateway";

// 🔒 ROUTE SECURITY SHIELD (RBAC ACCESS ENFORCER)
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireBranches?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireBranches = false,
}) => {
  const { user, branches } = useApp();

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  if (requireBranches && user.role === "owner" && branches.length === 0) {
    return <Navigate to="/branches" replace />;
  }

  return <>{children}</>;
};

// 📡 CORE PLATFORM NAVIGATION ROUTER MATRIX
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ACCESS ENTRY CHANNELS */}
        <Route path="/register" element={<RegisterGateway />} />
        <Route path="/customer/join" element={<CustomerGateway />} />

        {/* SECURE CONTROL INTERFACE HOUSING ROOMS */}
        <Route
          path="/branches"
          element={
            <ProtectedRoute>
              <LayoutShell>
                <BranchManagementGateway />
              </LayoutShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireBranches={true}>
              <LayoutShell>
                <QueueDashboard />
              </LayoutShell>
            </ProtectedRoute>
          }
        />

        {/* INTELLIGENT ROOT DIRECT SYSTEM FALLBACK STRAP */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
