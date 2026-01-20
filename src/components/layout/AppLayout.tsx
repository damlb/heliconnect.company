import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { cn } from '@/lib/utils'

export default function AppLayout() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsMobileSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen)
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        language={language}
        isCollapsed={isSidebarCollapsed}
        isMobile={isMobile}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggle={handleToggleSidebar}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300',
          isMobile ? 'ml-0' : (isSidebarCollapsed ? 'ml-16' : 'ml-64')
        )}
      >
        {/* Header */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          isMobile={isMobile}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet context={{ language }} />
        </main>
      </div>
    </div>
  )
}
