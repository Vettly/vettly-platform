import { Link, useNavigate } from "react-router-dom";
import z from "zod";
import { ROUTES } from "../../router/routes";
import { useRegister } from "../../api/auth/auth.api";
import { useAuthStore } from "../../stores/authStore";
import { UserRole } from "../../types/auth.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["candidate", "recruiter"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const register_ = useRegister();
  const { user } = useAuthStore();

  if (user) {
    navigate(user.role === UserRole.Recruiter ? ROUTES.RECRUITER : ROUTES.CANDIDATE);
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: UserRole.Candidate },
  });

  const selectedRole = watch("role");

  const onSubmit = (data: RegisterForm) => {
    register_.mutate(data, {
      onSuccess: () => {
        const user = useAuthStore.getState().user;
        navigate(
          user?.role === UserRole.Recruiter ? ROUTES.RECRUITER : ROUTES.CANDIDATE
        );
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
            {" "}Smart Recruitment
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold font-headline text-white leading-tight">
              Your next great
              <br />
              hire starts here.
            </h2>
            <p className="text-primary-fixed-dim text-lg leading-relaxed font-body max-w-sm">
              Join thousands of recruiters and candidates using Vettly to
              connect faster and fairer.
            </p>
          </div>

          {/* Mini pipeline preview */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 space-y-3 max-w-xs">
            <p className="text-xs font-bold font-label uppercase tracking-widest text-primary-fixed-dim mb-2">
              Live Match · React Engineer
            </p>
            {[
              { name: "Alex Chen", score: "94%", stage: "Matched" },
              { name: "Priya Nair", score: "89%", stage: "Interview" },
            ].map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/8"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-on-secondary text-xs font-bold font-label">
                    {c.name[0]}
                  </div>
                  <span className="font-body text-xs font-medium text-white">
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-secondary-fixed-dim font-label">
                    AI {c.score}
                  </span>
                  <span className="text-[10px] font-bold font-label uppercase tracking-wider px-2 py-0.5 rounded-full text-on-secondary bg-secondary">
                    {c.stage}
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-1 flex items-center gap-1.5 text-xs font-label text-secondary-fixed-dim">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              {" "}Bias check: Passed
            </div>
          </div>
        </div>

        <p className="text-xs font-label text-primary-fixed-dim relative z-10">
          © {new Date().getFullYear()} Vettly. All rights reserved.
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-surface overflow-y-auto">
        {/* Mobile logo */}
        <Link
          to={ROUTES.ROOT}
          className="lg:hidden text-2xl font-black tracking-tighter font-headline text-primary mb-10"
        >
          Vettly
        </Link>

        <div className="w-full max-w-md space-y-7">
          <div>
            <h1 className="text-3xl font-extrabold font-headline text-primary">
              Create your account
            </h1>
            <p className="mt-2 text-on-surface-variant font-body text-sm">
              Join Vettly and start hiring or get hired smarter.
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: UserRole.Candidate,
                icon: "person_search",
                label: "Candidate",
                sub: "Looking for a job",
              },
              {
                value: UserRole.Recruiter,
                icon: "work",
                label: "Recruiter",
                sub: "Hiring talent",
              },
            ].map(({ value, icon, label, sub }) => {
              const active = selectedRole === value;
              return (
                <label
                  key={value}
                  htmlFor={`role-${value}`}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all ${
                    active
                      ? "bg-secondary-container"
                      : "bg-surface-container-low hover:bg-surface-container"
                  }`}
                >
                  <input
                    {...register("role")}
                    type="radio"
                    id={`role-${value}`}
                    value={value}
                    className="sr-only"
                  />
                  <span
                    className={`material-symbols-outlined text-[28px] ${
                      active ? "text-on-secondary-container" : "text-on-surface-variant"
                    }`}
                  >
                    {icon}
                  </span>
                  <span
                    className={`font-headline font-bold text-sm ${
                      active ? "text-on-secondary-container" : "text-on-surface"
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`font-label text-xs text-center ${
                      active ? "text-on-secondary-container" : "text-on-surface-variant"
                    }`}
                  >
                    {sub}
                  </span>
                  {active && (
                    <span className="absolute top-2 right-2 material-symbols-outlined text-[16px] text-on-secondary-container">
                      check_circle
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="firstName"
                  className="block text-xs font-bold font-label tracking-widest uppercase text-on-surface-variant"
                >
                  First Name
                </label>
                <input
                  {...register("firstName")}
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="Alex"
                  className="w-full px-4 py-3.5 rounded-xl bg-surface-container-high text-on-surface font-body text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-highest border-b-2 border-transparent focus:border-secondary transition-all"
                />
                {errors.firstName && (
                  <p className="text-error text-xs font-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {" "}{errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="lastName"
                  className="block text-xs font-bold font-label tracking-widest uppercase text-on-surface-variant"
                >
                  Last Name
                </label>
                <input
                  {...register("lastName")}
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Chen"
                  className="w-full px-4 py-3.5 rounded-xl bg-surface-container-high text-on-surface font-body text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-surface-container-highest border-b-2 border-transparent focus:border-secondary transition-all"
                />
                {errors.lastName && (
                  <p className="text-error text-xs font-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {" "}{errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

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
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
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

            {register_.isError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm font-body">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                {" "}{(register_.error as any)?.response?.data?.message ??
                  "Registration failed. Please try again."}
              </div>
            )}

            <button
              type="submit"
              disabled={register_.isPending}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline font-bold text-base hover:opacity-80 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {register_.isPending ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  {" "}Creating account…
                </>
              ) : (
                "Create Account"
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
            onClick={() => { globalThis.location.href = `http://localhost:5050/api/auth/google?role=${selectedRole}`; }}
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
            onClick={() => { globalThis.location.href = `http://localhost:5050/api/auth/github?role=${selectedRole}`; }}
            className="w-full flex items-center justify-center gap-3 bg-surface-container-low hover:bg-surface-container py-3.5 rounded-xl font-headline font-bold text-sm text-on-surface transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Continue with GitHub
          </button>

          <p className="text-center text-sm font-body text-on-surface-variant">
            Already have an account?{" "}
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="font-bold text-secondary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
