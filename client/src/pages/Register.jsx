import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
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
      const res = await api.post('/auth/register', form)
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="card narrow">
      <h2>Employee Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password (min 6 characters)
          <input type="password" name="password" minLength={6} value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p className="muted">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
