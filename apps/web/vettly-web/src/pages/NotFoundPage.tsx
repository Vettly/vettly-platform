import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../router/routes";
import { ThemeToggle } from "../components/ThemeToggle";

export default function NotFoundPage() {
  const navigate = useNavigate();

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
          {/* Icon + 404 */}
          <div className="flex flex-col items-center gap-4 select-none">
            <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-on-secondary-container">
                search_off
              </span>
            </div>
            <span className="text-[8rem] font-extrabold font-headline leading-none text-primary-container">
              404
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="text-xs font-bold font-label tracking-widest text-on-surface-variant uppercase">
              Page Not Found
            </div>
            <h1 className="text-4xl font-extrabold font-headline text-primary leading-tight">
              Nothing here yet.
            </h1>
            <p className="text-lg text-on-surface-variant font-body leading-relaxed">
              The page you're looking for doesn't exist or may have been moved.
              Let's get you back on track.
            </p>
          </div>

          {/* Quick links */}
          <div className="bg-surface-container-low rounded-2xl p-5 space-y-2 text-left">
            <p className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant mb-3">
              Try these instead
            </p>
            {[
              { icon: "home", label: "Home", to: ROUTES.ROOT },
              { icon: "login", label: "Sign In", to: ROUTES.AUTH.LOGIN },
              {
                icon: "person_add",
                label: "Create Account",
                to: ROUTES.AUTH.REGISTER,
              },
            ].map(({ icon, label, to }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container transition-all text-on-surface-variant hover:text-on-surface group"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary group-hover:text-primary transition-colors">
                  {icon}
                </span>
                <span className="font-body text-sm font-medium">{label}</span>
                <span className="material-symbols-outlined text-[16px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 border-2 border-outline-variant text-primary px-6 py-3 rounded-xl font-headline font-bold hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Go Back
            </button>
            <Link
              to={ROUTES.ROOT}
              className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-bold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                home
              </span>
              Go Home
            </Link>
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
