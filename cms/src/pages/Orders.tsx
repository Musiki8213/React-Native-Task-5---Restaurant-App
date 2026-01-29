import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Orders.css'

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  customization?: unknown
}

interface Order {
  id: string
  user_id: string
  items: OrderItem[]
  total: number
  address: string
  status: OrderStatus
  created_at: string
  payment_reference?: string
  payment_status?: string
}

interface ProfileMap {
  [id: string]: { name: string | null }
}

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivered', 'cancelled']

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [profileMap, setProfileMap] = useState<ProfileMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, user_id, items, total, address, status, created_at, payment_reference, payment_status')
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      setOrders((ordersData as Order[]) || [])

      const userIds = [...new Set((ordersData || []).map((o: Order) => o.user_id))]
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds)
        if (!profilesError && profilesData) {
          const map: ProfileMap = {}
          profilesData.forEach((p: { id: string; name: string | null }) => {
            map[p.id] = { name: p.name }
          })
          setProfileMap(map)
        }
      } else {
        setProfileMap({})
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId)
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
      if (updateError) throw updateError
      await loadOrders()
    } catch (err: unknown) {
      alert('Failed to update status: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusLabel = (status: OrderStatus) => {
    if (status === 'delivered') return 'Completed'
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="orders-container">
      <header className="page-header">
        <button type="button" onClick={() => navigate('/dashboard')} className="back-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="back-arrow-icon" aria-hidden>
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
        <div className="header-content">
          <h1>Order Management</h1>
        </div>
      </header>

      <div className="content-container">
        {error && (
          <div className="error-message">{error}</div>
        )}
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet.</p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date / Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">#{order.id.slice(0, 8)}</td>
                    <td>{profileMap[order.user_id]?.name ?? '—'}</td>
                    <td className="total-cell">R{Number(order.total).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(order.created_at)}</td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {getStatusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
