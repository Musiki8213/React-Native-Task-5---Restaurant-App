import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AddFoodItem from './pages/AddFoodItem'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import FoodItems from './pages/FoodItems'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Register from './pages/Register'

function AppRoutes() {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAdmin ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAdmin ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-food-item"
        element={
          <ProtectedRoute>
            <AddFoodItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/food-items"
        element={
          <ProtectedRoute>
            <FoodItems />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/" 
        element={isAdmin ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
