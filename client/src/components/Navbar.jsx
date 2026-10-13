import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ClipboardList, GraduationCap, LayoutDashboard, LogIn, LogOut, Menu, UserPlus, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/format'

export default function Navbar() {
  const { token, employee, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    closeMenu()
    logout()
    navigate('/login')
  }

  const links = (
    <>
      <NavLink to="/" end className="nav-link" onClick={closeMenu}>
        <ClipboardList size={18} /> Enquiry form
      </NavLink>
      {token && (
        <NavLink to="/dashboard" className="nav-link" onClick={closeMenu}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
      )}
    </>
  )

  const account = token ? (
    <>
      <div className="user-chip">
        <span className="avatar">{initials(employee?.name)}</span>
        <span className="user-meta">
          <strong>{employee?.name}</strong>
          <span>{employee?.email}</span>
        </span>
      </div>
      <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
        <LogOut size={16} /> Logout
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="btn btn-ghost btn-sm" onClick={closeMenu}>
        <LogIn size={16} /> Log in
      </Link>
      <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
        <UserPlus size={16} /> Register
      </Link>
    </>
  )

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark">
            <GraduationCap size={20} />
          </span>
          CRM <span className="brand-sub">Leads</span>
        </Link>
        <nav className="nav-links">{links}</nav>
        <div className="nav-right">{account}</div>
        <button
          className="btn btn-ghost menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && (
        <nav className="mobile-menu">
          {links}
          <div className="mobile-account">{account}</div>
        </nav>
      )}
    </header>
  )
}
