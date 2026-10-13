// Used for both lists: pass onClaim to show the Claim column (public leads only)
export default function LeadsTable({ leads, emptyText, onClaim, claimingId }) {
  if (leads.length === 0) {
    return <p className="muted">{emptyText}</p>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Course</th>
            <th>Message</th>
            <th>{onClaim ? 'Received' : 'Claimed'}</th>
            {onClaim && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead._id}>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.phone || '-'}</td>
              <td>{lead.courseInterest}</td>
              <td>{lead.message || '-'}</td>
              <td>{new Date(onClaim ? lead.createdAt : lead.claimedAt).toLocaleString()}</td>
              {onClaim && (
                <td>
                  <button onClick={() => onClaim(lead._id)} disabled={claimingId !== null}>
                    {claimingId === lead._id ? 'Claiming...' : 'Claim'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
