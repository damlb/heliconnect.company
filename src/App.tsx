import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout'
import UpdateBanner from '@/components/UpdateBanner'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Flights from '@/pages/Flights'
import Marketplace from '@/pages/Marketplace'
import Bookings from '@/pages/Bookings'
import Fleet from '@/pages/Fleet'
import Statistics from '@/pages/Statistics'
import Documents from '@/pages/Documents'
import Team from '@/pages/Team'
import Support from '@/pages/Support'
import Settings from '@/pages/Settings'
import JoinInvitation from '@/pages/JoinInvitation'
import './index.css'

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

// Protected route - requires authentication and company access
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasCompanyAccess, profile, user } = useAuth()

  // Always show spinner while loading
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Not authenticated -> login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but waiting for profile
  if (user && !profile) {
    return <LoadingSpinner />
  }

  // Authenticated but no company access -> redirect to main site
  if (!hasCompanyAccess) {
    window.location.href = 'https://heliconnect.fr'
    return <LoadingSpinner />
  }

  return <>{children}</>
}

// Public route - redirects to dashboard if already authenticated
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasCompanyAccess } = useAuth()

  // Show spinner while checking auth
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Already authenticated with company access -> dashboard
  if (isAuthenticated && hasCompanyAccess) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/join" element={<JoinInvitation />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="flights" element={<Flights />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="documents" element={<Documents />} />
        <Route path="team" element={<Team language="fr" />} />
        <Route path="support" element={<Support />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UpdateBanner />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
