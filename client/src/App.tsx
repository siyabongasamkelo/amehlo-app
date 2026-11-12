import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { RegisterGateway } from "./features/auth/RegisterGateway";
import { CreateCompanyGateway } from "./features/company/CreateCompanyGateway";
import { QueueDashboard } from "./features/queue/QueueDashboard";
import { BranchManagementGateway } from "./features/branch/BranchManagementGateway";
// import { CustomerJoinGateway } from "./features/customer/CustomerJoinGateway";
// import { RemoteLookupGateway } from "./features/remoteLookupGateway/RemoteLookupGateway";
import { BranchServicesConfig } from "./features/services/components/BranchServicesConfig";
import { TermsView } from "./features/terms/TermsView";
import { PrivacyPolicyView } from "./features/terms/PrivacyPolicyView";
import { LoginGateway } from "./features/auth/LoginGateway";
import { useCompany } from "./features/company/context/CompanyContext";
import { StudentAuthGateway } from "./features/student/pages/StudentAuthGateway";
import { StudentPortal } from "./features/student/pages/StudentPortal";
import { StudentOnboardingWizard } from "./features/student/pages/StudentOnboardingWizard";
import { useStudent } from "./features/student/context/StudentContext";
import { StudentRemoteJoin } from "./features/student/pages/StudentRemoteJoin";
import { StudentQrCheckIn } from "./features/student/pages/StudentQrCheckIn";

export default function App() {
  const { dbUser, isLoadingProfile } = useApp();
  const { activeCompany } = useCompany();
  const { enrollment, isLoadingEnrollment } = useStudent();

  console.log("Current Database Sync User:", dbUser);

  // Wait for student enrollment check before routing students
  if (isLoadingProfile || (dbUser?.role === "student" && isLoadingEnrollment)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="space-y-3 text-center">
          <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
            Verifying Amehlo Security Profiles...
          </p>
        </div>
      </div>
    );
  }
  // Helper inside App.tsx:

  const getHomeRoute = () => {
    if (!dbUser) return "/register";
    if (dbUser.role === "student") {
      return enrollment ? "/student/portal" : "/student/onboarding";
    }
    if (dbUser.role === "owner") {
      return activeCompany ? "/branches" : "/create-company";
    }
    return "/dashboard";
  };

  {
    /* PROTECTED STUDENT PORTAL */
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/student/join-online" element={<StudentRemoteJoin />} />
        <Route path="/student/qr-checkin" element={<StudentQrCheckIn />} />
        {/* Keep existing wall QR codes working seamlessly */}
        <Route path="/customer/join" element={<StudentQrCheckIn />} />
        <Route
          path="/student/auth"
          element={
            dbUser ? (
              <Navigate to={getHomeRoute()} replace />
            ) : (
              <StudentAuthGateway />
            )
          }
        />
        <Route
          path="/student/portal"
          element={
            dbUser && dbUser.role === "student" ? (
              <StudentPortal />
            ) : (
              <Navigate to="/student/auth" replace />
            )
          }
        />
        {/* 🚗 STUDENT 3-STEP ONBOARDING WIZARD */}
        <Route
          path="/student/onboarding"
          element={
            dbUser && dbUser.role === "student" ? (
              <StudentOnboardingWizard />
            ) : (
              <Navigate to="/student/auth" replace />
            )
          }
        />
        <Route path="/terms" element={<TermsView />} />
        <Route path="/privacy" element={<PrivacyPolicyView />} />
        {/* 📱 PUBLIC CUSTOMER-FACING SCANNING PORTAL */}
        {/* <Route path="/customer/join" element={<CustomerJoinGateway />} /> */}
        {/* 📱 PUBLIC REMOTE SEARCH ENGINE PORTAL */}
        {/* <Route path="/search" element={<RemoteLookupGateway />} /> */}
        <Route
          path="/login"
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
              <LoginGateway />
            )
          }
        />
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
        {/* 🔒 OWNERS-ONLY BRANCH SERVICES CONFIGURATION ROUTE */}
        <Route
          path="/branch/:branchId/services"
          element={
            dbUser && dbUser.role === "owner" ? (
              activeCompany ? (
                <BranchServicesConfig />
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
