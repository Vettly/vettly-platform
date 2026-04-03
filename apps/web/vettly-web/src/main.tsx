import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/index.tsx";
import { useAuthStore } from "./stores/authStore.ts";
import { AUTH_ENDPOINTS } from "./api/auth/endpoints.ts";

const { isAuthenticated, accessToken, user, setAccessToken, logout } =
  useAuthStore.getState();

if (isAuthenticated && !accessToken && user) {
  try {
    const r = await axios.post(
      `${import.meta.env.VITE_AUTH_API_URL}${AUTH_ENDPOINTS.REFRESH}`,
      { userId: user.id },
      { withCredentials: true }
    );
    setAccessToken(r.data.accessToken);
  } catch {
    logout();
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
