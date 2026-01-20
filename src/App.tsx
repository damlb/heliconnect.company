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

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasCompanyAccess, profile, user } = useAuth()

  // Toujours attendre que le chargement soit terminé
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Si authentifié mais profil pas encore chargé, attendre
  // C'est crucial pour éviter la redirection avant que le rôle soit vérifié
  if (user && !profile) {
    return <LoadingSpinner />
  }

  // Si profil chargé mais pas accès company, rediriger
  if (!hasCompanyAccess) {
    // Redirect non-company users to the main site
    window.location.href = 'https://heliconnect.fr'
    return null
  }

  return <>{children}</>
}

// Public route wrapper (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasCompanyAccess, profile } = useAuth()

  // Ne pas attendre le loading pour afficher la page login
  // Mais attendre que le profile soit chargé avant de rediriger
  if (!isLoading && isAuthenticated && profile && hasCompanyAccess) {
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

      {/* Catch all - redirect to login (ProtectedRoute will handle redirect if authenticated) */}
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
