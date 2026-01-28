import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Wait a moment for AuthContext to verify admin status
    setTimeout(async () => {
      // Check if user is admin after login
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()

        if (profile && profile.is_admin) {
          navigate('/dashboard')
        } else {
          // Not an admin - sign out and show error
          await supabase.auth.signOut()
          setError('Access denied. Admin privileges required.')
          setLoading(false)
        }
      }
    }, 500)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Admin Login</h1>
        <p className="subtitle">Restaurant CMS Dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@restaurant.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href="/register" style={{ color: '#FF6B2C', textDecoration: 'none', fontSize: '14px' }}>
              Don't have an account? Register
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
