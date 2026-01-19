import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Flights from '@/pages/Flights'
import Team from '@/pages/Team'
import JoinInvitation from '@/pages/JoinInvitation'
import './index.css'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasCompanyAccess } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasCompanyAccess) {
    // Redirect non-company users to the main site
    window.location.href = 'https://heliconnect.fr'
    return null
  }

  return <>{children}</>
}

// Public route wrapper (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasCompanyAccess } = useAuth()

  // Ne pas attendre le loading pour afficher la page login
  // Si l'utilisateur est déjà authentifié, on le redirige
  if (!isLoading && isAuthenticated && hasCompanyAccess) {
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
        {/* TODO: Add more routes */}
        <Route path="marketplace" element={<ComingSoon title="Marketplace" />} />
        <Route path="bookings" element={<ComingSoon title="Réservations" />} />
        <Route path="fleet" element={<ComingSoon title="Ma flotte" />} />
        <Route path="statistics" element={<ComingSoon title="Statistiques" />} />
        <Route path="documents" element={<ComingSoon title="Documents" />} />
        <Route path="team" element={<Team language="fr" />} />
        <Route path="support" element={<ComingSoon title="Support" />} />
        <Route path="settings" element={<ComingSoon title="Paramètres" />} />
      </Route>

      {/* Catch all - redirect to login (ProtectedRoute will handle redirect if authenticated) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

// Placeholder component for pages not yet implemented
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <h1 className="text-2xl font-display font-semibold text-gray-900 mb-2">
        {title}
      </h1>
      <p className="text-gray-500">Cette page est en cours de développement</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
