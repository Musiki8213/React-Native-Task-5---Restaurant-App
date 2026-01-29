import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import './Dashboard.css'

interface OrderRow {
  id: string
  total: number
  created_at: string
  items: { id: string; name: string; price: number; quantity: number }[]
}

interface DaySummary {
  date: string
  count: number
  revenue: number
}

interface ItemRank {
  name: string
  quantity: number
}

const IconCart = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)
const IconPeople = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconPlus = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconList = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)
const IconSettings = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [ordersToday, setOrdersToday] = useState(0)
  const [revenueToday, setRevenueToday] = useState(0)
  const [mostOrdered, setMostOrdered] = useState<ItemRank[]>([])
  const [ordersPerDay, setOrdersPerDay] = useState<DaySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, created_at, items')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      const orders = (ordersData as OrderRow[]) || []

      const todayOrders = orders.filter((o) => o.created_at >= todayStart)
      setOrdersToday(todayOrders.length)
      setRevenueToday(todayOrders.reduce((sum, o) => sum + Number(o.total), 0))

      const itemCounts: Record<string, number> = {}
      orders.forEach((o) => {
        if (Array.isArray(o.items)) {
          o.items.forEach((item: { name: string; quantity: number }) => {
            const name = item.name || 'Unknown'
            itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1)
          })
        }
      })
      const ranked = Object.entries(itemCounts)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)
      setMostOrdered(ranked)

      const byDay: Record<string, { count: number; revenue: number }> = {}
      orders.forEach((o) => {
        const d = o.created_at.slice(0, 10)
        if (!byDay[d]) byDay[d] = { count: 0, revenue: 0 }
        byDay[d].count += 1
        byDay[d].revenue += Number(o.total)
      })
      const daySummaries: DaySummary[] = Object.entries(byDay)
        .map(([date, { count, revenue }]) => ({ date, count, revenue }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14)
      setOrdersPerDay(daySummaries)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {user?.email}</p>
        </div>
        <button type="button" onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        {error && (
          <div className="analytics-error">{error}</div>
        )}
        {loading ? (
          <div className="analytics-loading">Loading analytics...</div>
        ) : (
          <section className="analytics-section">
            <h2 className="analytics-title">Basic Analytics</h2>
            <div className="analytics-cards">
              <div className="analytics-card">
                <span className="analytics-card-value">{ordersToday}</span>
                <span className="analytics-card-label">Orders today</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-card-value">R{revenueToday.toFixed(2)}</span>
                <span className="analytics-card-label">Revenue today</span>
              </div>
            </div>
            <div className="analytics-row">
              <div className="analytics-box">
                <h3>Most ordered items</h3>
                {mostOrdered.length === 0 ? (
                  <p className="analytics-empty">No orders yet</p>
                ) : (
                  <ul className="most-ordered-list">
                    {mostOrdered.map((item, i) => (
                      <li key={item.name}>
                        <span className="rank">{i + 1}.</span>
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">×{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="analytics-box">
                <h3>Orders per day (last 14 days)</h3>
                {ordersPerDay.length === 0 ? (
                  <p className="analytics-empty">No orders yet</p>
                ) : (
                  <ul className="orders-per-day-list">
                    {ordersPerDay.map((day) => (
                      <li key={day.date} className="day-row">
                        <span className="day-date">{formatDate(day.date)}</span>
                        <span className="day-count">{day.count} orders</span>
                        <span className="day-revenue">R{day.revenue.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="dashboard-links">
          <h2 className="section-title">Quick links</h2>
          <div className="dashboard-grid">
            <Link to="/orders" className="dashboard-card">
              <div className="card-icon"><IconCart /></div>
              <h2>Order Management</h2>
              <p>View and update order status</p>
            </Link>
            <Link to="/customers" className="dashboard-card">
              <div className="card-icon"><IconPeople /></div>
              <h2>Customers</h2>
              <p>View customer profiles</p>
            </Link>
            <Link to="/add-food-item" className="dashboard-card">
              <div className="card-icon"><IconPlus /></div>
              <h2>Add Food Item</h2>
              <p>Create a new food item for the menu</p>
            </Link>
            <Link to="/food-items" className="dashboard-card">
              <div className="card-icon"><IconList /></div>
              <h2>View Food Items</h2>
              <p>Manage existing food items</p>
            </Link>
            <Link to="/profile" className="dashboard-card">
              <div className="card-icon"><IconSettings /></div>
              <h2>Profile Settings</h2>
              <p>Update email and password</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
