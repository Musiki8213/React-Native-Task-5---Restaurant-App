import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddFoodItem from './pages/AddFoodItem'
import FoodItems from './pages/FoodItems'
import './App.css'

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
