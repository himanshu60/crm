import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { token, employee, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">CRM</Link>
      <Link to="/">Enquiry Form</Link>
      {token ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <span className="spacer">{employee?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <span className="spacer" />
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  )
}
