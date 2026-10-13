import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token } = useAuth()
  const location = useLocation()

  if (!token) {
    // Login page shows `reason` and sends the user back to `from` after logging in
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: 'Please log in with your counselor account to view enquiries.' }}
      />
    )
  }

  return children
}
