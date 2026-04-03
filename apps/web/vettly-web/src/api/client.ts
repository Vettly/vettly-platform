import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "../stores/authStore";
import { AUTH_ENDPOINTS } from "./auth/endpoints";
import { ROUTES } from "../router/routes";

export function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;

      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;

        const { user, setAccessToken, logout } = useAuthStore.getState();

        if (!user) {
          logout();
          globalThis.location.href = ROUTES.AUTH.LOGIN;
          throw error;
        }

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_AUTH_API_URL}${AUTH_ENDPOINTS.REFRESH}`,
            { userId: user.id },
            { withCredentials: true }
          );

          const newAccessToken = response.data.accessToken;
          setAccessToken(newAccessToken);

          original.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(original);
        } catch {
          logout();
          globalThis.location.href = ROUTES.AUTH.LOGIN;
          throw error;
        }
      }

      throw error;
    }
  );

  return client;
}
