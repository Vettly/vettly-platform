import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Slide, ToastContainer } from "react-toastify";
import { router } from "./router/index.tsx";
import { useAuthStore } from "./stores/authStore.ts";
import { AUTH_ENDPOINTS } from "./api/auth/endpoints.ts";

// Apply saved theme before React renders to prevent flash
const savedTheme = localStorage.getItem("vettly-theme");
if (savedTheme && JSON.parse(savedTheme)?.state?.isDark) {
  document.documentElement.classList.add("dark");
}
const isDarkOnLoad: boolean = savedTheme ? (JSON.parse(savedTheme)?.state?.isDark ?? false) : false;

const { isAuthenticated, accessToken, user, setAccessToken, logout } =
  useAuthStore.getState();

if (isAuthenticated && !accessToken && user) {
  try {
    const r = await axios.post(
      `${import.meta.env.VITE_AUTH_API_URL}${AUTH_ENDPOINTS.REFRESH}`,
      { userId: user.id },
      { withCredentials: true },
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
      <ToastContainer
        position="top-right"
        autoClose={4000}
        theme={isDarkOnLoad ? "dark" : "light"}
        newestOnTop
        transition={Slide}
      />
    </QueryClientProvider>
  </StrictMode>,
);
