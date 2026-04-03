import { Link, useNavigate } from "react-router-dom";
import z from "zod";
import { ROUTES } from "../../router/routes";
import { useRegister } from "../../api/auth/auth.api";
import { useAuthStore } from "../../stores/authStore";
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
    navigate(user.role === "recruiter" ? ROUTES.RECRUITER : ROUTES.CANDIDATE);
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "candidate" },
  });

  const onSubmit = (data: RegisterForm) => {
    register_.mutate(data, {
      onSuccess: () => {
        const user = useAuthStore.getState().user;
        navigate(user?.role === "recruiter" ? ROUTES.RECRUITER : ROUTES.CANDIDATE);
      },
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1>Create your Vettly account</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="firstName">First name</label>
          <input
            {...register("firstName")}
            id="firstName"
            style={{ display: "block", width: "100%", padding: 8 }}
          />
          {errors.firstName && (
            <span style={{ color: "red" }}>{errors.firstName.message}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="lastName">Last name</label>
          <input
            {...register("lastName")}
            id="lastName"
            style={{ display: "block", width: "100%", padding: 8 }}
          />
          {errors.lastName && (
            <span style={{ color: "red" }}>{errors.lastName.message}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
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

        <div style={{ marginBottom: 12 }}>
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

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="role">I am a</label>
          <select
            {...register("role")}
            id="role"
            style={{ display: "block", width: "100%", padding: 8 }}
          >
            <option value="candidate">Candidate — looking for a job</option>
            <option value="recruiter">Recruiter — hiring talent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={register_.isPending}
          style={{
            width: "100%",
            padding: 10,
            background: "#534AB7",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {register_.isPending ? "Creating account..." : "Create account"}
        </button>

        {register_.isError && (
          <p style={{ color: "red" }}>
            {(register_.error as any)?.response?.data?.message ??
              "Registration failed"}
          </p>
        )}
      </form>

      <p style={{ marginTop: 16 }}>
        Already have an account? <Link to={ROUTES.AUTH.LOGIN}>Sign in</Link>
      </p>
    </div>
  );
}
