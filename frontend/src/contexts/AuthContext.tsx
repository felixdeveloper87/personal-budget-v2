import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
import { User, LoginRequest, RegisterRequest } from '../types'
import { login, register } from '../api'
import { isJwtExpired, AUTH_SESSION_INVALID_EVENT } from '../utils/jwtExpiry'

interface AuthContextType {
  user: User | null
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // --- Restore session; drop stale persisted user if JWT is expired ---
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User
        if (parsed?.token && isJwtExpired(parsed.token)) {
          localStorage.removeItem('user')
          setUser(null)
        } else {
          setUser(parsed)
        }
      } catch {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // --- 401 from API clears localStorage; sync React state without relying on URLs ---
  useEffect(() => {
    const syncLogout = () => {
      setUser(null)
      localStorage.removeItem('user')
      if (window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/')
      }
    }
    window.addEventListener(AUTH_SESSION_INVALID_EVENT, syncLogout)
    return () => window.removeEventListener(AUTH_SESSION_INVALID_EVENT, syncLogout)
  }, [])

  // --- Login handler (calls backend API + saves user locally) ---
  const handleLogin = useCallback(async (credentials: LoginRequest) => {
    try {
      const userData = await login(credentials) // real backend call
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error: unknown) {
      // propagate so UI (toast) can handle
      throw error
    }
  }, [])

  // --- Register handler (creates user + stores locally) ---
  const handleRegister = useCallback(async (data: RegisterRequest) => {
    try {
      const userData = await register(data)
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error: unknown) {
      throw error
    }
  }, [])

  // --- Logout: clear session + state ---
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('user')
  }, [])

  // --- Context value memoized for performance ---
  const contextValue = useMemo(
    () => ({
      user,
      login: handleLogin,
      register: handleRegister,
      logout,
      loading,
    }),
    [user, loading] // functions are stable due to useCallback
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// --- Custom hook for easy context access ---
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
