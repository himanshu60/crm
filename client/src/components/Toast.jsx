import { useEffect } from 'react'
import { CircleAlert, CircleCheck, X } from 'lucide-react'

// toast = { type: 'success' | 'error', text } or null. onClose must be a stable function.
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const Icon = toast.type === 'success' ? CircleCheck : CircleAlert
  return (
    <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
      <Icon size={20} className="toast-icon" />
      <span>{toast.text}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  )
}
