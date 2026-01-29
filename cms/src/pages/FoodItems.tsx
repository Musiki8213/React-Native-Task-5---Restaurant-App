import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Category, FoodItem } from '../types'
import './FoodItems.css'

export default function FoodItems() {
  const navigate = useNavigate()
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('')

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name')
      if (error) throw error
      setCategories(data || [])
    } catch (err: any) {
      console.error('Error loading categories:', err)
    }
  }

  const loadFoodItems = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('food_items')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })

      if (filterCategory) {
        query = query.eq('category_id', filterCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setFoodItems(data || [])
    } catch (err: any) {
      console.error('Error loading food items:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFoodItems()
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory])

  const getCategoryName = (item: any) => {
    return item.categories?.name || 'Uncategorized'
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food item?')) {
      return
    }

    try {
      const { error } = await supabase.from('food_items').delete().eq('id', id)
      if (error) throw error
      loadFoodItems()
    } catch (err: any) {
      alert('Failed to delete food item: ' + err.message)
    }
  }

  return (
    <div className="food-items-container">
      <header className="page-header">
        <button type="button" onClick={() => navigate('/dashboard')} className="back-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="back-arrow-icon" aria-hidden>
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
        <div className="header-content">
          <h1>Food Items</h1>
          <button type="button" onClick={() => navigate('/add-food-item')} className="add-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: 'middle' }} aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Food Item
          </button>
        </div>
      </header>

      <div className="content-container">
        <div className="filter-section">
          <label htmlFor="filter">Filter by Category:</label>
          <select
            id="filter"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : foodItems.length === 0 ? (
          <div className="empty-state">
            <p>No food items found.</p>
            <button onClick={() => navigate('/add-food-item')} className="add-button">
              Add Your First Food Item
            </button>
          </div>
        ) : (
          <div className="food-items-grid">
            {foodItems.map((item) => (
              <div key={item.id} className="food-item-card">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="food-item-image" />
                )}
                <div className="food-item-content">
                  <div className="food-item-header">
                    <h3>{item.name}</h3>
                    <span className="food-item-category">{getCategoryName(item)}</span>
                  </div>
                  <p className="food-item-description">{item.description}</p>
                  <div className="food-item-footer">
                    <span className="food-item-price">R{item.price.toFixed(2)}</span>
                    <div className="food-item-actions">
                      <button
                        onClick={() => navigate(`/add-food-item?id=${item.id}`)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
