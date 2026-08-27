import { create } from "zustand"
import type { User } from "@/types"
import { getToken, setToken, clearToken } from "./utils"
import { getMe, login as apiLogin, register as apiRegister, isUnauthorized } from "./api"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ access_token: string; plan: string }>
  register: (email: string, password: string) => Promise<{ access_token: string; plan: string; email_sent?: boolean }>
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
    const user = await getMe(res.access_token)
    set({ user, isAuthenticated: true })
    return res
  },

  register: async (email, password) => {
    const res = await apiRegister(email, password)
    setToken(res.access_token)
    const user = await getMe(res.access_token)
    set({ user, isAuthenticated: true })
    return res
  },

  logout: () => {
    clearToken()
    set({ user: null, isAuthenticated: false })
    if (typeof window !== "undefined") window.location.href = "/"
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
    } catch (e) {
      // 429 / network / 5xx must not dump a real session. Only a true 401
      // means the JWT is dead.
      if (isUnauthorized(e)) {
        clearToken()
        set({ user: null, isAuthenticated: false, isLoading: false })
        return false
      }
      set({ isLoading: false, isAuthenticated: true })
      return true
    }
  },
}))
