import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { VehicleProvider } from './context/VehicleContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Vehicles from './pages/Vehicles'
import VehicleDetail from './pages/VehicleDetail'
import Profile from './pages/Profile'
import Marketplace from './pages/Marketplace'

function ProtectedRoute({ children }) {
  try {
    const auth = JSON.parse(localStorage.getItem('autoVaultAuth') || '{}')
    return auth.authenticated ? children : <Navigate to="/diary" replace />
  } catch {
    return <Navigate to="/diary" replace />
  }
}

function Layout({ children }) {
  return (
    <div className="app-container">
      <main className="page-content fade-in">
        {children}
      </main>
      <style>{`
        .app-container {
          position: relative;
          min-height: 100vh;
          width: 100%;
        }
        .page-content {
          width: 100%;
          min-height: 100vh;
        }
      `}</style>
    </div>
  )
}

function App() {
  const location = useLocation()
  const [, setRefresh] = useState(0)

  // Force re-render when location changes to pick up auth state
  useEffect(() => {
    setRefresh(prev => prev + 1)
  }, [location])

  return (
    <VehicleProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/diary" element={<Login />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/vehicle/:id" element={<ProtectedRoute><VehicleDetail /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </VehicleProvider>
  )
}

export default App
