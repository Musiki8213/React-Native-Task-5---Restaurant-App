import TabBar from '@/components/TabBar'
import { useCart } from '@/contexts/CartContext'
import { useFoodItems } from '@/hooks/useFoodItems'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'

export default function ItemDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { addItem } = useCart()
  const { foodItems, loading } = useFoodItems()
  const item = foodItems.find((i) => i.id === id)

  const [selectedSides, setSelectedSides] = useState<string[]>([])
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>([])
  const [selectedExtras, setSelectedExtras] = useState<{ name: string; price: number }[]>([])
  const [selectedOptional, setSelectedOptional] = useState<string[]>([])
  
  useEffect(() => {
    if (item?.optional_ingredients) {
      setSelectedOptional(
        item.optional_ingredients.filter((i: any) => i.default).map((i: any) => i.name) || []
      )
    }
  }, [item])
  const [quantity, setQuantity] = useState(1)

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B2C" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    )
  }

  const toggleSide = (sideName: string) => {
    if (selectedSides.includes(sideName)) {
      setSelectedSides(selectedSides.filter((s) => s !== sideName))
    } else {
      if (item.sides && item.sides.length <= 2) {
        setSelectedSides([...selectedSides, sideName])
      } else if (selectedSides.length < 2) {
        setSelectedSides([...selectedSides, sideName])
      }
    }
  }

  const toggleDrink = (drinkName: string) => {
    if (selectedDrinks.includes(drinkName)) {
      setSelectedDrinks(selectedDrinks.filter((d) => d !== drinkName))
    } else {
      setSelectedDrinks([...selectedDrinks, drinkName])
    }
  }

  const toggleExtra = (extra: { name: string; price: number }) => {
    if (selectedExtras.find((e) => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter((e) => e.name !== extra.name))
    } else {
      setSelectedExtras([...selectedExtras, extra])
    }
  }

  const toggleOptional = (ingredientName: string) => {
    if (selectedOptional.includes(ingredientName)) {
      setSelectedOptional(selectedOptional.filter((i) => i !== ingredientName))
    } else {
      setSelectedOptional([...selectedOptional, ingredientName])
    }
  }

  const calculateTotal = () => {
    const basePrice = item.price * quantity
    const drinksPrice = selectedDrinks.reduce((sum, drinkName) => {
      const drink = item.drinks?.find((d) => d.name === drinkName)
      return sum + (drink?.price || 0) * quantity
    }, 0)
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + extra.price * quantity, 0)
    return basePrice + drinksPrice + extrasPrice
  }

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      quantity,
      customization: {
        sides: selectedSides,
        drinks: selectedDrinks,
        extras: selectedExtras,
        optionalIngredients: selectedOptional,
      },
    })
    router.back()
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{item.name}</Text>
        <View style={styles.placeholder} />
      </View>

      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>R{item.price.toFixed(2)}</Text>

        {/* Sides */}
        {item.sides && Array.isArray(item.sides) && item.sides.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Choose Sides (Select up to {item.sides.length <= 2 ? item.sides.length : 2})
            </Text>
            {item.sides.map((side) => (
              <TouchableOpacity
                key={side.name}
                style={[
                  styles.option,
                  selectedSides.includes(side.name) && styles.optionSelected,
                ]}
                onPress={() => toggleSide(side.name)}
              >
                <Text style={styles.optionText}>{side.name}</Text>
                {side.included && <Text style={styles.includedText}>(Included)</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Drinks */}
        {item.drinks && Array.isArray(item.drinks) && item.drinks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drink Options</Text>
            {item.drinks.map((drink) => (
              <TouchableOpacity
                key={drink.name}
                style={[
                  styles.option,
                  selectedDrinks.includes(drink.name) && styles.optionSelected,
                ]}
                onPress={() => toggleDrink(drink.name)}
              >
                <Text style={styles.optionText}>{drink.name}</Text>
                <Text style={styles.priceText}>
                  {drink.included ? 'Included' : `+R${drink.price.toFixed(2)}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Extras */}
        {item.extras && Array.isArray(item.extras) && item.extras.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extras</Text>
            {item.extras.map((extra) => (
              <TouchableOpacity
                key={extra.name}
                style={[
                  styles.option,
                  selectedExtras.find((e) => e.name === extra.name) && styles.optionSelected,
                ]}
                onPress={() => toggleExtra(extra)}
              >
                <Text style={styles.optionText}>{extra.name}</Text>
                <Text style={styles.priceText}>+R{extra.price.toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Optional Ingredients */}
        {item.optional_ingredients && Array.isArray(item.optional_ingredients) && item.optional_ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Optional Ingredients</Text>
            {(item.optional_ingredients || []).map((ingredient) => (
              <TouchableOpacity
                key={ingredient.name}
                style={[
                  styles.option,
                  selectedOptional.includes(ingredient.name) && styles.optionSelected,
                ]}
                onPress={() => toggleOptional(ingredient.name)}
              >
                <Text style={styles.optionText}>{ingredient.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>R{calculateTotal().toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Add to Cart</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B2C',
    marginBottom: 24,
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
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: '#FF6B2C',
    backgroundColor: '#FFF5F0',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  includedText: {
    fontSize: 12,
    color: '#FF6B2C',
  },
  priceText: {
    fontSize: 14,
    color: '#FF6B2C',
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#000',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B2C',
  },
  addButton: {
    backgroundColor: '#FF6B2C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
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
    fontSize: 14,
  },
})
