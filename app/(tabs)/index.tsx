import TabBar from '@/components/TabBar'
import { useFoodItems } from '@/hooks/useFoodItems'
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
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

export default function HomeScreen() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { foodItems, loading: itemsLoading } = useFoodItems()
  const [filteredItems, setFilteredItems] = useState<any[]>([])

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .single()
            
          if (error) {
            // PGRST116 means no rows found - profile doesn't exist yet
            if (error.code === 'PGRST116') {
              console.log('Profile not found yet, user may need to complete registration')
              return
            }
            console.error('Error loading user name:', error)
            return
          }
          
          if (data?.name) {
            setUserName(data.name)
          }
        }
      } catch (error) {
        console.error('Error loading user name:', error)
      }
    }
    
    loadUserName()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = foodItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredItems(filtered)
    } else {
      setFilteredItems(foodItems.slice(0, 3))
    }
  }, [searchQuery, foodItems])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const categories = [
    {
      title: 'Starters',
      image: require('../../assets/images/categories/starter.jpg'),
      category: 'starters',
    },
    {
      title: 'Burgers',
      image: require('../../assets/images/categories/burgers.jpg'),
      category: 'burgers',
    },
    {
      title: 'Mains',
      image: require('../../assets/images/categories/main.jpg'),
      category: 'mains',
    },
    {
      title: 'Desserts',
      image: require('../../assets/images/categories/desert.jpg'),
      category: 'desserts',
    },
    {
      title: 'Beverages',
      image: require('../../assets/images/categories/beverages.jpg'),
      category: 'beverages',
    },
    {
      title: 'Alcohol',
      image: require('../../assets/images/categories/alcohol.jpg'),
      category: 'alcohol',
    },
  ]

  const renderStars = (rating: number) => {
    const stars = Math.min(5, Math.max(0, Math.round(rating)))
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons key={i} name={i <= stars ? 'star' : 'star-outline'} size={14} color="#FF6B2C" style={styles.starIcon} />
        ))}
      </View>
    )
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.greeting}>
          {getGreeting()}{userName ? `, ${userName}` : ''}
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search here..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.title}
              style={styles.categoryCard}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/category/[category]' as any, params: { category: cat.category } })}
            >
              <Image source={cat.image} style={styles.categoryImage} />
              <Text style={styles.categoryText}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Dishes */}
        {itemsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B2C" />
            <Text style={styles.loadingText}>Loading menu...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.dishCard}
              onPress={() => router.push(`/item?id=${item.id}` as any)}
            >
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.dishImage} />
              ) : (
                <View style={[styles.dishImage, styles.placeholderImage]}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{item.name}</Text>
                <Text style={styles.dishDesc}>{item.description}</Text>
                <View style={styles.dishFooter}>
                  <Text style={styles.price}>R{item.price.toFixed(2)}</Text>
                  <Text style={styles.rating}>{renderStars(item.rating || 5)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
    padding: 16,
    paddingTop: 50,
    paddingBottom: 80, // Space for floating tab bar
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  dishInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  dishName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#000',
  },
  dishDesc: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#FF6B2C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rating: {
    fontSize: 12,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginLeft: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
})
