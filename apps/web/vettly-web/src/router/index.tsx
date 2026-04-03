import { createBrowserRouter, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { UserRole } from "../types/auth.types";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import { useLogout } from "../api/auth/auth.api";
import { ROUTES } from "./routes";

const LogoutButton = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  return (
    <button
      onClick={() => logout.mutate(undefined, { onSuccess: () => navigate(ROUTES.AUTH.LOGIN) })}
      disabled={logout.isPending}
    >
      {logout.isPending ? "Logging out..." : "Logout"}
    </button>
  );
};

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
    path: ROUTES.CANDIDATE,
    element: (
      <RoleRoute allowedRole="candidate">
        <div>Candidate Dashboard — coming soon<br /><LogoutButton /></div>
      </RoleRoute>
    ),
  },
  {
    path: ROUTES.RECRUITER,
    element: (
      <RoleRoute allowedRole="recruiter">
        <div>Recruiter Dashboard — coming soon<br /><LogoutButton /></div>
      </RoleRoute>
    ),
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: <div>Unauthorized</div>,
  },
]);
