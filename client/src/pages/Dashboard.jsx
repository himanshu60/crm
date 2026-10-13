import { useEffect, useState } from 'react'
import api, { getErrorMessage } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import LeadsTable from '../components/LeadsTable'

const fetchLeads = () => Promise.all([api.get('/enquiries/public'), api.get('/enquiries/private')])

export default function Dashboard() {
  const { employee, logout } = useAuth()
  const [publicLeads, setPublicLeads] = useState([])
  const [myLeads, setMyLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState(null)
  const [notice, setNotice] = useState({ type: '', text: '' })
  // Changing this re-runs the effect below and reloads both lists
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false // skip state updates from an outdated request

    fetchLeads()
      .then(([publicRes, myRes]) => {
        if (ignore) return
        setPublicLeads(publicRes.data.enquiries)
        setMyLeads(myRes.data.enquiries)
      })
      .catch((err) => {
        if (ignore) return
        // Expired or invalid token: clear it so ProtectedRoute sends the user to /login
        if (err.response?.status === 401) return logout()
        setNotice({ type: 'error', text: getErrorMessage(err) })
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [reloadKey, logout])

  const refresh = () => {
    setNotice({ type: '', text: '' })
    setReloadKey((key) => key + 1)
  }

  const handleClaim = async (id) => {
    setClaimingId(id)
    setNotice({ type: '', text: '' })
    try {
      const res = await api.patch(`/enquiries/${id}/claim`)
      // Move the lead from Public to My Leads using the updated enquiry from the server
      setPublicLeads((leads) => leads.filter((lead) => lead._id !== id))
      setMyLeads((leads) => [res.data.enquiry, ...leads])
      setNotice({ type: 'success', text: 'Lead claimed. It is now in My Leads.' })
    } catch (err) {
      if (err.response?.status === 401) return logout()
      // 409 = another counselor claimed it first, so reload to get the current lists
      setNotice({ type: 'error', text: getErrorMessage(err) })
      setReloadKey((key) => key + 1)
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <h2>Welcome, {employee?.name}</h2>
        <button onClick={refresh} disabled={loading}>Refresh</button>
      </div>
      {notice.text && <p className={notice.type}>{notice.text}</p>}
      {loading ? (
        <p className="muted">Loading leads...</p>
      ) : (
        <>
          <section className="card">
            <h3>Public Leads ({publicLeads.length})</h3>
            <p className="muted">Unclaimed enquiries, visible to every counselor. Claim one to make it yours.</p>
            <LeadsTable
              leads={publicLeads}
              emptyText="No unclaimed leads right now."
              onClaim={handleClaim}
              claimingId={claimingId}
            />
          </section>
          <section className="card">
            <h3>My Leads ({myLeads.length})</h3>
            <p className="muted">Leads you have claimed. Only you can see these.</p>
            <LeadsTable leads={myLeads} emptyText="You haven't claimed any leads yet." />
          </section>
        </>
      )}
    </div>
  )
}
