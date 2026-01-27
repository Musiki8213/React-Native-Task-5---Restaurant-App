import TabBar from '@/components/TabBar'
import { foodItems } from '@/data/foodItems'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
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
  const [filteredItems, setFilteredItems] = useState(foodItems.slice(0, 3))

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
  }, [searchQuery])

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
    return '⭐'.repeat(rating)
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
          <Text style={styles.searchIcon}>🔍</Text>
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
              onPress={() => router.push({ pathname: '/category/[category]', params: { category: cat.category } })}
            >
              <Image source={cat.image} style={styles.categoryImage} />
              <Text style={styles.categoryText}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Dishes */}
        {filteredItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.dishCard}
            onPress={() => router.push(`/item?id=${item.id}`)}
          >
            <Image source={item.image} style={styles.dishImage} />
            <View style={styles.dishInfo}>
              <Text style={styles.dishName}>{item.name}</Text>
              <Text style={styles.dishDesc}>{item.description}</Text>
              <View style={styles.dishFooter}>
                <Text style={styles.price}>R{item.price.toFixed(2)}</Text>
                <Text style={styles.rating}>{renderStars(item.rating)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    fontSize: 18,
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
})
