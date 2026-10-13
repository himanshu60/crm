import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CircleAlert,
  CircleCheck,
  Clock,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  UserRound,
} from 'lucide-react'
import api, { getErrorMessage } from '../api/axios'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'

const emptyForm = { name: '', email: '', phone: '', courseInterest: '', message: '' }

const features = [
  { icon: UserRound, title: 'One-on-one counseling', text: 'A counselor helps you choose the course that fits your goals.' },
  { icon: Clock, title: 'Quick follow-up', text: 'Your enquiry goes straight to our counseling team.' },
  { icon: ShieldCheck, title: 'No account needed', text: 'Just fill in the form. Only our counselors can see your details.' },
]

export default function EnquiryForm() {
  const { token, employee } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/enquiries/public', form)
      setSubmittedEmail(form.email)
      setForm(emptyForm)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="enquiry-layout">
      <section className="hero">
        <span className="eyebrow">
          <Sparkles size={14} /> Free course counseling
        </span>
        <h1>
          Find the right course with <span className="gradient-text">expert guidance</span>
        </h1>
        <p className="hero-lead">
          Tell us what you want to learn. A counselor will contact you to answer your questions and help you get
          started.
        </p>
        <ul className="feature-list">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="feature-icon">
                <Icon size={20} />
              </span>
              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* Students can submit without logging in, but only counselors can view enquiries */}
        {token ? (
          <div className="callout callout-info">
            <LayoutDashboard size={18} />
            <span>
              You are logged in as <strong>{employee?.name}</strong>. New enquiries appear in your{' '}
              <Link to="/dashboard">dashboard</Link>.
            </span>
          </div>
        ) : (
          <div className="callout callout-warning">
            <Lock size={18} />
            <span>
              <strong>Looking for submitted enquiries?</strong> Enquiries can only be viewed by counselors.{' '}
              <Link to="/login">Log in</Link> or <Link to="/register">register as a counselor</Link> to view and
              claim them.
            </span>
          </div>
        )}
      </section>

      <section className="card form-card">
        {submittedEmail ? (
          <div className="success-state" role="status">
            <span className="success-icon">
              <CircleCheck size={34} />
            </span>
            <h2>Enquiry submitted!</h2>
            <p className="muted">
              Thank you. A counselor will contact you at <strong>{submittedEmail}</strong> soon.
            </p>
            <div className="callout callout-info">
              <Lock size={18} />
              <span>Your enquiry is now in our CRM. Only logged-in counselors can view it.</span>
            </div>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => setSubmittedEmail('')}>
                Submit another enquiry
              </button>
              {!token && (
                <Link className="btn btn-secondary" to="/login">
                  Counselor login <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="card-header">
              <h2>Course enquiry</h2>
              <p>Fields marked * are required.</p>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-row">
                <FormField label="Full name" icon={User} required>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Ravi Kumar" autoComplete="name" required />
                </FormField>
                <FormField label="Email" icon={Mail} required>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required />
                </FormField>
              </div>
              <div className="form-row">
                <FormField label="Phone" icon={Phone}>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="98765 43210" autoComplete="tel" />
                </FormField>
                <FormField label="Course interest" icon={BookOpen} required>
                  <input name="courseInterest" value={form.courseInterest} onChange={handleChange} placeholder="e.g. Web Development" required />
                </FormField>
              </div>
              <FormField label="Message" icon={MessageSquare}>
                <textarea name="message" rows={4} value={form.message} onChange={handleChange} placeholder="Anything you would like the counselor to know?" />
              </FormField>

              {error && (
                <div className="callout callout-danger" role="alert">
                  <CircleAlert size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
                {submitting ? <LoaderCircle size={18} className="spin" /> : <Send size={18} />}
                {submitting ? 'Submitting...' : 'Submit enquiry'}
              </button>
              <p className="form-footnote">By submitting, you agree to be contacted by our counseling team.</p>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
