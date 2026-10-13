export default function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="card stat-card">
      <span className={`stat-icon ${tone}`}>
        <Icon size={22} />
      </span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}
