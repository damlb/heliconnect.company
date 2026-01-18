import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
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

  // Fetch user profile and company data
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // If user is a company user, fetch company data
      if (profileData?.role === 'company' || profileData?.role === 'superadmin') {
        // Fetch company membership
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
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id)
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserData(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setCompany(null)
          setCompanyMember(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: 'Une erreur est survenue' }
    }
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setCompany(null)
    setCompanyMember(null)
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    company,
    companyMember,
    isLoading,
    isAuthenticated: !!user && !!profile,
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
