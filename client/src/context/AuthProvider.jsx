import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'

const readSavedEmployee = () => {
  try {
    return JSON.parse(localStorage.getItem('employee'))
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [employee, setEmployee] = useState(readSavedEmployee)

  // data = { token, employee } from the login/register response
  const login = useCallback((data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('employee', JSON.stringify(data.employee))
    setToken(data.token)
    setEmployee(data.employee)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('employee')
    setToken(null)
    setEmployee(null)
  }, [])

  const value = useMemo(() => ({ token, employee, login, logout }), [token, employee, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
