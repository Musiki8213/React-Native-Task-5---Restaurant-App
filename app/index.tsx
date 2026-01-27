import { supabase } from '@/lib/supabase'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)')
      }
    })
  }, [])

  return (
    <ImageBackground
      source={require('../assets/landing.png')}
      style={styles.imageBackground}
     
    >
      <View style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo-white.png')} 
            style={styles.logoImage}
          />
          
        </View>

        <View style={styles.content}>
          <Text style={styles.tagline}>It's Not Just Food,</Text>
          <Text style={styles.tagline}>It's an Experience</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
   
  },
  logoImage: {
    width: 200,
    height: 240,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    alignItems: 'flex-start',
    paddingLeft: 0,
    marginTop: 270,
  },
  tagline: {
    fontSize: 32,
    fontWeight: 200,
    color: '#fff',
    textAlign: 'left',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#FF6B2C',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
