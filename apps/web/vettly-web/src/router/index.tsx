import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { UserRole } from "../types/auth.types";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import OAuthCallbackPage from "../pages/auth/OAuthCallbackPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import CandidateHomePage from "../pages/candidate/CandidateHomePage";
import CandidateApplicationsPage from "../pages/candidate/CandidateApplicationsPage";
import CandidateApplicationDetailPage from "../pages/candidate/CandidateApplicationDetailPage";
import CandidateProfilePage from "../pages/candidate/profile/CandidateProfilePage";
import JobListingsPage from "../pages/candidate/JobListingsPage";
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import RecruiterHomePage from "../pages/recruiter/RecruiterHomePage";
import RecruiterJobsPage from "../pages/recruiter/RecruiterJobsPage";
import JobPipelinePage from "../pages/recruiter/JobPipelinePage";
import RecruiterOrganizationPage from "../pages/recruiter/RecruiterOrganizationPage";
import RecruiterCandidatesPage from "../pages/recruiter/RecruiterCandidatesPage";
import RecruiterCandidateDetailPage from "../pages/recruiter/RecruiterCandidateDetailPage";
import RecruiterAnalyticsPage from "../pages/recruiter/RecruiterAnalyticsPage";
import RecruiterBiasReportPage from "../pages/recruiter/RecruiterBiasReportPage";
import { ROUTES } from "./routes";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  return <>{children}</>;
};

export const RoleRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: UserRole;
}) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  if (user?.role !== allowedRole) return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <LandingPage />,
  },
  {
    path: ROUTES.AUTH.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.AUTH.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.AUTH.CALLBACK,
    element: <OAuthCallbackPage />,
  },
  {
    path: ROUTES.CANDIDATE,
    element: (
      <RoleRoute allowedRole={UserRole.Candidate}>
        <CandidateDashboard />
      </RoleRoute>
    ),
    children: [
      { index: true, element: <CandidateHomePage /> },
      { path: "jobs", element: <JobListingsPage /> },
      { path: "applications", element: <CandidateApplicationsPage /> },
      { path: "applications/:applicationId", element: <CandidateApplicationDetailPage /> },
      { path: "profile", element: <CandidateProfilePage /> },
    ],
  },
  {
    path: ROUTES.RECRUITER,
    element: (
      <RoleRoute allowedRole={UserRole.Recruiter}>
        <RecruiterDashboard />
      </RoleRoute>
    ),
    children: [
      { index: true, element: <RecruiterHomePage /> },
      { path: "jobs", element: <RecruiterJobsPage /> },
      { path: "jobs/:jobId/pipeline", element: <JobPipelinePage /> },
      { path: "organization", element: <RecruiterOrganizationPage /> },
      { path: "candidates", element: <RecruiterCandidatesPage /> },
      { path: "candidates/:jobId/:applicationId", element: <RecruiterCandidateDetailPage /> },
      { path: "analytics", element: <RecruiterAnalyticsPage /> },
      { path: "bias-report", element: <RecruiterBiasReportPage /> },
    ],
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
