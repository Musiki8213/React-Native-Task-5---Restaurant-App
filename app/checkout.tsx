import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabase'
import TabBar from '@/components/TabBar'

export default function CheckoutScreen() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCart()
  const [address, setAddress] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setProfile(data)
              setAddress(data.address || '')
              setCardNumber(data.card_number || '')
              setCardName(data.card_name || '')
            }
          })
      } else {
        router.replace('/(auth)/login' as any)
      }
    })
  }, [])

  const handlePlaceOrder = async () => {
    if (!address) {
      Alert.alert('Error', 'Please enter a delivery address')
      return
    }

    if (!cardNumber || !cardName) {
      Alert.alert('Error', 'Please enter card details')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        user_id: user.id,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customization: item.customization,
        })),
        total: getTotal(),
        address,
        card_number: cardNumber,
        card_name: cardName,
        status: 'pending',
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('orders').insert(orderData)

      if (error) {
        Alert.alert('Error', 'Failed to place order. Please try again.')
        setLoading(false)
        return
      }

      clearCart()
      setLoading(false)
      Alert.alert('Success', 'Your order has been placed', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/orders' as any),
        },
      ])
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.orderItemName}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={styles.orderItemPrice}>
                R{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>R{getTotal().toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter delivery address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Cardholder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Cardholder Name"
            value={cardName}
            onChangeText={setCardName}
          />
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.placeOrderButtonText}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      <TabBar />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 80, // Space for floating tab bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemName: {
    fontSize: 14,
    color: '#666',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B2C',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  placeOrderButton: {
    backgroundColor: '#FF6B2C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
