import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Login.css'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Failed to create account')
        setLoading(false)
        return
      }

      // Wait a moment for the database trigger to create the profile automatically
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Try to create profile if trigger didn't create it (fallback)
      // The trigger should create it automatically, but we'll try as backup
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          is_admin: false, // Default to false - must be set manually
        })
        .select()

      if (profileError) {
        // Check if profile already exists (trigger created it)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single()

        if (!existingProfile) {
          // Profile doesn't exist and creation failed
          console.error('Profile creation error:', profileError)
          setError('Account created but profile setup failed. Please run fix-profiles-setup.sql in Supabase SQL Editor.')
          setLoading(false)
          return
        }
        // Profile exists (created by trigger), that's fine
      }

      // Show success message
      setError(null)
      alert('Account created successfully! Admin access must be granted manually via SQL. Check ADMIN_SETUP_GUIDE.md for instructions.')
      
      // Redirect to login
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Admin Registration</h1>
        <p className="subtitle">Create an account for CMS access</p>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
          Note: After registration, admin privileges must be granted manually.
        </p>

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
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#FF6B2C', textDecoration: 'none', fontSize: '14px' }}>
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
