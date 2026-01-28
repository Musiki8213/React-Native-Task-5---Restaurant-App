import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import './Dashboard.css'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <Link to="/add-food-item" className="dashboard-card">
            <div></div>
            <h2>Add Food Item</h2>
            <p>Create a new food item for the menu</p>
          </Link>

          <Link to="/food-items" className="dashboard-card">
            <div></div>
            <h2>View Food Items</h2>
            <p>Manage existing food items</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
