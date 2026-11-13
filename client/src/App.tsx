import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import { RegisterGateway } from "./features/auth/RegisterGateway";
import { CreateCompanyGateway } from "./features/company/CreateCompanyGateway";
import { QueueDashboard } from "./features/queue/QueueDashboard";
import { BranchManagementGateway } from "./features/branch/BranchManagementGateway";
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
  const { activeCompany, isLoadingCompany } = useCompany();
  const { enrollment, isLoadingEnrollment } = useStudent();

  // Wait for profile + role-specific data before evaluating any route redirects
  if (
    isLoadingProfile ||
    (dbUser?.role === "student" && isLoadingEnrollment) ||
    (dbUser?.role === "owner" && isLoadingCompany)
  ) {
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

  // Single source of truth for each role's home destination
  const getHomeRoute = () => {
    if (!dbUser) return "/register";

    const params = new URLSearchParams(window.location.search);
    const redirectTarget = params.get("redirect");

    if (dbUser.role === "student") {
      if (!enrollment) return "/student/onboarding";
      return redirectTarget || "/student/portal";
    }
    if (dbUser.role === "owner") {
      return activeCompany ? "/branches" : "/create-company";
    }
    return "/dashboard";
  };

  const isStaff = dbUser?.role === "owner" || dbUser?.role === "worker";
  const isOwner = dbUser?.role === "owner";
  const isStudent = dbUser?.role === "student";

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC & QR STUDENT ENTRY ROUTES */}
        <Route path="/student/join-online" element={<StudentRemoteJoin />} />
        <Route path="/student/qr-checkin" element={<StudentQrCheckIn />} />
        <Route path="/customer/join" element={<StudentQrCheckIn />} />
        <Route path="/terms" element={<TermsView />} />
        <Route path="/privacy" element={<PrivacyPolicyView />} />

        {/* STUDENT AUTH & PORTAL ROUTES */}
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
            isStudent ? (
              enrollment ? (
                <StudentPortal />
              ) : (
                <Navigate to="/student/onboarding" replace />
              )
            ) : dbUser ? (
              <Navigate to={getHomeRoute()} replace />
            ) : (
              <Navigate to="/student/auth" replace />
            )
          }
        />
        <Route
          path="/student/onboarding"
          element={
            isStudent ? (
              enrollment ? (
                <Navigate to="/student/portal" replace />
              ) : (
                <StudentOnboardingWizard />
              )
            ) : dbUser ? (
              <Navigate to={getHomeRoute()} replace />
            ) : (
              <Navigate to="/student/auth" replace />
            )
          }
        />

        {/* STAFF & OWNER AUTH ROUTES */}
        <Route
          path="/login"
          element={
            dbUser ? <Navigate to={getHomeRoute()} replace /> : <LoginGateway />
          }
        />
        <Route
          path="/register"
          element={
            dbUser ? (
              <Navigate to={getHomeRoute()} replace />
            ) : (
              <RegisterGateway />
            )
          }
        />

        {/* OWNER-ONLY WORKSPACE & BRANCH ROUTES */}
        <Route
          path="/create-company"
          element={
            isOwner ? (
              activeCompany ? (
                <Navigate to="/branches" replace />
              ) : (
                <CreateCompanyGateway />
              )
            ) : (
              <Navigate to={getHomeRoute()} replace />
            )
          }
        />
        <Route
          path="/branches"
          element={
            isOwner ? (
              activeCompany ? (
                <BranchManagementGateway />
              ) : (
                <Navigate to="/create-company" replace />
              )
            ) : (
              <Navigate to={getHomeRoute()} replace />
            )
          }
        />
        <Route
          path="/branch/:branchId/services"
          element={
            isOwner ? (
              activeCompany ? (
                <BranchServicesConfig />
              ) : (
                <Navigate to="/create-company" replace />
              )
            ) : (
              <Navigate to={getHomeRoute()} replace />
            )
          }
        />

        {/* STAFF-ONLY LIVE OPERATIONS COCKPIT (OWNER + WORKER ONLY) */}
        <Route
          path="/dashboard"
          element={
            isStaff ? (
              <QueueDashboard />
            ) : (
              <Navigate to={getHomeRoute()} replace />
            )
          }
        />

        {/* FALLBACK CATCH-ALL REDIRECT */}
        <Route
          path="*"
          element={
            <Navigate to={dbUser ? getHomeRoute() : "/register"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
