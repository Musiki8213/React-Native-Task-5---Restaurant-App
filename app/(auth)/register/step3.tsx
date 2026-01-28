import { supabase } from '@/lib/supabase'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

export default function RegisterStep3() {
  const router = useRouter()
  const params = useLocalSearchParams()

  // ✅ normalize params
  const email = String(params.email || '')
  const password = String(params.password || '')
  const name = String(params.name || '')
  const contact = String(params.contact || '')
  const address = String(params.address || '')

  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!cardName || !cardNumber || !expiry || !cvc) {
      setError('Please fill in all card details')
      return
    }

    if (!email || !password) {
      setError('Registration session expired. Please restart registration.')
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      // Check if it's a password-related error - redirect back to step1
      const errorMessage = authError.message.toLowerCase()
      if (errorMessage.includes('password') || errorMessage.includes('weak') || errorMessage.includes('invalid') || errorMessage.includes('too short') || errorMessage.includes('too long')) {
        // Redirect back to step1 with error message
        router.replace({
          pathname: '/(auth)/register/step1' as any,
          params: {
            error: 'Password validation failed. Please check your password requirements.',
            email: email, // Preserve email
          },
        })
        return
      } else {
        setError(`Unable to create account: ${authError.message}`)
      }
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setError('Account creation failed')
      setLoading(false)
      return
    }

    // Sign in immediately after signup to establish session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })

    if (signInError) {
      // Check if it's a password-related error - redirect back to step1
      const errorMessage = signInError.message.toLowerCase()
      if (errorMessage.includes('password') || errorMessage.includes('invalid') || errorMessage.includes('credentials')) {
        router.replace({
          pathname: '/(auth)/register/step1' as any,
          params: {
            error: 'Password validation failed. Please check your password and try again.',
            email: email,
          },
        })
        return
      } else {
        setError(`Sign in failed: ${signInError.message}`)
      }
      setLoading(false)
      return
    }

    // Verify session is established
    if (!signInData.session) {
      setError('Session not established. Please try again.')
      setLoading(false)
      return
    }

    // Wait a moment for session to be fully propagated
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Verify we have an authenticated session before inserting
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    if (!currentSession) {
      setError('Session not established. Please try logging in again.')
      setLoading(false)
      return
    }

    const authenticatedUserId = currentSession.user.id
    if (authenticatedUserId !== userId) {
      setError('User ID mismatch. Please try again.')
      setLoading(false)
      return
    }

    // Try update first (in case profile was auto-created by trigger)
    // Then insert if update returns no rows
    let profileData, profileError
    
    // First try to update existing profile
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        name,
        contact,
        address,
        card_name: cardName,
        card_number: cardNumber,
        card_expiry: expiry,
        card_cvc: cvc,
      })
      .eq('id', authenticatedUserId)
      .select()

    if (updateError && updateError.code !== 'PGRST116') {
      // If update fails for reasons other than "not found", try insert
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authenticatedUserId,
          name,
          contact,
          address,
          card_name: cardName,
          card_number: cardNumber,
          card_expiry: expiry,
          card_cvc: cvc,
        })
        .select()

      if (insertError) {
        // Check if it's an RLS policy error
        if (insertError.code === '42501' || insertError.message.includes('row-level security')) {
          console.error('RLS Policy Error:', insertError)
          setError('Database security error. Please run the SQL script in fix-rls-policy.sql in your Supabase SQL Editor.')
        } else {
          profileError = insertError
        }
      } else {
        profileData = insertData
      }
    } else if (updateData && updateData.length > 0) {
      // Update succeeded
      profileData = updateData
    } else {
      // Profile doesn't exist, try insert
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authenticatedUserId,
          name,
          contact,
          address,
          card_name: cardName,
          card_number: cardNumber,
          card_expiry: expiry,
          card_cvc: cvc,
        })
        .select()

      if (insertError) {
        if (insertError.code === '42501' || insertError.message.includes('row-level security')) {
          console.error('RLS Policy Error:', insertError)
          setError('Database security error. Please run the SQL script in fix-rls-policy.sql in your Supabase SQL Editor.')
        } else {
          profileError = insertError
        }
      } else {
        profileData = insertData
      }
    }

    if (profileError) {
      console.error('Profile error:', profileError)
      setError(`Failed to save profile: ${profileError.message}`)
      setLoading(false)
      return
    }

    console.log('Profile saved successfully:', profileData)
    router.replace('/(tabs)/' as any)
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image 
          source={require('../../../assets/logo-orange.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>Register so you can explore our app.</Text>

      <Text style={styles.label}>Card Number</Text>
      <TextInput
        placeholder="Card Number"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={cardNumber}
        onChangeText={setCardNumber}
        style={styles.input}
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Expiry Date</Text>
          <TextInput
            placeholder="MM / YY"
            placeholderTextColor="#999"
            value={expiry}
            onChangeText={setExpiry}
            style={styles.input}
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            placeholder="CVV"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={cvc}
            onChangeText={setCvc}
            style={styles.input}
          />
        </View>
      </View>

      <Text style={styles.label}>Cardholder name</Text>
      <TextInput
        placeholder="Cardholder name"
        placeholderTextColor="#999"
        value={cardName}
        onChangeText={setCardName}
        style={styles.input}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
          <Text style={styles.footerLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 200,
    height: 150,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  button: {
    backgroundColor: '#FF6B2C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#FF6B2C',
    fontSize: 14,
    fontWeight: '600',
  },
})
