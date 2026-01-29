import TabBar from '@/components/TabBar'
import { useCart } from '@/contexts/CartContext'
import { convertToKobo, initializeTransaction, verifyTransaction } from '@/lib/paystackService'
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useEffect, useState } from 'react'
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

let Paystack: any = null
if (Platform.OS !== 'web') {
  try {
    const PaystackModule = require('react-native-paystack-webview')
    if (PaystackModule && PaystackModule.Paystack) {
      Paystack = PaystackModule.Paystack
    } else if (PaystackModule && PaystackModule.default) {
      Paystack = PaystackModule.default
    } else if (PaystackModule) {
      Paystack = PaystackModule
    }
    console.log('Paystack module loaded:', !!PaystackModule)
    console.log('Paystack component available:', !!Paystack)
    if (PaystackModule) {
      console.log('Available exports:', Object.keys(PaystackModule))
    }
  } catch (e) {
    console.error('Paystack WebView not available:', e)
  }
}

export default function CheckoutScreen() {
  const router = useRouter()
  const { items, getTotal, clearCart, getItemCount } = useCart()
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showPaystack, setShowPaystack] = useState(false)
  const [paymentReference, setPaymentReference] = useState<string | null>(null)
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null)

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
              setEmail(session.user.email || '')
            }
          })
      } else {
        router.replace('/(auth)/login' as any)
      }
    })
  }, [])

  const handlePlaceOrder = async () => {
    console.log('Place Order button pressed')
    console.log('Platform:', Platform.OS)
    console.log('Address:', address)
    console.log('Email:', email)
    console.log('Items:', items.length)

    if (!address) {
      Alert.alert('Error', 'Please enter a delivery address')
      return
    }

    if (!email) {
      Alert.alert('Error', 'Please enter your email address')
      return
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty')
      return
    }

    setLoading(true)

    try {
      const reference = `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`
      setPaymentReference(reference)

      if (Platform.OS === 'web') {
        console.log('Initializing web payment...')
        await handleWebPayment(reference)
      } else {
        try {
          console.log('Initializing transaction for mobile payment...')
          const amountInKobo = convertToKobo(getTotal())
          
          const transaction = await initializeTransaction({
            email,
            amount: amountInKobo,
            reference,
            metadata: {
              user_id: user?.id,
              order_items: items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              address,
            },
          })

          if (transaction.status && transaction.data.authorization_url) {
            console.log('Transaction initialized successfully')
            setAuthorizationUrl(transaction.data.authorization_url)
            setPaymentReference(transaction.data.reference)
            setLoading(false)
            
            if (Paystack && typeof Paystack === 'function') {
              console.log('Using Paystack component')
              setShowPaystack(true)
            } else {
              console.log('Paystack component not available, using WebBrowser')
              await WebBrowser.openBrowserAsync(transaction.data.authorization_url)

              setLoading(true)
              await new Promise(resolve => setTimeout(resolve, 3000))
              const verification = await verifyTransaction(transaction.data.reference)
              
              if (verification.status && verification.data.status === 'success') {
                await createOrder(transaction.data.reference)
              } else {
                setLoading(false)
                Alert.alert(
                  'Payment status',
                  'If you completed payment, check your Orders tab. Otherwise you can try again.'
                )
              }
            }
          } else {
            throw new Error(transaction.message || 'Failed to initialize payment')
          }
        } catch (error: any) {
          console.error('Error initializing mobile payment:', error)
          Alert.alert('Error', error.message || 'Failed to initialize payment')
          setLoading(false)
        }
      }
    } catch (error: any) {
      console.error('Error in handlePlaceOrder:', error)
      Alert.alert('Error', error.message || 'Failed to initialize payment')
      setLoading(false)
    }
  }

  const handleWebPayment = async (reference: string) => {
    try {
      const amountInKobo = convertToKobo(getTotal())
      
      const transaction = await initializeTransaction({
        email,
        amount: amountInKobo,
        reference,
        metadata: {
          user_id: user?.id,
          order_items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          address,
        },
      })

      if (transaction.status && transaction.data.authorization_url) {
        const refToUse = transaction.data.reference || reference
        setLoading(false)
        await WebBrowser.openBrowserAsync(transaction.data.authorization_url)

        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 3000))
        const verification = await verifyTransaction(refToUse)
        
        if (verification.status && verification.data?.status === 'success') {
          await createOrder(refToUse)
        } else {
          setLoading(false)
          Alert.alert(
            'Payment status',
            'If you completed payment, check your Orders tab. Otherwise you can try again.'
          )
        }
      } else {
        throw new Error(transaction.message || 'Failed to initialize payment')
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process payment')
      setLoading(false)
    }
  }

  const createOrder = async (reference: string) => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'Session expired. Please log in again.')
        setLoading(false)
        setShowPaystack(false)
        return
      }
      if (items.length === 0) {
        Alert.alert('Error', 'Cart is empty. Order could not be created.')
        setLoading(false)
        setShowPaystack(false)
        return
      }

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
        payment_reference: reference,
        payment_status: 'paid',
        status: 'pending',
        created_at: new Date().toISOString(),
      }

      console.log('Order data to insert:', JSON.stringify(orderData, null, 2))
      
      const { data: insertedOrder, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()

      if (error) {
        console.error('=== Order Creation Error ===')
        console.error('Error details:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        Alert.alert('Error', `Payment successful but failed to create order: ${error.message}. Please contact support.`)
        setLoading(false)
        setShowPaystack(false)
        return
      }

      if (!insertedOrder || insertedOrder.length === 0) {
        console.error('Order insert returned no data')
        Alert.alert('Error', 'Payment successful but order was not created. Please contact support.')
        setLoading(false)
        setShowPaystack(false)
        return
      }

      console.log('=== Order Created Successfully ===')
      console.log('Inserted order:', insertedOrder)
      console.log('Order ID:', insertedOrder[0]?.id)
      
      console.log('Clearing cart...')
      console.log('Cart items before clear:', items.length)
      console.log('Cart item count before clear:', getItemCount())
      
      // Clear cart immediately
      clearCart()
      
      // Verify cart is cleared
      console.log('Cart cleared - verifying...')
      console.log('Cart items after clear:', items.length)
      console.log('Cart item count after clear:', getItemCount())
      
      setLoading(false)
      setShowPaystack(false)
      
      Alert.alert(
        'Order complete',
        'Your order has been completed successfully. Your cart has been cleared. You can view it under Orders.',
        [
          {
            text: 'View Orders',
            onPress: () => {
              router.replace('/(tabs)/orders' as any)
            },
          },
        ]
      )
    } catch (error: any) {
      console.error('=== Exception in createOrder ===')
      console.error('Error:', error)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      Alert.alert('Error', `Failed to create order: ${error?.message || 'Unknown error'}. Please contact support.`)
      setLoading(false)
      setShowPaystack(false)
    }
  }

  const handlePaymentSuccess = async (response: any) => {
    const refToUse = response?.transactionRef || response?.reference || paymentReference
    if (!refToUse) {
      console.error('No payment reference found in response:', response)
      Alert.alert('Error', 'Payment completed but we could not confirm it. Please check your orders.')
      setShowPaystack(false)
      setLoading(false)
      return
    }

    setShowPaystack(false)
    setLoading(true)

    try {
      const verification = await verifyTransaction(refToUse)
      if (verification.status && verification.data?.status === 'success') {
        await createOrder(refToUse)
      } else {
        setLoading(false)
        Alert.alert('Payment Pending', 'Payment may still be processing. Check your orders in a moment.')
      }
    } catch (error: any) {
      console.error('Error in handlePaymentSuccess:', error)
      setLoading(false)
      Alert.alert('Error', error.message || 'Payment verification failed. Please check your orders or contact support if payment was deducted.')
    }
  }

  const handlePaymentClose = () => {
    setShowPaystack(false)
    setPaymentReference(null)
    setAuthorizationUrl(null)
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
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
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.paymentNote}>
            You will be redirected to Paystack to complete your payment securely.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, (loading || !user) && styles.buttonDisabled]}
          onPress={() => {
            console.log('Button clicked, calling handlePlaceOrder')
            handlePlaceOrder()
          }}
          disabled={loading || !user}
          activeOpacity={0.7}
        >
          <Text style={styles.placeOrderButtonText}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      <TabBar />

      {/* Paystack Payment Modal - Native only */}
      {showPaystack && paymentReference && Platform.OS !== 'web' && Paystack && typeof Paystack === 'function' && (
        <Modal
          visible={showPaystack}
          animationType="slide"
          onRequestClose={handlePaymentClose}
          transparent={false}
        >
          <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingTop: 50 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Complete Payment</Text>
              <TouchableOpacity onPress={handlePaymentClose}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            <Paystack
              paystackKey="pk_test_3fd4a7c967557a5db86c6182ca25e9101e48c0a8"
              amount={convertToKobo(getTotal())}
              billingEmail={email}
              billingMobile={profile?.contact || ''}
              billingName={profile?.name || 'Customer'}
              currency="ZAR"
              channels={['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']}
              refNumber={paymentReference}
              onCancel={(response: any) => {
                console.log('Payment cancelled:', response)
                Alert.alert('Payment Cancelled', 'Payment was cancelled. You can try again.')
                handlePaymentClose()
              }}
              onSuccess={(response: any) => {
                console.log('Payment success response:', response)
                handlePaymentSuccess(response)
              }}
              autoStart={true}
              activityIndicatorColor="#FF6B2C"
              SafeAreaViewContainer={{ marginTop: 5 }}
              SafeAreaViewContainerModal={{ marginTop: 5 }}
            />
          </View>
        </Modal>
      )}
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
    paddingBottom: 80,
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
  paymentNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
})
