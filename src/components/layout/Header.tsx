import { Bell, Search, User, LogOut, Settings, Globe, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'

interface HeaderProps {
  language: 'fr' | 'en'
  onLanguageChange: (lang: 'fr' | 'en') => void
  isMobile?: boolean
  onMenuClick?: () => void
}

export default function Header({ language, onLanguageChange, isMobile, onMenuClick }: HeaderProps) {
  const { profile, company, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 md:gap-4 border-b bg-white px-4 md:px-6">
      {/* Mobile menu button */}
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={onMenuClick}>
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Language switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Globe className="h-5 w-5 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onLanguageChange('fr')}>
              <span className={language === 'fr' ? 'font-semibold' : ''}>
                🇫🇷 Français
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLanguageChange('en')}>
              <span className={language === 'en' ? 'font-semibold' : ''}>
                🇬🇧 English
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>
              {language === 'fr' ? 'Notifications' : 'Notifications'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-sm text-gray-500 text-center">
              {language === 'fr'
                ? 'Aucune nouvelle notification'
                : 'No new notifications'}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Company info */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-8 w-8 rounded object-contain"
            />
          ) : (
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">
                {company?.name?.charAt(0) || 'C'}
              </span>
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 font-poppins">
              {company?.name || 'Compagnie'}
            </p>
            <p className="text-xs text-gray-500">
              {language === 'fr' ? 'Espace compagnie' : 'Company space'}
            </p>
          </div>
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-white text-sm">
                  {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {language === 'fr' ? 'Mon compte' : 'My account'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              {language === 'fr' ? 'Profil' : 'Profile'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              {language === 'fr' ? 'Paramètres' : 'Settings'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {language === 'fr' ? 'Déconnexion' : 'Sign out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
