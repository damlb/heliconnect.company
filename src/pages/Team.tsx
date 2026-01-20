import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  Mail,
  MoreVertical,
  Shield,
  ShieldCheck,
  Trash2,
  Edit,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  MessageCircle,
  Link2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { getInitials, formatDate } from '@/lib/utils'

interface TeamProps {
  language: 'fr' | 'en'
}

interface TeamMember {
  id: string
  profile_id: string
  role_in_company: 'owner' | 'admin' | 'member'
  can_publish_flights: boolean
  can_edit_flights: boolean
  can_delete_flights: boolean
  can_manage_bookings: boolean
  can_view_statistics: boolean
  can_manage_members: boolean
  can_edit_company_info: boolean
  can_view_invoices: boolean
  status: string
  job_title: string | null
  department: string | null
  joined_at: string | null
  created_at: string
  full_name: string
  email: string
  avatar_url: string | null
  phone: string | null
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  expires_at: string
  created_at: string
  personal_message: string | null
  invitation_token: string
}

const ROLE_LABELS = {
  fr: { owner: 'Propriétaire', admin: 'Administrateur', member: 'Membre' },
  en: { owner: 'Owner', admin: 'Administrator', member: 'Member' },
}

const PERMISSION_LABELS = {
  fr: {
    can_publish_flights: 'Publier des vols',
    can_edit_flights: 'Modifier des vols',
    can_delete_flights: 'Supprimer des vols',
    can_manage_bookings: 'Gérer les réservations',
    can_view_statistics: 'Voir les statistiques',
    can_manage_members: 'Gérer les membres',
    can_edit_company_info: 'Modifier les infos compagnie',
    can_view_invoices: 'Voir les factures',
  },
  en: {
    can_publish_flights: 'Publish flights',
    can_edit_flights: 'Edit flights',
    can_delete_flights: 'Delete flights',
    can_manage_bookings: 'Manage bookings',
    can_view_statistics: 'View statistics',
    can_manage_members: 'Manage members',
    can_edit_company_info: 'Edit company info',
    can_view_invoices: 'View invoices',
  },
}

