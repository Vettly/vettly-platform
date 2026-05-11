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
import CandidateProfilePage from "../pages/candidate/profile/CandidateProfilePage";
import JobListingsPage from "../pages/candidate/JobListingsPage";
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
      { path: "profile", element: <CandidateProfilePage /> },
    ],
  },
  {
    path: ROUTES.RECRUITER,
    element: (
      <RoleRoute allowedRole={UserRole.Recruiter}>
        <div>Recruiter Dashboard — coming soon</div>
      </RoleRoute>
    ),
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
