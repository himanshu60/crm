import { useState } from 'react'
import api, { getErrorMessage } from '../api/axios'

const emptyForm = { name: '', email: '', phone: '', courseInterest: '', message: '' }

export default function EnquiryForm() {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState({ type: '', text: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus({ type: '', text: '' })
    try {
      await api.post('/enquiries/public', form)
      setForm(emptyForm)
      setStatus({ type: 'success', text: 'Thank you! Your enquiry was submitted. A counselor will contact you soon.' })
    } catch (err) {
      setStatus({ type: 'error', text: getErrorMessage(err) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card narrow">
      <h2>Course Enquiry</h2>
      <p className="muted">Fill in your details and a counselor will get in touch.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Name *
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Email *
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Phone
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          Course interest *
          <input name="courseInterest" value={form.courseInterest} onChange={handleChange} required />
        </label>
        <label>
          Message
          <textarea name="message" rows={3} value={form.message} onChange={handleChange} />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Enquiry'}
        </button>
      </form>
      {status.text && <p className={status.type}>{status.text}</p>}
    </div>
  )
}
