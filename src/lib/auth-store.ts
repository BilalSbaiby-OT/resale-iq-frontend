import { create } from "zustand"
import type { User } from "@/types"
import { getToken, setToken, clearToken } from "./utils"
import { getMe, login as apiLogin, register as apiRegister } from "./api"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ access_token: string; plan: string }>
  register: (email: string, password: string) => Promise<{ access_token: string; plan: string }>
  logout: () => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await apiLogin(email, password)
    setToken(res.access_token)
    const user = await getMe()
    set({ user, isAuthenticated: true })
    return res
  },

  register: async (email, password) => {
    const res = await apiRegister(email, password)
    setToken(res.access_token)
    const user = await getMe()
    set({ user, isAuthenticated: true })
    return res
  },

  logout: () => {
    clearToken()
    set({ user: null, isAuthenticated: false })
    if (typeof window !== "undefined") window.location.href = "/login"
  },

  checkAuth: async () => {
    const token = getToken()
    if (!token) {
      set({ isLoading: false, isAuthenticated: false })
      return false
    }
    try {
      const user = await getMe()
      set({ user, isAuthenticated: true, isLoading: false })
      return true
    } catch {
      clearToken()
      set({ user: null, isAuthenticated: false, isLoading: false })
      return false
    }
  },
}))
