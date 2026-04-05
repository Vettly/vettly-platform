import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { ROUTES } from "../../router/routes";
import { UserRole } from "../../types/auth.types";

const extractUser = (token: string) => {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return {
    id:        payload.sub as string,
    email:     payload.email as string,
    role:      payload.role as UserRole,
    firstName: payload.firstName as string,
    lastName:  (payload.lastName ?? "") as string,
  };
};

export default function OAuthCallbackPage() {
  const [params]    = useSearchParams();
  const navigate    = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      navigate(`${ROUTES.AUTH.LOGIN}?error=oauth_failed`, { replace: true });
      return;
    }

    const user = extractUser(token);
    setAuth(user, token);
    navigate(user.role === UserRole.Recruiter ? ROUTES.RECRUITER : ROUTES.CANDIDATE, { replace: true });
  }, []);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-[48px] text-secondary animate-spin">
          progress_activity
        </span>
        <p className="font-headline font-bold text-primary text-lg">Signing you in...</p>
      </div>
    </div>
  );
}
