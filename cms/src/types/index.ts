export interface Category {
  id: string
  name: string
}

export interface FoodItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category_id: string
  created_at?: string
  updated_at?: string
  categories?: {
    name: string
  }
}

export interface Profile {
  id: string
  email: string
  is_admin: boolean
}
