import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import TabBar from '@/components/TabBar'

export default function OrdersScreen() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = useCallback(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (data) {
              setOrders(data)
            }
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Refresh orders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadOrders()
    }, [loadOrders])
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF6B2C'
      case 'preparing':
        return '#3B82F6'
      case 'ready':
        return '#10B981'
      case 'delivered':
        return '#059669'
      default:
        return '#666'
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders yet</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)/' as any)}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.orderItems}>
              {item.items?.map((orderItem: any, index: number) => (
                <Text key={index} style={styles.orderItemText}>
                  {orderItem.name} x{orderItem.quantity}
                </Text>
              ))}
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.orderDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
              <Text style={styles.orderTotal}>R{item.total.toFixed(2)}</Text>
            </View>
          </View>
        )}
      />
      <TabBar />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 80, // Space for floating tab bar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#FF6B2C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B2C',
  },
})
