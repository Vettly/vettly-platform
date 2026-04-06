import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../router/routes";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuthStore } from "../stores/authStore";
import { UserRole } from "../types/auth.types";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const dashboardRoute =
    user?.role === UserRole.Recruiter ? ROUTES.RECRUITER : ROUTES.CANDIDATE;

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link
            to={ROUTES.ROOT}
            className="text-xl font-bold tracking-tighter text-on-surface font-headline"
          >
            Vettly
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Icon badge */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-on-error-container">
                lock
              </span>
            </div>
          </div>

          {/* Code + heading */}
          <div className="space-y-2">
            <div className="text-xs font-bold font-label tracking-widest text-on-surface-variant uppercase">
              Error 401
            </div>
            <h1 className="text-5xl font-extrabold font-headline text-primary leading-tight">
              Access Denied
            </h1>
            <p className="text-lg text-on-surface-variant font-body leading-relaxed">
              You don't have permission to view this page. This area is
              restricted to a different role.
            </p>
          </div>

          {/* Role pill */}
          {user?.role && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant text-sm font-label text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">
                badge
              </span>
              Signed in as{" "}
              <span className="font-bold text-on-surface capitalize">
                {user.role}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 border-2 border-outline-variant text-primary px-6 py-3 rounded-xl font-headline font-bold hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Go Back
            </button>

            {isAuthenticated ? (
              <Link
                to={dashboardRoute}
                className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-bold hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  dashboard
                </span>
                My Dashboard
              </Link>
            ) : (
              <Link
                to={ROUTES.AUTH.LOGIN}
                className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-bold hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  login
                </span>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer strip */}
      <div className="border-t border-outline-variant/40 py-6 px-6 text-center">
        <p className="text-on-surface-variant text-sm font-body">
          © {new Date().getFullYear()} Vettly. Hire smarter. Get hired faster.
        </p>
      </div>
    </div>
  );
}
