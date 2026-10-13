import { CircleCheck, GraduationCap } from 'lucide-react'

const points = [
  'See every new student enquiry in one place',
  'Claim a lead so no other counselor works on it',
  'Keep track of all the leads you have claimed',
]

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="card auth-shell">
      <aside className="auth-aside">
        <span className="brand-mark">
          <GraduationCap size={20} />
        </span>
        <div>
          <h2>Counselor workspace</h2>
          <p>Manage student enquiries and turn them into admissions.</p>
        </div>
        <ul className="auth-points">
          {points.map((point) => (
            <li key={point}>
              <CircleCheck size={20} /> {point}
            </li>
          ))}
        </ul>
      </aside>
      <div className="auth-main">
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
      </div>
    </div>
  )
}
