import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { cn } from '@/lib/utils'

export default function AppLayout() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        language={language}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300',
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Header */}
        <Header language={language} onLanguageChange={setLanguage} />

        {/* Page content */}
        <main className="p-6">
          <Outlet context={{ language }} />
        </main>
      </div>
    </div>
  )
}
