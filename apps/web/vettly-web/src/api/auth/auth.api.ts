import { useMutation } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import type { AuthResponse, LoginRequest, RegisterRequest } from "../../types/auth.types"
import { createClient } from "../client"
import { AUTH_ENDPOINTS } from "./endpoints"

const client = createClient(import.meta.env.VITE_AUTH_API_URL)

const extractId = (token: string): string => {
  const payload = JSON.parse(atob(token.split(".")[1]))
  return payload.sub
}

const handleAuthSuccess = (data: AuthResponse, setAuth: ReturnType<typeof useAuthStore.getState>["setAuth"]) => {
  setAuth(
    {
      id: extractId(data.accessToken),
      email: data.email,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
    },
    data.accessToken
  )
}

export const useRegister = () => {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await client.post<AuthResponse>(
        AUTH_ENDPOINTS.REGISTER, data
      )
      return response.data
    },
    onSuccess: (data) => handleAuthSuccess(data, setAuth),
  })
}

export const useLogin = () => {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await client.post<AuthResponse>(
        AUTH_ENDPOINTS.LOGIN, data
      )
      return response.data
    },
    onSuccess: (data) => handleAuthSuccess(data, setAuth),
  })
}

export const useLogout = () => {
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      await client.post(AUTH_ENDPOINTS.LOGOUT)
    },
    onSuccess: () => {
      logout()
    },
    onError: () => {
      logout()
    },
  })
}
