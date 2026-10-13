import { useCallback, useEffect, useState } from 'react'
import { CalendarCheck, Inbox, RefreshCw, Search, SearchX, UserCheck } from 'lucide-react'
import api, { getErrorMessage } from '../api/axios'
import LeadsTable from '../components/LeadsTable'
import StatCard from '../components/StatCard'
import Toast from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { isToday } from '../utils/format'

const fetchLeads = () => Promise.all([api.get('/enquiries/public'), api.get('/enquiries/private')])

const TABS = {
  public: {
    label: 'Public leads',
    description: 'Unclaimed enquiries, visible to every counselor. Claim one to make it yours.',
    emptyTitle: 'No unclaimed leads',
    emptyText: 'New enquiries from the public form will show up here.',
  },
  mine: {
    label: 'My leads',
    description: 'Leads you have claimed. Only you can see these.',
    emptyTitle: 'No claimed leads yet',
    emptyText: 'Claim a lead from Public leads and it will appear here.',
  },
}

const matchesSearch = (lead, query) =>
  [lead.name, lead.email, lead.phone, lead.courseInterest].some((value) => value?.toLowerCase().includes(query))

const skeletonRows = (
  <div aria-busy="true" aria-label="Loading leads">
    {[1, 2, 3].map((n) => (
      <div className="skeleton-row" key={n}>
        <span className="skeleton skeleton-avatar" />
        <span className="skeleton" style={{ width: '28%' }} />
        <span className="skeleton" style={{ width: '18%' }} />
        <span className="skeleton" style={{ width: '22%' }} />
      </div>
    ))}
  </div>
)

export default function Dashboard() {
  const { employee, logout } = useAuth()
  const [publicLeads, setPublicLeads] = useState([])
  const [myLeads, setMyLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [claimingId, setClaimingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('public')
  const [query, setQuery] = useState('')
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
        setToast({ type: 'error', text: getErrorMessage(err) })
      })
      .finally(() => {
        if (ignore) return
        setLoading(false)
        setRefreshing(false)
      })

    return () => {
      ignore = true
    }
  }, [reloadKey, logout])

  const closeToast = useCallback(() => setToast(null), [])

  const refresh = () => {
    setRefreshing(true)
    setReloadKey((key) => key + 1)
  }

  const handleClaim = async (id) => {
    setClaimingId(id)
    try {
      const res = await api.patch(`/enquiries/${id}/claim`)
      // Move the lead from Public to My leads using the updated enquiry from the server
      setPublicLeads((leads) => leads.filter((lead) => lead._id !== id))
      setMyLeads((leads) => [res.data.enquiry, ...leads])
      setToast({ type: 'success', text: `${res.data.enquiry.name} is now in My leads.` })
    } catch (err) {
      if (err.response?.status === 401) return logout()
      // 409 = another counselor claimed it first, so reload to get the current lists
      setToast({ type: 'error', text: getErrorMessage(err) })
      refresh()
    } finally {
      setClaimingId(null)
    }
  }

  const counts = { public: publicLeads.length, mine: myLeads.length }
  const current = TABS[tab]
  const search = query.trim().toLowerCase()
  const tabLeads = tab === 'public' ? publicLeads : myLeads
  const visibleLeads = search ? tabLeads.filter((lead) => matchesSearch(lead, search)) : tabLeads
  const firstName = employee?.name?.split(' ')[0]

  let content
  if (loading) {
    content = skeletonRows
  } else if (visibleLeads.length === 0) {
    content = (
      <div className="empty-state">
        <span className="empty-icon">{search ? <SearchX size={26} /> : <Inbox size={26} />}</span>
        <h3>{search ? 'No matching leads' : current.emptyTitle}</h3>
        <p>{search ? `Nothing in ${current.label.toLowerCase()} matches "${query.trim()}".` : current.emptyText}</p>
      </div>
    )
  } else {
    content = (
      <LeadsTable
        leads={visibleLeads}
        onClaim={tab === 'public' ? handleClaim : undefined}
        claimingId={claimingId}
      />
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">Counselor dashboard</span>
          <h1>Welcome back, {firstName}</h1>
          <p>Claim new enquiries and keep track of your leads.</p>
        </div>
        <button className="btn btn-secondary" onClick={refresh} disabled={loading || refreshing}>
          <RefreshCw size={16} className={refreshing ? 'spin' : undefined} /> Refresh
        </button>
      </div>

      <div className="stats">
        <StatCard icon={Inbox} tone="indigo" label="Unclaimed leads" value={loading ? '–' : counts.public} />
        <StatCard icon={UserCheck} tone="green" label="My leads" value={loading ? '–' : counts.mine} />
        <StatCard
          icon={CalendarCheck}
          tone="amber"
          label="Claimed today"
          value={loading ? '–' : myLeads.filter((lead) => isToday(lead.claimedAt)).length}
        />
      </div>

      <div className="card leads-card">
        <div className="toolbar">
          <div className="tabs" role="tablist">
            {Object.entries(TABS).map(([key, { label }]) => (
              <button
                key={key}
                role="tab"
                className="tab"
                aria-selected={tab === key}
                aria-label={`${label} (${counts[key]})`}
                onClick={() => setTab(key)}
              >
                {label}
                <span className="tab-count">{counts[key]}</span>
              </button>
            ))}
          </div>
          <div className="search">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or course"
              aria-label="Search leads"
            />
          </div>
        </div>
        <p className="tab-description">{current.description}</p>
        {content}
      </div>

      <Toast toast={toast} onClose={closeToast} />
    </div>
  )
}
