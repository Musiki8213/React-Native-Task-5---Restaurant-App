import { Stack } from 'expo-router'
import { CartProvider } from '@/contexts/CartContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSegments } from 'expo-router'

function useProtectedRoute() {
  const segments = useSegments()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isAuthenticated === null) return

    const inAuthGroup = segments[0] === '(auth)'
    const inTabsGroup = segments[0] === '(tabs)'
    const isLandingPage = segments.length === 0 || segments[0] === 'index'

    if (!isAuthenticated && !inAuthGroup && !isLandingPage) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, segments])
}

export default function RootLayout() {
  useProtectedRoute()

  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Landing page */}
        <Stack.Screen name="index" />

        {/* Auth screens */}
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />

        {/* Main app */}
        <Stack.Screen name="(tabs)" />
        
        {/* Category and item screens */}
        <Stack.Screen name="category" />
        <Stack.Screen name="item" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="admin" />
      </Stack>
    </CartProvider>
  )
}
