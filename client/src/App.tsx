import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { RegisterGateway } from "./features/register/RegisterGateway";
import { CreateCompanyGateway } from "./features/company/CreateCompanyGateway";
import { QueueDashboard } from "./features/queue/QueueDashboard";
import { BranchManagementGateway } from "./features/branch/BranchManagementGateway";
import { CustomerJoinGateway } from "./features/customer/CustomerJoinGateway"; // ➔ Import the new mobile page

export default function App() {
  const { dbUser, activeCompany, isLoadingProfile } = useApp();

  console.log("Current Database Sync User:", dbUser);

  // GLOBAL HYDRATION GUARD (Only blocks admin dashboard routes, lets public routes pass if structured)
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="space-y-3 text-center">
          <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
            Verifying Amehlo Terminal Security Profiles...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 📱 PUBLIC CUSTOMER-FACING SCANNING PORTAL (🔒 Left completely open for guest check-ins) */}
        <Route path="/customer/join" element={<CustomerJoinGateway />} />

        {/* Entry Interceptor: Route admin paths based on verification roles */}
        <Route
          path="/register"
          element={
            dbUser ? (
              dbUser.role === "owner" ? (
                activeCompany ? (
                  <Navigate to="/branches" replace />
                ) : (
                  <Navigate to="/create-company" replace />
                )
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <RegisterGateway />
            )
          }
        />

        {/* 🏢 CORPORATE WORKSPACE GATEWAY */}
        <Route
          path="/create-company"
          element={
            dbUser && dbUser.role === "owner" ? (
              activeCompany ? (
                <Navigate to="/branches" replace />
              ) : (
                <CreateCompanyGateway />
              )
            ) : (
              <Navigate to="/register" replace />
            )
          }
        />

        {/* BRANCH PROVISIONING NODES */}
        <Route
          path="/branches"
          element={
            dbUser && dbUser.role === "owner" ? (
              activeCompany ? (
                <BranchManagementGateway />
              ) : (
                <Navigate to="/create-company" replace />
              )
            ) : (
              <Navigate to="/register" replace />
            )
          }
        />

        {/* PLATFORM OPERATIONS COCKPIT TERMINAL */}
        <Route
          path="/dashboard"
          element={
            dbUser ? <QueueDashboard /> : <Navigate to="/register" replace />
          }
        />

        {/* Fallback Catch-All Redirect Engine */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
