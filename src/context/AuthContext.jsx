import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, authStorage } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = authStorage.getUser()
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = authStorage.getToken()
    if (token) {
      const remember = authStorage.isRemembered()
      authAPI.me()
        .then((res) => {
          setUser(res.data)
          authStorage.set(token, res.data, remember)
        })
        .catch(() => {
          authStorage.clear()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    authStorage.set(res.data.token, res.data, true)
    setUser(res.data)
    return res.data
  }

  const logout = () => {
    authStorage.clear()
    setUser(null)
  }

  const isAdmin = user?.role === 'super_admin'
  const isEmployee = user?.role === 'employee'
  const employeeId = user?.employeeId || user?.employee?._id

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isEmployee, employeeId }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
