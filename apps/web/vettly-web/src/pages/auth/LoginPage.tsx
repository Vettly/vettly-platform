import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../router/routes";
import { z } from "zod";
import { useAuthStore } from "../../stores/authStore";
import { useLogin } from "../../api/auth/auth.api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  if (user) {
    navigate(user.role === "recruiter" ? ROUTES.RECRUITER : ROUTES.CANDIDATE);
  }

  const onSubmit = (data: LoginForm) => {
    login.mutate(data, {
      onSuccess: () => {
        const { user } = useAuthStore.getState();
        navigate(user?.role === "recruiter" ? ROUTES.RECRUITER : ROUTES.CANDIDATE);
      },
      onError: (error: any) => {
        console.error(error.response?.data?.message ?? "Login failed");
      },
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 24 }}>
      <h1>Sign in to Vettly</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email">Email</label>
          <input
            {...register("email")}
            id="email"
            type="email"
            style={{ display: "block", width: "100%", padding: 8 }}
          />
          {errors.email && (
            <span style={{ color: "red" }}>{errors.email.message}</span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password">Password</label>
          <input
            {...register("password")}
            id="password"
            type="password"
            style={{ display: "block", width: "100%", padding: 8 }}
          />
          {errors.password && (
            <span style={{ color: "red" }}>{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          style={{
            width: "100%",
            padding: 10,
            background: "#534AB7",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {login.isPending ? "Signing in..." : "Sign in"}
        </button>

        {login.isError && (
          <p style={{ color: "red" }}>
            {(login.error as any)?.response?.data?.message ?? "Login failed"}
          </p>
        )}
      </form>

      <p style={{ marginTop: 16 }}>
        Don't have an account? <Link to={ROUTES.AUTH.REGISTER}>Register</Link>
      </p>
    </div>
  );
}
