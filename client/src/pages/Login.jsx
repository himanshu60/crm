import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="card narrow">
      <h2>Employee Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="muted">
        New counselor? <Link to="/register">Create an account</Link>
      </p>
    </div>
  )
}
