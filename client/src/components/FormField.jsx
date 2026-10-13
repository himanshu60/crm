// Label + icon + input wrapper used by every form
export default function FormField({ label, icon: Icon, required, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {required && <span className="req"> *</span>}
      </span>
      <span className="input-wrap">
        {Icon && <Icon size={18} className="input-icon" aria-hidden="true" />}
        {children}
      </span>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}
