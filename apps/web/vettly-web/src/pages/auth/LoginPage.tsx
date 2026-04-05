import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ThemeToggle } from "../../components/ThemeToggle";
import { toast } from "react-toastify";
import { ROUTES } from "../../router/routes";
import { z } from "zod";
import { useAuthStore } from "../../stores/authStore";
import { useLogin } from "../../api/auth/auth.api";
import { AUTH_ERRORS } from "../../api/auth/endpoints";
import { UserRole } from "../../types/auth.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const login = useLogin();

  useEffect(() => {
    if (searchParams.get("error") === AUTH_ERRORS.ACCOUNT_NOT_FOUND) {
      toast.error("No account found. Please register first.");
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  if (user) {
    navigate(user.role === UserRole.Recruiter ? ROUTES.RECRUITER : ROUTES.CANDIDATE);
  }

  const onSubmit = (data: LoginForm) => {
    login.mutate(data, {
      onSuccess: () => {
        const { user } = useAuthStore.getState();
        navigate(
          user?.role === UserRole.Recruiter ? ROUTES.RECRUITER : ROUTES.CANDIDATE
        );
      },
      onError: (error: any) => {
        console.error(error.response?.data?.message ?? "Login failed");
      },
    });
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ── Left panel: editorial dark branding ── */}
      <div className="hidden lg:flex lg:w-1/2 editorial-gradient flex-col justify-between p-12 relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-72 h-72 bg-secondary-fixed/10 rounded-full blur-3xl pointer-events-none" />

        <Link
          to={ROUTES.ROOT}
          className="text-2xl font-black tracking-tighter font-headline text-white relative z-10"
        >
          Vettly
        </Link>

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary-fixed-dim text-xs font-bold tracking-widest uppercase font-label">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            {" "}AI-Powered Recruitment
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold font-headline text-white leading-tight">
              Hire smarter.
              <br />
              Get hired faster.
            </h2>
            <p className="text-primary-fixed-dim text-lg leading-relaxed font-body max-w-sm">
              NLP screening, bias detection, and semantic matching. All in one
              platform.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { icon: "psychology", label: "NLP Resume Scoring", sub: "Beyond keyword matching" },
              { icon: "diversity_3", label: "Bias Detection Built-In", sub: "Demographic fairness metrics" },
              { icon: "draw", label: "E-Sign & Close", sub: "Offer to signed in one flow" },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary-fixed-dim shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
                <div>
                  <div className="font-headline font-bold text-sm text-white">{label}</div>
                  <div className="font-label text-xs tracking-wider uppercase text-primary-fixed-dim">
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs font-label text-primary-fixed-dim relative z-10">
          © {new Date().getFullYear()} Vettly. All rights reserved.
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 relative flex flex-col justify-center items-center px-6 py-12 bg-surface">
        {/* Mobile logo */}
        <Link
          to={ROUTES.ROOT}
          className="lg:hidden text-2xl font-black tracking-tighter font-headline text-primary mb-10"
        >
          Vettly
        </Link>

        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold font-headline text-primary">
              Welcome back
            </h1>
            <p className="mt-2 text-on-surface-variant font-body text-sm">
              Sign in to your Vettly account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold font-label tracking-widest uppercase text-on-surface-variant"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant pointer-events-none">
                  mail
                </span>
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-surface-container-high text-on-surface font-body text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-highest border-b-2 border-transparent focus:border-secondary transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-error text-xs font-label flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {" "}{errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold font-label tracking-widest uppercase text-on-surface-variant"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant pointer-events-none">
                  lock
                </span>
                <input
                  {...register("password")}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-surface-container-high text-on-surface font-body text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-highest border-b-2 border-transparent focus:border-secondary transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-error text-xs font-label flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {" "}{errors.password.message}
                </p>
              )}
            </div>

            {login.isError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm font-body">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                {" "}{(login.error as any)?.response?.data?.message ?? "Invalid email or password."}
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold text-base hover:opacity-80 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {login.isPending ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  {" "}Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* OR divider */}
          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-surface-container-high" />
            <span className="text-xs font-label tracking-widest uppercase text-on-surface-variant">or</span>
            <div className="flex-1 h-px bg-surface-container-high" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => { globalThis.location.href = "http://localhost:5050/api/auth/google?mode=login"; }}
            className="w-full flex items-center justify-center gap-3 bg-surface-container-low hover:bg-surface-container py-3.5 rounded-xl font-headline font-bold text-sm text-on-surface transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={() => { globalThis.location.href = "http://localhost:5050/api/auth/github?mode=login"; }}
            className="w-full flex items-center justify-center gap-3 bg-surface-container-low hover:bg-surface-container py-3.5 rounded-xl font-headline font-bold text-sm text-on-surface transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Continue with GitHub
          </button>

          <p className="text-center text-sm font-body text-on-surface-variant">
            Don't have an account?{" "}
            <Link
              to={ROUTES.AUTH.REGISTER}
              className="font-bold text-secondary hover:underline"
            >
              Get started for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
