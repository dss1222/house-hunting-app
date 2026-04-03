import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { MobileLayout } from './components/layout/MobileLayout'
import { LoginPage } from './components/auth/LoginPage'
import { ListView } from './components/list/ListView'
import { CompareView } from './components/compare/CompareView'
import { MapView } from './components/map/MapView'
import { PropertyForm } from './components/property/PropertyForm'
import { PropertyDetail } from './components/property/PropertyDetail'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-text-secondary">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <MobileLayout>
      <Routes>
        <Route path="/" element={<ListView />} />
        <Route path="/compare" element={<CompareView />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/property/new" element={<PropertyForm />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/property/:id/edit" element={<PropertyForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MobileLayout>
  )
}

export default function App() {
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
