import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SIDEBAR_ITEMS } from '@/lib/constants'
import {
  LayoutDashboard,
  Plane,
  ShoppingBag,
  CalendarCheck,
  BarChart3,
  FileText,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react'

// Helicopter icon component (custom since lucide doesn't have one)
const Helicopter = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 9V4m0 0H4m8 0h8M7 9h10v3a5 5 0 0 1-10 0V9Zm3 8h4m-2-2v2" />
  </svg>
)

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Plane,
  ShoppingBag,
  CalendarCheck,
  Helicopter,
  BarChart3,
  FileText,
  Users,
  HelpCircle,
  Settings,
}

interface SidebarProps {
  language: 'fr' | 'en'
  isCollapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ language, isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <img
              src="/images/logo-icon.svg"
              alt="HeliConnect"
              className="h-8 w-8"
            />
            <span className="font-poppins font-bold text-primary">
              HeliConnect
            </span>
          </div>
        )}
        {isCollapsed && (
          <img
            src="/images/logo-icon.svg"
            alt="HeliConnect"
            className="h-8 w-8 mx-auto"
          />
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = location.pathname === item.path
            const label = language === 'fr' ? item.label : item.labelEn

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-primary',
                    isCollapsed && 'justify-center px-2'
                  )}
                  title={isCollapsed ? label : undefined}
                >
                  {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{label}</span>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-400">
            © 2025 HeliConnect
          </div>
        </div>
      )}
    </aside>
  )
}
