import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CircleAlert, LoaderCircle, Lock, LogIn, Mail, TriangleAlert } from 'lucide-react'
import api, { getErrorMessage } from '../api/axios'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  // Set by ProtectedRoute when a logged-out user opens the dashboard
  const redirectReason = location.state?.reason

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to view and claim student enquiries.">
      {redirectReason && (
        <div className="callout callout-warning" role="alert">
          <TriangleAlert size={18} />
          <span>{redirectReason}</span>
        </div>
      )}
      <form className="form" onSubmit={handleSubmit}>
        <FormField label="Email" icon={Mail}>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" autoComplete="email" required />
        </FormField>
        <FormField label="Password" icon={Lock}>
          <PasswordInput name="password" value={form.password} onChange={handleChange} placeholder="Your password" autoComplete="current-password" required />
        </FormField>

        {error && (
          <div className="callout callout-danger" role="alert">
            <CircleAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? <LoaderCircle size={18} className="spin" /> : <LogIn size={18} />}
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="form-footnote">
        New counselor? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  )
}
