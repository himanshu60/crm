import { LoaderCircle, Plus } from 'lucide-react'
import { formatDateTime, initials, timeAgo } from '../utils/format'

// Pass onClaim to show the Claim column (public leads only).
// data-label is used by the CSS to label each value when rows turn into cards on small screens.
export default function LeadsTable({ leads, onClaim, claimingId }) {
  const isPublic = Boolean(onClaim)
  const dateLabel = isPublic ? 'Received' : 'Claimed'

  return (
    <table className="leads-table">
      <thead>
        <tr>
          <th>Lead</th>
          <th>Phone</th>
          <th>Course</th>
          <th>Message</th>
          <th>{dateLabel}</th>
          {isPublic && (
            <th className="cell-action">
              <span className="sr-only">Action</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => {
          const date = isPublic ? lead.createdAt : lead.claimedAt
          const isClaiming = claimingId === lead._id

          return (
            <tr key={lead._id}>
              <td className="cell-person">
                <div className="lead-person">
                  <span className="avatar">{initials(lead.name)}</span>
                  <div>
                    <div className="lead-name">{lead.name}</div>
                    <a className="lead-email" href={`mailto:${lead.email}`}>
                      {lead.email}
                    </a>
                  </div>
                </div>
              </td>
              <td data-label="Phone">
                {lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : <span className="subtle">—</span>}
              </td>
              <td data-label="Course">
                <span className="badge">{lead.courseInterest}</span>
              </td>
              <td data-label="Message">
                <span className="lead-message" title={lead.message}>
                  {lead.message || '—'}
                </span>
              </td>
              <td data-label={dateLabel}>
                <span className="time" title={formatDateTime(date)}>
                  {timeAgo(date)}
                </span>
              </td>
              {isPublic && (
                <td className="cell-action">
                  <button className="btn btn-primary btn-sm" onClick={() => onClaim(lead._id)} disabled={claimingId !== null}>
                    {isClaiming ? <LoaderCircle size={16} className="spin" /> : <Plus size={16} />}
                    {isClaiming ? 'Claiming...' : 'Claim'}
                  </button>
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
