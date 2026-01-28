import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'
import './AddFoodItem.css'

export default function AddFoodItem() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name')
      if (error) throw error
      setCategories(data || [])
    } catch (err: any) {
      console.error('Error loading categories:', err)
    }
  }

  useEffect(() => {
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.price || !formData.category_id) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      if (!imageFile) {
        setError('Please select an image')
        setLoading(false)
        return
      }

      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `food-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('food-images').getPublicUrl(filePath)
      const imageUrl = urlData.publicUrl

      // Save food item to database
      const { error: insertError } = await supabase.from('food_items').insert({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: imageUrl,
        category_id: formData.category_id,
      })

      if (insertError) {
        throw insertError
      }

      // Success - redirect to food items list
      navigate('/food-items')
    } catch (err: any) {
      console.error('Error adding food item:', err)
      setError(err.message || 'Failed to add food item')
      setLoading(false)
    }
  }

  return (
    <div className="add-food-container">
      <header className="page-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>Add Food Item</h1>
      </header>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="food-form">
          <div className="form-group">
            <label htmlFor="name">Food Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Grilled Chicken Burger"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              placeholder="Describe the food item..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (R) *</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Food Image *</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Adding...' : 'Add Food Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
