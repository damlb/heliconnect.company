import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile, Company, CompanyMember } from '@/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  company: Company | null
  companyMember: CompanyMember | null
  isLoading: boolean
  isAuthenticated: boolean
  hasCompanyAccess: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [companyMember, setCompanyMember] = useState<CompanyMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch user profile and company data
  const fetchUserData = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        return false
      }

      setProfile(profileData)

      // If user is a company user, fetch company data
      if (profileData?.role === 'company' || profileData?.role === 'superadmin') {
        const { data: memberData, error: memberError } = await supabase
          .from('company_members')
          .select('*, companies(*)')
          .eq('user_id', userId)
          .single()

        if (!memberError && memberData) {
          setCompanyMember(memberData)
          setCompany(memberData.companies as Company)
        }
      }

      return true
    } catch (error) {
      console.error('Error fetching user data:', error)
      return false
    }
  }, [])

  // Clear all auth state
  const clearAuthState = useCallback(() => {
    setUser(null)
    setSession(null)
    setProfile(null)
    setCompany(null)
    setCompanyMember(null)
  }, [])

  // Handle session change (unified handler for all auth events)
  const handleSession = useCallback(async (newSession: Session | null) => {
    if (newSession?.user) {
      setSession(newSession)
      setUser(newSession.user)
      await fetchUserData(newSession.user.id)
    } else {
      clearAuthState()
    }
    setIsLoading(false)
    setIsInitialized(true)
  }, [fetchUserData, clearAuthState])

  // Initialize auth - use onAuthStateChange as the single source of truth
  useEffect(() => {
    // Subscribe to auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // INITIAL_SESSION is fired on page load with the current session
        // SIGNED_IN is fired after successful login
        // SIGNED_OUT is fired after logout
        // TOKEN_REFRESHED is fired when token is refreshed

        if (event === 'SIGNED_OUT') {
          clearAuthState()
          setIsLoading(false)
          setIsInitialized(true)
        } else if (newSession) {
          // For all other events with a session, update state
          await handleSession(newSession)
        } else if (event === 'INITIAL_SESSION') {
          // No session on initial load = not authenticated
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [handleSession, clearAuthState])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserData(user.id)
    }
  }, [user, fetchUserData])

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setIsLoading(false)
        return { error: error.message }
      }

      // onAuthStateChange will handle the rest
      return { error: null }
    } catch (error) {
      setIsLoading(false)
      return { error: 'Une erreur est survenue' }
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    // onAuthStateChange will handle clearing the state
  }, [])

  const value: AuthContextType = {
    user,
    session,
    profile,
    company,
    companyMember,
    isLoading,
    isAuthenticated: isInitialized && !!user && !!profile,
    hasCompanyAccess: profile?.role === 'company' || profile?.role === 'superadmin',
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth
