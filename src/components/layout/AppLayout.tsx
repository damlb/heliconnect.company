import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar language={language} />

      {/* Main content */}
      <div className="ml-64 transition-all duration-300">
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
