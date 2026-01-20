import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Building2,
  User,
  Bell,
  Shield,
  Save,
  Loader2,
  Upload,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'

interface ContextType {
  language: 'fr' | 'en'
}

export default function Settings() {
  const { language } = useOutletContext<ContextType>()
  const { profile, company, refreshProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    preferred_language: 'fr',
  })

  // Company form
  const [companyForm, setCompanyForm] = useState({
    name: '',
    legal_name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address_street: '',
    address_city: '',
    address_postal_code: '',
    address_country: 'France',
    siret: '',
    vat_number: '',
    operating_license: '',
    insurance_number: '',
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_new_booking: true,
    email_booking_cancelled: true,
    email_payment_received: true,
    email_weekly_summary: true,
    push_notifications: false,
  })

  const texts = {
    fr: {
      title: 'Paramètres',
      subtitle: 'Gérez votre compte et votre compagnie',
      profile: 'Profil',
      company: 'Compagnie',
      notifications: 'Notifications',
      security: 'Sécurité',
      // Profile
      profileTitle: 'Informations personnelles',
      profileDesc: 'Mettez à jour vos informations de contact',
      fullName: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      preferredLanguage: 'Langue préférée',
      // Company
      companyTitle: 'Informations de la compagnie',
      companyDesc: 'Ces informations sont visibles par les clients',
      companyName: 'Nom commercial',
      legalName: 'Raison sociale',
      description: 'Description',
      descriptionPlaceholder: 'Présentez votre compagnie en quelques lignes...',
      website: 'Site web',
      // Address
      addressTitle: 'Adresse',
      street: 'Rue',
      city: 'Ville',
      postalCode: 'Code postal',
      country: 'Pays',
      // Legal
      legalTitle: 'Informations légales',
      siret: 'SIRET',
      vatNumber: 'N° TVA',
      operatingLicense: 'Licence d\'exploitation',
      insuranceNumber: 'N° Assurance',
      // Notifications
      notificationsTitle: 'Préférences de notification',
      notificationsDesc: 'Choisissez les notifications que vous souhaitez recevoir',
      emailNotifications: 'Notifications par email',
      newBooking: 'Nouvelle réservation',
      newBookingDesc: 'Recevez un email quand vous recevez une nouvelle réservation',
      bookingCancelled: 'Réservation annulée',
      bookingCancelledDesc: 'Recevez un email quand une réservation est annulée',
      paymentReceived: 'Paiement reçu',
      paymentReceivedDesc: 'Recevez un email quand un paiement est confirmé',
      weeklySummary: 'Résumé hebdomadaire',
      weeklySummaryDesc: 'Recevez un rapport hebdomadaire de votre activité',
      pushNotifications: 'Notifications push',
      pushNotificationsDesc: 'Activez les notifications push sur votre navigateur',
      // Security
      securityTitle: 'Sécurité du compte',
      securityDesc: 'Gérez la sécurité de votre compte',
      changePassword: 'Changer le mot de passe',
      changePasswordDesc: 'Mettez à jour votre mot de passe régulièrement pour plus de sécurité',
      twoFactor: 'Authentification à deux facteurs',
      twoFactorDesc: 'Ajoutez une couche de sécurité supplémentaire à votre compte',
      comingSoon: 'Bientôt disponible',
      // Actions
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      cancel: 'Annuler',
      saved: 'Modifications enregistrées',
    },
    en: {
      title: 'Settings',
      subtitle: 'Manage your account and company',
      profile: 'Profile',
      company: 'Company',
      notifications: 'Notifications',
      security: 'Security',
      profileTitle: 'Personal information',
      profileDesc: 'Update your contact information',
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
      preferredLanguage: 'Preferred language',
      companyTitle: 'Company information',
      companyDesc: 'This information is visible to customers',
      companyName: 'Business name',
      legalName: 'Legal name',
      description: 'Description',
      descriptionPlaceholder: 'Present your company in a few lines...',
      website: 'Website',
      addressTitle: 'Address',
      street: 'Street',
      city: 'City',
      postalCode: 'Postal code',
      country: 'Country',
      legalTitle: 'Legal information',
      siret: 'SIRET',
      vatNumber: 'VAT Number',
      operatingLicense: 'Operating license',
      insuranceNumber: 'Insurance number',
      notificationsTitle: 'Notification preferences',
      notificationsDesc: 'Choose which notifications you want to receive',
      emailNotifications: 'Email notifications',
      newBooking: 'New booking',
      newBookingDesc: 'Get an email when you receive a new booking',
      bookingCancelled: 'Booking cancelled',
      bookingCancelledDesc: 'Get an email when a booking is cancelled',
      paymentReceived: 'Payment received',
      paymentReceivedDesc: 'Get an email when a payment is confirmed',
      weeklySummary: 'Weekly summary',
      weeklySummaryDesc: 'Receive a weekly activity report',
      pushNotifications: 'Push notifications',
      pushNotificationsDesc: 'Enable push notifications in your browser',
      securityTitle: 'Account security',
      securityDesc: 'Manage your account security',
      changePassword: 'Change password',
      changePasswordDesc: 'Update your password regularly for better security',
      twoFactor: 'Two-factor authentication',
      twoFactorDesc: 'Add an extra layer of security to your account',
      comingSoon: 'Coming soon',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      saved: 'Changes saved',
    },
  }

  const t = texts[language]

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        preferred_language: profile.preferred_language || 'fr',
      })
    }
  }, [profile])

  useEffect(() => {
    if (company) {
      const address = company.address as { street?: string; city?: string; postal_code?: string; country?: string } | null
      setCompanyForm({
        name: company.name || '',
        legal_name: company.legal_name || '',
        description: company.description || '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        address_street: address?.street || '',
        address_city: address?.city || '',
        address_postal_code: address?.postal_code || '',
        address_country: address?.country || 'France',
        siret: company.siret || '',
        vat_number: company.vat_number || '',
        operating_license: company.operating_license || '',
        insurance_number: company.insurance_number || '',
      })
    }
  }, [company])

  const handleSaveProfile = async () => {
    if (!profile?.id) return
    setIsSaving(true)
    setError('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          preferred_language: profileForm.preferred_language,
        })
        .eq('id', profile.id)

      if (error) throw error

      setSuccessMessage(t.saved)
      refreshProfile?.()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCompany = async () => {
    if (!company?.id) return
    setIsSaving(true)
    setError('')

    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: companyForm.name,
          legal_name: companyForm.legal_name,
          description: companyForm.description,
          email: companyForm.email,
          phone: companyForm.phone,
          website: companyForm.website,
          address: {
            street: companyForm.address_street,
            city: companyForm.address_city,
            postal_code: companyForm.address_postal_code,
            country: companyForm.address_country,
          },
          siret: companyForm.siret,
          vat_number: companyForm.vat_number,
          operating_license: companyForm.operating_license,
          insurance_number: companyForm.insurance_number,
        })
        .eq('id', company.id)

      if (error) throw error

      setSuccessMessage(t.saved)
      refreshProfile?.()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-gray-900">
          {t.title}
        </h1>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Success/Error messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            {t.profile}
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="h-4 w-4 mr-2" />
            {t.company}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            {t.notifications}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            {t.security}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t.profileTitle}</CardTitle>
              <CardDescription>{t.profileDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {getInitials(profile?.full_name || '')}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  {t.comingSoon}
                </Button>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.fullName}</Label>
                  <Input
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.email}</Label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.phone}</Label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.preferredLanguage}</Label>
                  <Select
                    value={profileForm.preferred_language}
                    onValueChange={(v) => setProfileForm({ ...profileForm, preferred_language: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t.save}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t.companyTitle}</CardTitle>
              <CardDescription>{t.companyDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.companyName}</Label>
                  <Input
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.legalName}</Label>
                  <Input
                    value={companyForm.legal_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, legal_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.email}</Label>
                  <Input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.phone}</Label>
                  <Input
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t.website}</Label>
                  <Input
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.description}</Label>
                <Textarea
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  placeholder={t.descriptionPlaceholder}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t.addressTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t.street}</Label>
                  <Input
                    value={companyForm.address_street}
                    onChange={(e) => setCompanyForm({ ...companyForm, address_street: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.city}</Label>
                  <Input
                    value={companyForm.address_city}
                    onChange={(e) => setCompanyForm({ ...companyForm, address_city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.postalCode}</Label>
                  <Input
                    value={companyForm.address_postal_code}
                    onChange={(e) => setCompanyForm({ ...companyForm, address_postal_code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.country}</Label>
                  <Input
                    value={companyForm.address_country}
                    onChange={(e) => setCompanyForm({ ...companyForm, address_country: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t.legalTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.siret}</Label>
                  <Input
                    value={companyForm.siret}
                    onChange={(e) => setCompanyForm({ ...companyForm, siret: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.vatNumber}</Label>
                  <Input
                    value={companyForm.vat_number}
                    onChange={(e) => setCompanyForm({ ...companyForm, vat_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.operatingLicense}</Label>
                  <Input
                    value={companyForm.operating_license}
                    onChange={(e) => setCompanyForm({ ...companyForm, operating_license: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.insuranceNumber}</Label>
                  <Input
                    value={companyForm.insurance_number}
                    onChange={(e) => setCompanyForm({ ...companyForm, insurance_number: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveCompany} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t.save}
              </>
            )}
          </Button>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t.notificationsTitle}</CardTitle>
              <CardDescription>{t.notificationsDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">{t.emailNotifications}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.newBooking}</p>
                      <p className="text-sm text-gray-500">{t.newBookingDesc}</p>
                    </div>
                    <Switch
                      checked={notifications.email_new_booking}
                      onCheckedChange={(v) => setNotifications({ ...notifications, email_new_booking: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.bookingCancelled}</p>
                      <p className="text-sm text-gray-500">{t.bookingCancelledDesc}</p>
                    </div>
                    <Switch
                      checked={notifications.email_booking_cancelled}
                      onCheckedChange={(v) => setNotifications({ ...notifications, email_booking_cancelled: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.paymentReceived}</p>
                      <p className="text-sm text-gray-500">{t.paymentReceivedDesc}</p>
                    </div>
                    <Switch
                      checked={notifications.email_payment_received}
                      onCheckedChange={(v) => setNotifications({ ...notifications, email_payment_received: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.weeklySummary}</p>
                      <p className="text-sm text-gray-500">{t.weeklySummaryDesc}</p>
                    </div>
                    <Switch
                      checked={notifications.email_weekly_summary}
                      onCheckedChange={(v) => setNotifications({ ...notifications, email_weekly_summary: v })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.pushNotifications}</p>
                    <p className="text-sm text-gray-500">{t.pushNotificationsDesc}</p>
                  </div>
                  <Switch
                    checked={notifications.push_notifications}
                    onCheckedChange={(v) => setNotifications({ ...notifications, push_notifications: v })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t.securityTitle}</CardTitle>
              <CardDescription>{t.securityDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t.changePassword}</p>
                  <p className="text-sm text-gray-500">{t.changePasswordDesc}</p>
                </div>
                <Button variant="outline" disabled>
                  {t.comingSoon}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{t.twoFactor}</p>
                  <p className="text-sm text-gray-500">{t.twoFactorDesc}</p>
                </div>
                <Button variant="outline" disabled>
                  {t.comingSoon}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
