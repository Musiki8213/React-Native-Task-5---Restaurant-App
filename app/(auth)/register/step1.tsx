import { useRegistration } from '@/contexts/RegistrationContext'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function RegisterStep1() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { setEmailPassword } = useRegistration()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for error passed from step3
  useEffect(() => {
    if (params.error) {
      setError(String(params.error))
      // Pre-fill email if provided
      if (params.email) {
        setEmail(String(params.email))
      }
    }
  }, [params.error, params.email])

  const handleNext = () => {
    setError(null)

    if (!email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password.length > 72) {
      setError('Password must be less than 72 characters')
      return
    }

    const weakPasswords = ['password', '123456', 'qwerty', 'abc123', 'password1', 'admin123', 'letmein', 'welcome']
    if (weakPasswords.includes(password.toLowerCase())) {
      setError('Password is too weak. Please choose a stronger password')
      return
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      return
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number')
      return
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setError('Password must contain at least one special character (e.g. !@#$%)')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setEmailPassword(email.trim().toLowerCase(), password)
    router.push('/(auth)/register/step2' as any)
  }

  const insets = useSafeAreaInsets()

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 24), paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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


      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text)
            setError(null) // Clear error when user types
          }}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? 'eye-outline' :  'eye-off-outline'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>
      {password.length > 0 && password.length < 8 && (
        <Text style={styles.helperText}>Password must be at least 8 characters</Text>
      )}
      {password.length >= 8 && !/[a-z]/.test(password) && (
        <Text style={styles.helperText}>Add a lowercase letter</Text>
      )}
      {password.length >= 8 && /[a-z]/.test(password) && !/[A-Z]/.test(password) && (
        <Text style={styles.helperText}>Add an uppercase letter</Text>
      )}
      {password.length >= 8 && /[a-zA-Z]/.test(password) && !/[0-9]/.test(password) && (
        <Text style={styles.helperText}>Add a number</Text>
      )}
      {password.length >= 8 && /[a-zA-Z0-9]/.test(password) && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) && (
        <Text style={styles.helperText}>Add a special character (!@#$%)</Text>
      )}

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text)
            setError(null) // Clear error when user types
          }}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? 'eye-outline' :  'eye-off-outline'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>
      {confirmPassword.length > 0 && password !== confirmPassword && (
        <Text style={styles.helperText}>Passwords do not match</Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
          <Text style={styles.footerLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
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
    height: 240,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
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
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    marginHorizontal: 4,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 14,
    paddingLeft: 0,
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
    fontSize: 14,
  },
  helperText: {
    color: '#FF6B2C',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
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
