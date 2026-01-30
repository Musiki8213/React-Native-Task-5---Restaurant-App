import { CartProvider } from '@/contexts/CartContext'
import { RegistrationProvider } from '@/contexts/RegistrationContext'
import { supabase } from '@/lib/supabase'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useEffect, useState } from 'react'

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

    const segmentsArray = segments as string[]
    const inAuthGroup = segmentsArray[0] === '(auth)'
    const inTabsGroup = segmentsArray[0] === '(tabs)'
    const isLandingPage = segmentsArray.length === 0 || segmentsArray[0] === 'index'

    if (!isAuthenticated && !inAuthGroup && !isLandingPage) {
      router.replace('/(auth)/login' as any)
    } else if (isAuthenticated && inAuthGroup) {
      const inRegisterSteps = segmentsArray[1] === 'register' && (segmentsArray[2] === 'step2' || segmentsArray[2] === 'step3')
      if (!inRegisterSteps) {
        router.replace('/(tabs)/' as any)
      }
    }
  }, [isAuthenticated, segments, router])
}

export default function RootLayout() {
  useProtectedRoute()

  return (
    <CartProvider>
      <RegistrationProvider>
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
      </RegistrationProvider>
    </CartProvider>
  )
}