export default function Team({ language }: TeamProps) {
  const { company, profile } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Multi-user settings
  const [multiUserEnabled, setMultiUserEnabled] = useState(false)
  const [maxUsers, setMaxUsers] = useState(1)
  const [isRequestingAccess, setIsRequestingAccess] = useState(false)

  // Invitation accordion
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteMessage, setInviteMessage] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  const t = {
    fr: {
      title: 'Gestion de l\'équipe',
      subtitle: 'Gérez les membres et invitez des collaborateurs',
      members: 'Membres',
      invitations: 'Invitations',
      noMembers: 'Vous êtes le seul membre',
      noInvitations: 'Aucune invitation en attente',
      role: 'Rôle',
      joinedAt: 'Membre depuis',
      email: 'Email',
      sendInvitation: 'Envoyer l\'invitation',
      cancel: 'Annuler',
      save: 'Enregistrer',
      editPermissions: 'Modifier les permissions',
      remove: 'Retirer de l\'équipe',
      resendInvitation: 'Renvoyer',
      cancelInvitation: 'Annuler',
      pending: 'En attente',
      active: 'Actif',
      expired: 'Expiré',
      personalMessage: 'Message (optionnel)',
      expiresAt: 'Expire le',
      // Multi-user section
      multiUserTitle: 'Mode multi-utilisateurs',
      multiUserDisabled: 'Le mode équipe n\'est pas encore activé',
      multiUserDescription: 'Invitez des collaborateurs pour gérer ensemble vos vols et réservations.',
      requestAccess: 'Demander l\'activation',
      requestSent: 'Demande envoyée !',
      requestDescription: 'Notre équipe va examiner votre demande et activer le mode multi-utilisateurs sous 24h.',
      // Invitation section
      inviteTitle: 'Inviter un collaborateur',
      inviteByEmail: 'Par email',
      inviteByLink: 'Par lien',
      generateLink: 'Générer un lien d\'invitation',
      copyLink: 'Copier le lien',
      linkCopied: 'Lien copié !',
      shareWhatsApp: 'Partager sur WhatsApp',
      linkValid: 'Ce lien est valide 7 jours',
      orShareLink: 'Ou partagez ce lien :',
      invitationSent: 'Invitation envoyée !',
      maxUsersReached: 'Limite atteinte',
      maxUsersDescription: 'Vous avez atteint la limite de {max} utilisateurs.',
    },
    en: {
      title: 'Team Management',
      subtitle: 'Manage members and invite collaborators',
      members: 'Members',
      invitations: 'Invitations',
      noMembers: 'You are the only member',
      noInvitations: 'No pending invitations',
      role: 'Role',
      joinedAt: 'Member since',
      email: 'Email',
      sendInvitation: 'Send Invitation',
      cancel: 'Cancel',
      save: 'Save',
      editPermissions: 'Edit Permissions',
      remove: 'Remove from team',
      resendInvitation: 'Resend',
      cancelInvitation: 'Cancel',
      pending: 'Pending',
      active: 'Active',
      expired: 'Expired',
      personalMessage: 'Message (optional)',
      expiresAt: 'Expires on',
      multiUserTitle: 'Multi-user mode',
      multiUserDisabled: 'Team mode is not yet enabled',
      multiUserDescription: 'Invite collaborators to manage flights and bookings together.',
      requestAccess: 'Request activation',
      requestSent: 'Request sent!',
      requestDescription: 'Our team will review your request and enable multi-user mode within 24h.',
      inviteTitle: 'Invite a collaborator',
      inviteByEmail: 'By email',
      inviteByLink: 'By link',
      generateLink: 'Generate invitation link',
      copyLink: 'Copy link',
      linkCopied: 'Link copied!',
      shareWhatsApp: 'Share on WhatsApp',
      linkValid: 'This link is valid for 7 days',
      orShareLink: 'Or share this link:',
      invitationSent: 'Invitation sent!',
      maxUsersReached: 'Limit reached',
      maxUsersDescription: 'You have reached the limit of {max} users.',
    },
  }[language]

  useEffect(() => {
    if (company?.id) {
      fetchTeamData()
    }
  }, [company?.id])

  const fetchTeamData = async () => {
    if (!company?.id) return
    setIsLoading(true)
    try {
      // Get company settings
      const { data: companyData } = await supabase
        .from('companies')
        .select('multi_user_enabled, max_users')
        .eq('id', company.id)
        .single()

      if (companyData) {
        setMultiUserEnabled(companyData.multi_user_enabled || false)
        setMaxUsers(companyData.max_users || 1)
      }

      // Get team members
      const { data: membersData } = await supabase
        .from('company_members_view')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: true })

      setMembers(membersData || [])

      // Get pending invitations
      const { data: invitationsData } = await supabase
        .from('member_invitations')
        .select('*')
        .eq('company_id', company.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      setInvitations(invitationsData || [])
    } catch (err) {
      console.error('Error fetching team data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestMultiUser = async () => {
    if (!company?.id || !profile?.id) return
    setIsRequestingAccess(true)

    try {
      // Create a support ticket or notification for admin
      // For now, we'll just show a success message
      // In production, this would create a ticket in the support system

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setSuccessMessage(t.requestSent)
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err) {
      console.error('Error requesting access:', err)
    } finally {
      setIsRequestingAccess(false)
    }
  }

  const handleSendInvitation = async () => {
    if (!inviteEmail || !company?.id || !profile?.id) return
    setIsSending(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('member_invitations')
        .insert({
          invitation_type: 'company',
          company_id: company.id,
          email: inviteEmail,
          role: inviteRole,
          invited_by: profile.id,
          personal_message: inviteMessage || null,
          default_permissions: getDefaultPermissions(inviteRole),
        })
        .select('invitation_token')
        .single()

      if (error) throw error

      // Generate the invitation link
      const baseUrl = window.location.origin
      const link = `${baseUrl}/join?token=${data.invitation_token}`
      setGeneratedLink(link)

      // TODO: Send email via Brevo

      setSuccessMessage(t.invitationSent)
      setInviteEmail('')
      setInviteMessage('')
      fetchTeamData()

      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi')
    } finally {
      setIsSending(false)
    }
  }

  const handleGenerateLink = async () => {
    if (!company?.id || !profile?.id) return
    setIsSending(true)

    try {
      const { data, error } = await supabase
        .from('member_invitations')
        .insert({
          invitation_type: 'company',
          company_id: company.id,
          email: 'pending@heliconnect.fr', // Placeholder for link-based invitations
          role: inviteRole,
          invited_by: profile.id,
          default_permissions: getDefaultPermissions(inviteRole),
        })
        .select('invitation_token')
        .single()

      if (error) throw error

      const baseUrl = window.location.origin
      setGeneratedLink(`${baseUrl}/join?token=${data.invitation_token}`)
      fetchTeamData()
    } catch (err: any) {
      setError(err.message || 'Erreur')
    } finally {
      setIsSending(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      language === 'fr'
        ? `Je vous invite à rejoindre notre équipe sur HeliConnect ! Cliquez sur ce lien : ${generatedLink}`
        : `I invite you to join our team on HeliConnect! Click this link: ${generatedLink}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await supabase
        .from('member_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId)
      fetchTeamData()
    } catch (err) {
      console.error('Error cancelling invitation:', err)
    }
  }

  const getDefaultPermissions = (role: string) => {
    if (role === 'admin') {
      return {
        can_publish_flights: true,
        can_edit_flights: true,
        can_delete_flights: true,
        can_manage_bookings: true,
        can_view_statistics: true,
        can_manage_members: true,
        can_edit_company_info: true,
        can_view_invoices: true,
      }
    }
    return {
      can_publish_flights: false,
      can_edit_flights: false,
      can_delete_flights: false,
      can_manage_bookings: false,
      can_view_statistics: true,
      can_manage_members: false,
      can_edit_company_info: false,
      can_view_invoices: false,
    }
  }

  const getRoleBadge = (role: string) => {
    const labels = ROLE_LABELS[language]
    switch (role) {
      case 'owner':
        return (
          <Badge className="bg-gradient-to-r from-gold to-gold-dark text-primary">
            <ShieldCheck className="mr-1 h-3 w-3" />
            {labels.owner}
          </Badge>
        )
      case 'admin':
        return (
          <Badge className="bg-primary">
            <Shield className="mr-1 h-3 w-3" />
            {labels.admin}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Users className="mr-1 h-3 w-3" />
            {labels.member}
          </Badge>
        )
    }
  }

  const canInvite = members.length < maxUsers

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">{t.title}</h1>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Multi-user not enabled - Request access */}
      {!multiUserEnabled && (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {t.multiUserTitle}
                </h3>
                <p className="text-gray-600 mb-1">{t.multiUserDisabled}</p>
                <p className="text-sm text-gray-500">{t.multiUserDescription}</p>
              </div>
              <Button
                onClick={handleRequestMultiUser}
                disabled={isRequestingAccess}
                className="bg-gradient-to-r from-gold to-gold-dark text-primary font-semibold"
              >
                {isRequestingAccess ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {t.requestAccess}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multi-user enabled */}
      {multiUserEnabled && (
        <>
          {/* Invite section - Collapsible */}
          <Collapsible open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <UserPlus className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{t.inviteTitle}</CardTitle>
                        <CardDescription>
                          {canInvite
                            ? `${members.length}/${maxUsers} ${language === 'fr' ? 'membres' : 'members'}`
                            : t.maxUsersReached}
                        </CardDescription>
                      </div>
                    </div>
                    {isInviteOpen ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {!canInvite ? (
                    <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-amber-600" />
                        <p className="text-amber-800">
                          {t.maxUsersDescription.replace('{max}', String(maxUsers))}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Tabs defaultValue="email" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="email">
                          <Mail className="mr-2 h-4 w-4" />
                          {t.inviteByEmail}
                        </TabsTrigger>
                        <TabsTrigger value="link">
                          <Link2 className="mr-2 h-4 w-4" />
                          {t.inviteByLink}
                        </TabsTrigger>
                      </TabsList>

                      {/* Email invitation */}
                      <TabsContent value="email" className="space-y-4">
                        {error && (
                          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                          </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="email">{t.email} *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="collaborateur@exemple.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">{t.role}</Label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">{ROLE_LABELS[language].admin}</SelectItem>
                                <SelectItem value="member">{ROLE_LABELS[language].member}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">{t.personalMessage}</Label>
                          <Input
                            id="message"
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                            placeholder={language === 'fr' ? 'Bienvenue dans notre équipe !' : 'Welcome to our team!'}
                          />
                        </div>

                        <Button
                          onClick={handleSendInvitation}
                          disabled={isSending || !inviteEmail}
                          className="w-full sm:w-auto"
                        >
                          {isSending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          {t.sendInvitation}
                        </Button>

                        {generatedLink && (
                          <div className="mt-4 p-4 rounded-lg bg-gray-50 border">
                            <p className="text-sm text-gray-600 mb-2">{t.orShareLink}</p>
                            <div className="flex gap-2">
                              <Input value={generatedLink} readOnly className="flex-1 bg-white" />
                              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                                {linkCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                              </Button>
                              <Button variant="outline" size="icon" onClick={handleShareWhatsApp} className="text-green-600">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Link invitation */}
                      <TabsContent value="link" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="linkRole">{t.role}</Label>
                          <Select value={inviteRole} onValueChange={setInviteRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">{ROLE_LABELS[language].admin}</SelectItem>
                              <SelectItem value="member">{ROLE_LABELS[language].member}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {!generatedLink ? (
                          <Button onClick={handleGenerateLink} disabled={isSending}>
                            {isSending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Link2 className="mr-2 h-4 w-4" />
                            )}
                            {t.generateLink}
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input value={generatedLink} readOnly className="flex-1 bg-gray-50" />
                              <Button variant="outline" onClick={handleCopyLink}>
                                {linkCopied ? (
                                  <>
                                    <Check className="mr-2 h-4 w-4 text-green-600" />
                                    {t.linkCopied}
                                  </>
                                ) : (
                                  <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    {t.copyLink}
                                  </>
                                )}
                              </Button>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={handleShareWhatsApp}
                                className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                {t.shareWhatsApp}
                              </Button>
                            </div>

                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {t.linkValid}
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Members list */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t.members} ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-center text-gray-500 py-8">{t.noMembers}</p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-white text-sm">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">{member.full_name}</p>
                            {getRoleBadge(member.role_in_company)}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{member.email}</p>
                        </div>
                      </div>

                      {member.role_in_company !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMember(member)
                                setIsPermissionModalOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {t.editPermissions}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t.remove}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending invitations */}
          {invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {t.invitations} ({invitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-amber-50 border-amber-200 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 flex-shrink-0">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{invitation.email}</p>
                          <p className="text-sm text-gray-500">
                            {t.expiresAt} {formatDate(invitation.expires_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-auto sm:ml-0">
                        {getRoleBadge(invitation.role)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <XCircle className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">{t.cancelInvitation}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Permissions Modal */}
      <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.editPermissions}</DialogTitle>
            {selectedMember && (
              <DialogDescription>{selectedMember.full_name}</DialogDescription>
            )}
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-4">
              {Object.entries(PERMISSION_LABELS[language]).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key}>{label}</Label>
                  <Switch
                    id={key}
                    checked={selectedMember[key as keyof TeamMember] as boolean}
                    disabled={selectedMember.role_in_company === 'owner'}
                  />
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={() => setIsPermissionModalOpen(false)}>
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
