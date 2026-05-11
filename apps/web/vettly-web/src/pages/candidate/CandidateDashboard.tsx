import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useLogout } from "../../api/auth/auth.api";
import { useProfile } from "../../api/candidate/candidate.api";
import { ROUTES } from "../../router/routes";
import defaultAvatar from "../../assets/user-avatar.png";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "home", to: ROUTES.CANDIDATE },
  { label: "Jobs", icon: "work_outline", to: ROUTES.CANDIDATE_JOBS },
  { label: "Applications", icon: "work", to: ROUTES.CANDIDATE_APPLICATIONS },
  { label: "Profile", icon: "person", to: ROUTES.CANDIDATE_PROFILE },
];

export default function CandidateDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { data: profile } = useProfile();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate(ROUTES.AUTH.LOGIN),
    });
  };

  const isActive = (to: string) => {
    if (to === ROUTES.CANDIDATE) return location.pathname === ROUTES.CANDIDATE;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-primary/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full flex flex-col
          bg-surface-container border-r border-outline-variant
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-16" : "w-64"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-outline-variant">
          {!collapsed && (
            <Link to={ROUTES.CANDIDATE} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: "24px" }}>
                auto_awesome
              </span>
              <span className="font-headline font-extrabold text-xl text-on-surface tracking-tight">
                Vettly
              </span>
            </Link>
          )}
          {collapsed && (
            <span className="material-symbols-outlined text-secondary mx-auto" style={{ fontSize: "24px" }}>
              auto_awesome
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              {collapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
                  ${collapsed ? "justify-center" : ""}
                  ${
                    active
                      ? "bg-secondary-container text-on-secondary-container font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: "22px" }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-body text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-outline-variant p-3">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <img
              src={profile?.avatarUrl ?? defaultAvatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-on-surface truncate font-body">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-on-surface-variant truncate font-body">
                  {user?.email}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                disabled={logout.isPending}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error-container hover:text-on-error-container text-on-surface-variant transition-colors"
                title="Logout"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  logout
                </span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen overflow-hidden
          transition-all duration-300
          ${collapsed ? "lg:ml-16" : "lg:ml-64"}
        `}
      >
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-surface-container border-b border-outline-variant">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container-high text-on-surface-variant"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              menu
            </span>
          </button>
          <span className="font-headline font-extrabold text-lg text-on-surface">
            Vettly
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
