import { useRegistration } from '@/contexts/RegistrationContext'
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
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
  const { data: regData, clearRegistration } = useRegistration()

  const full_name = regData.full_name || String(params.full_name || '')
  const phone = regData.phone || String(params.phone || '')
  const address = regData.address || String(params.address || '')

  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '')
    if (cleaned.length <= 4) {
      let formatted = cleaned
      if (cleaned.length >= 2) {
        formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2)
      }
      setExpiry(formatted)
    }
  }
  const [cvc, setCvc] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!cardName || !cardNumber || !expiry || !cvc) {
      setError('Please fill in all card details')
      return
    }

    setLoading(true)
    setError(null)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setError('Session expired. Please sign in again from the login screen.')
      setLoading(false)
      return
    }

    const nameVal = full_name || null
    const phoneVal = phone || null
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email: user.email ?? null,
        full_name: nameVal,
        name: nameVal,
        phone: phoneVal,
        contact: phoneVal,
        address: address || null,
        card_name: cardName || null,
        card_number: cardNumber || null,
        card_expiry: expiry || null,
        card_cvc: cvc || null,
      })
      .eq('id', user.id)

    if (updateError) {
      if (updateError.code === '42501' || updateError.message.includes('row-level security')) {
        setError('Database security error. Please run supabase-profiles-auth-trigger.sql in your Supabase SQL Editor.')
      } else {
        setError(`Failed to update profile: ${updateError.message}`)
      }
      setLoading(false)
      return
    }

    clearRegistration()
    await new Promise(resolve => setTimeout(resolve, 500))
    router.replace('/(tabs)/' as any)
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
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
            placeholder="MM/YY"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={expiry}
            onChangeText={handleExpiryChange}
            maxLength={5}
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
