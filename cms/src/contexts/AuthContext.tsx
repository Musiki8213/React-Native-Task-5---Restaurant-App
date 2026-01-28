import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthContextType {
  user: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId: string) => {
    try {
      // Get user email from auth
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      // Get profile with is_admin flag
      const { data, error } = await supabase
        .from('profiles')
        .select('id, is_admin')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data && data.is_admin) {
        setUser({
          id: data.id,
          email: authUser?.email || '',
          is_admin: data.is_admin,
        })
      } else {
        // Not an admin, sign out
        await supabase.auth.signOut()
        setUser(null)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
        clearTimeout(loadingTimeout)
      }
    }).catch((error) => {
      console.error('Error getting session:', error)
      setLoading(false)
      clearTimeout(loadingTimeout)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(loadingTimeout)
      if (session) {
        loadProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.is_admin || false,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
