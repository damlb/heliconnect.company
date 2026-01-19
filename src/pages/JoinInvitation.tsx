import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

interface InvitationData {
  id: string
  email: string
  role: string
  status: string
  expires_at: string
  personal_message: string | null
  default_permissions: Record<string, boolean>
  company?: {
    id: string
    name: string
    logo_url: string | null
  }
  invitedBy?: {
    full_name: string
    email: string
  }
}

export default function JoinInvitation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenError, setTokenError] = useState<'invalid' | 'expired' | 'used' | null>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (token) {
      validateToken(token)
    } else {
      setTokenError('invalid')
      setIsLoading(false)
    }
  }, [token])

  const validateToken = async (invitationToken: string) => {
    setIsLoading(true)
    try {
      // Fetch invitation with company and inviter info
      const { data, error } = await supabase
        .from('member_invitations')
        .select(`
          id,
          email,
          role,
          status,
          expires_at,
          personal_message,
          default_permissions,
          company:companies!member_invitations_company_id_fkey (
            id,
            name,
            logo_url
          ),
          invitedBy:profiles!member_invitations_invited_by_fkey (
            full_name,
            email
          )
        `)
        .eq('invitation_token', invitationToken)
        .single()

      if (error || !data) {
        setTokenError('invalid')
        return
      }

      // Check status
      if (data.status !== 'pending') {
        setTokenError('used')
        return
      }

      // Check expiration
      if (new Date(data.expires_at) < new Date()) {
        setTokenError('expired')
        return
      }

      setInvitation({
        ...data,
        company: data.company as InvitationData['company'],
        invitedBy: data.invitedBy as InvitationData['invitedBy'],
      })
    } catch (err) {
      console.error('Error validating token:', err)
      setTokenError('invalid')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitation) return

    // Validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erreur lors de la création du compte')

      // 2. Wait a bit for the trigger to create the profile
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 3. Update profile with company link
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          company_id: invitation.company?.id,
          role: 'company',
        })
        .eq('id', authData.user.id)

      if (profileError) throw profileError

      // 4. Create company_member entry
      const { error: memberError } = await supabase.from('company_members').insert({
        company_id: invitation.company?.id,
        profile_id: authData.user.id,
        role_in_company: invitation.role,
        ...invitation.default_permissions,
        status: 'active',
        joined_at: new Date().toISOString(),
      })

      if (memberError) throw memberError

      // 5. Update invitation status
      const { error: invitationError } = await supabase
        .from('member_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id)

      if (invitationError) throw invitationError

      setSuccess(true)

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      console.error('Error joining:', err)
      setError(err.message || 'Erreur lors de la création du compte')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1D51] via-[#1a365d] to-[#2d4a7c]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1D51] via-[#1a365d] to-[#2d4a7c] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">
              {tokenError === 'invalid' && 'Invitation invalide'}
              {tokenError === 'expired' && 'Invitation expirée'}
              {tokenError === 'used' && 'Invitation déjà utilisée'}
            </CardTitle>
            <CardDescription>
              {tokenError === 'invalid' &&
                "Ce lien d'invitation n'est pas valide. Veuillez demander un nouveau lien."}
              {tokenError === 'expired' &&
                "Ce lien d'invitation a expiré. Veuillez demander un nouveau lien."}
              {tokenError === 'used' &&
                "Cette invitation a déjà été utilisée. Si vous avez déjà un compte, connectez-vous."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Aller à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1D51] via-[#1a365d] to-[#2d4a7c] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Compte créé avec succès !</CardTitle>
            <CardDescription>
              Vous avez rejoint l'équipe de {invitation?.company?.name}. Vous allez être
              redirigé vers la page de connexion...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1D51] via-[#1a365d] to-[#2d4a7c] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          {/* Company logo/info */}
          <div className="mb-4 flex flex-col items-center">
            {invitation?.company?.logo_url ? (
              <img
                src={invitation.company.logo_url}
                alt={invitation.company.name}
                className="h-16 w-16 rounded-lg object-contain mb-2"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 mb-2">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            )}
            <p className="text-sm text-gray-500">Vous êtes invité à rejoindre</p>
            <h2 className="text-xl font-bold text-primary font-poppins">
              {invitation?.company?.name}
            </h2>
          </div>

          <CardTitle>Créer votre compte</CardTitle>
          <CardDescription>
            {invitation?.invitedBy?.full_name} vous a invité à rejoindre l'équipe en tant
            que{' '}
            <span className="font-semibold">
              {invitation?.role === 'admin' ? 'Administrateur' : 'Membre'}
            </span>
          </CardDescription>

          {invitation?.personal_message && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              "{invitation.personal_message}"
            </div>
          )}
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={invitation?.email || ''}
                  disabled
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>

            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jean Dupont"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Minimum 8 caractères</p>
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#D4AF64] to-[#C99846] text-[#0B1D51] font-semibold hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création du compte...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Rejoindre l'équipe
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Vous avez déjà un compte ?{' '}
              <a href="/login" className="text-primary hover:underline font-medium">
                Connectez-vous
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
