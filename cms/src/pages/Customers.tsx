import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Customers.css'

interface CustomerProfile {
  id: string
  name: string | null
  contact: string | null
  address: string | null
  email: string | null
  created_at: string
  disabled_flag: boolean | null
}

export default function Customers() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, name, contact, address, email, created_at, disabled_flag')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setCustomers((data as CustomerProfile[]) || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleToggleFlag = async (id: string, current: boolean | null) => {
    try {
      setUpdatingId(id)
      const next = !current
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ disabled_flag: next, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (updateError) throw updateError
      await loadCustomers()
    } catch (err: unknown) {
      alert('Failed to update: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const selectedCustomer = viewingId ? customers.find((c) => c.id === viewingId) : null

  return (
    <div className="customers-container">
      <header className="page-header">
        <button type="button" onClick={() => navigate('/dashboard')} className="back-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="back-arrow-icon" aria-hidden>
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
        <div className="header-content">
          <h1>Customer Management</h1>
          <p className="header-note">Read-only. You can view profiles and flag/disable users.</p>
        </div>
      </header>

      <div className="content-container">
        {error && (
          <div className="error-message">{error}</div>
        )}
        {loading ? (
          <div className="loading">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <p>No customer profiles yet.</p>
          </div>
        ) : (
          <>
            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registration date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className={c.disabled_flag ? 'row-disabled' : ''}>
                      <td className="name-cell">{c.name ?? '—'}</td>
                      <td className="email-cell">{c.email ?? '—'}</td>
                      <td>{c.contact ?? '—'}</td>
                      <td className="date-cell">{formatDate(c.created_at)}</td>
                      <td>
                        {c.disabled_flag ? (
                          <span className="status-badge status-flagged">Flagged</span>
                        ) : (
                          <span className="status-badge status-active">Active</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="view-button"
                          onClick={() => setViewingId(viewingId === c.id ? null : c.id)}
                        >
                          {viewingId === c.id ? 'Hide' : 'View'}
                        </button>
                        <button
                          type="button"
                          className="flag-button"
                          disabled={updatingId === c.id}
                          onClick={() => handleToggleFlag(c.id, c.disabled_flag ?? false)}
                          title={c.disabled_flag ? 'Clear flag' : 'Flag / Disable'}
                        >
                          {updatingId === c.id ? '…' : c.disabled_flag ? 'Clear flag' : 'Flag'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCustomer && (
              <div className="profile-detail">
                <h3>Customer profile</h3>
                <div className="profile-detail-grid">
                  <div className="detail-row">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{selectedCustomer.name ?? '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedCustomer.email ?? '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{selectedCustomer.contact ?? '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{selectedCustomer.address ?? '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Registration date</span>
                    <span className="detail-value">{formatDate(selectedCustomer.created_at)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">
                      {selectedCustomer.disabled_flag ? 'Flagged / Disabled' : 'Active'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="close-detail-button"
                  onClick={() => setViewingId(null)}
                >
                  Close
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
