import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export interface FoodItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category_id: string
  category?: string
  rating?: number
  is_featured?: boolean
  featured_title?: string | null
  featured_order?: number | null
  sides?: { name: string; included: boolean }[]
  drinks?: { name: string; price: number; included: boolean }[]
  extras?: { name: string; price: number }[]
  optional_ingredients?: { name: string; default: boolean }[]
  created_at?: string
  updated_at?: string
}

export function useFoodItems() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFoodItems()
  }, [])

  const loadFoodItems = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('food_items')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Transform data to match our interface
      const transformed = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        image_url: item.image_url,
        category_id: item.category_id,
        category: item.categories?.name?.toLowerCase() || item.category?.toLowerCase() || '',
        rating: item.rating || 5,
        is_featured: !!item.is_featured,
        featured_title: item.featured_title ?? null,
        featured_order: item.featured_order ?? null,
        sides: item.sides || [],
        drinks: item.drinks || [],
        extras: item.extras || [],
        optional_ingredients: item.optional_ingredients || [],
        created_at: item.created_at,
        updated_at: item.updated_at,
      }))

      setFoodItems(transformed)
    } catch (err: any) {
      console.error('Error loading food items:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const featuredItems = foodItems
    .filter((item) => item.is_featured)
    .sort((a, b) => (a.featured_order ?? 999) - (b.featured_order ?? 999))

  const getItemsByCategory = (category: string) => {
    // Map category names to match database
    const categoryMap: { [key: string]: string } = {
      'starters': 'Starters',
      'burgers': 'Burgers',
      'mains': 'Mains',
      'desserts': 'Desserts',
      'beverages': 'Beverages',
      'alcohol': 'Alcohol',
    }
    
    const categoryName = categoryMap[category.toLowerCase()] || category
    return foodItems.filter((item) => 
      item.category?.toLowerCase() === category.toLowerCase() ||
      item.category?.toLowerCase() === categoryName.toLowerCase()
    )
  }

  return {
    foodItems,
    featuredItems,
    loading,
    error,
    getItemsByCategory,
    refresh: loadFoodItems,
  }
}
