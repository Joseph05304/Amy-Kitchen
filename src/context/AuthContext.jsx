import { createContext, useContext, useEffect, useState } from 'react'
import { register as apiRegister, login as apiLogin, getMe, getToken } from '../api.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'savory_token'
const USER_KEY = 'savory_user'

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUser())
  const [ready, setReady] = useState(false)

  // Validate token on first load
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setReady(true)
      return
    }
    getMe()
      .then((u) => {
        setUser(u)
        localStorage.setItem(USER_KEY, JSON.stringify(u))
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
      })
      .finally(() => setReady(true))
  }, [])

  const register = async (data) => {
    const { token, user } = await apiRegister(data)
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setUser(user)
    return user
  }

  const login = async (data) => {
    const { token, user } = await apiLogin(data)
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const isAdmin = !!user && user.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, ready, isAdmin, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
