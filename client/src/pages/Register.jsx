import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CircleAlert, LoaderCircle, Lock, Mail, User, UserPlus } from 'lucide-react'
import api, { getErrorMessage } from '../api/axios'
import AuthLayout from '../components/AuthLayout'
import FormField from '../components/FormField'
import PasswordInput from '../components/PasswordInput'
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
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Register as a counselor to start claiming leads.">
      <form className="form" onSubmit={handleSubmit}>
        <FormField label="Full name" icon={User}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Asha Verma" autoComplete="name" required />
        </FormField>
        <FormField label="Work email" icon={Mail}>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" autoComplete="email" required />
        </FormField>
        <FormField label="Password" icon={Lock} hint="At least 6 characters">
          <PasswordInput name="password" value={form.password} onChange={handleChange} placeholder="Create a password" minLength={6} autoComplete="new-password" required />
        </FormField>

        {error && (
          <div className="callout callout-danger" role="alert">
            <CircleAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? <LoaderCircle size={18} className="spin" /> : <UserPlus size={18} />}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="form-footnote">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}
