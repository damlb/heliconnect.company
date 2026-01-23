import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  MapPin,
  Calendar,
  Euro,
  Users,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { BOOKING_STATUS_OPTIONS } from '@/lib/constants'
import { formatDate, formatDateTime, formatPrice } from '@/lib/utils'

interface ContextType {
  language: 'fr' | 'en'
}

interface BookingWithDetails {
  id: string
  booking_reference: string
  status: string
  total_price: number
  seats_booked: number
  contact_name: string
  contact_email: string
  contact_phone: string | null
  special_requests: string | null
  created_at: string
  flights?: {
    id: string
    departure_city: string
    arrival_city: string
    departure_datetime: string
    price_per_seat: number | null
    total_price: number | null
  }
}

export default function Bookings() {
  const { language } = useOutletContext<ContextType>()
  const { company } = useAuth()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  const texts = {
    fr: {
      title: 'Réservations',
      subtitle: 'Gérez les réservations de vos vols',
      pending: 'En attente',
      confirmed: 'Confirmées',
      all: 'Toutes',
      search: 'Rechercher par référence, nom...',
      allStatus: 'Tous les statuts',
      noBookings: 'Aucune réservation',
      noBookingsDesc: 'Vous n\'avez pas encore reçu de réservation',
      reference: 'Référence',
      client: 'Client',
      flight: 'Vol',
      amount: 'Montant',
      status: 'Statut',
      actions: 'Actions',
      viewDetails: 'Voir les détails',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      bookingDetails: 'Détails de la réservation',
      flightInfo: 'Informations du vol',
      clientInfo: 'Informations client',
      paymentInfo: 'Paiement',
      passengers: 'passager(s)',
      bookedOn: 'Réservé le',
      specialRequests: 'Demandes spéciales',
      close: 'Fermer',
      confirmBooking: 'Confirmer la réservation',
      cancelBooking: 'Annuler la réservation',
      export: 'Exporter',
    },
    en: {
      title: 'Bookings',
      subtitle: 'Manage your flight bookings',
      pending: 'Pending',
      confirmed: 'Confirmed',
      all: 'All',
      search: 'Search by reference, name...',
      allStatus: 'All statuses',
      noBookings: 'No bookings',
      noBookingsDesc: 'You haven\'t received any bookings yet',
      reference: 'Reference',
      client: 'Client',
      flight: 'Flight',
      amount: 'Amount',
      status: 'Status',
      actions: 'Actions',
      viewDetails: 'View details',
      confirm: 'Confirm',
      cancel: 'Cancel',
      bookingDetails: 'Booking details',
      flightInfo: 'Flight information',
      clientInfo: 'Client information',
      paymentInfo: 'Payment',
      passengers: 'passenger(s)',
      bookedOn: 'Booked on',
      specialRequests: 'Special requests',
      close: 'Close',
      confirmBooking: 'Confirm booking',
      cancelBooking: 'Cancel booking',
      export: 'Export',
    },
  }

  const t = texts[language]

  useEffect(() => {
    if (company?.id) {
      fetchBookings()
    } else {
      setIsLoading(false)
    }
  }, [company?.id])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter, activeTab])

  const fetchBookings = async () => {
    if (!company?.id) return
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          flights!inner (
            id,
            departure_city,
            arrival_city,
            departure_datetime,
            price_per_seat,
            total_price
          )
        `)
        .eq('flights.company_id', company.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Tab filter
    if (activeTab === 'pending') {
      filtered = filtered.filter((b) => b.status === 'pending')
    } else if (activeTab === 'confirmed') {
      filtered = filtered.filter((b) => ['confirmed', 'paid'].includes(b.status))
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.booking_reference?.toLowerCase().includes(search) ||
          b.contact_name?.toLowerCase().includes(search) ||
          b.contact_email?.toLowerCase().includes(search) ||
          b.flights?.departure_city?.toLowerCase().includes(search) ||
          b.flights?.arrival_city?.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error
      fetchBookings()
      setIsDetailModalOpen(false)
    } catch (error) {
      console.error('Error updating booking:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; labelEn: string }> = {
      pending: { variant: 'outline', label: 'En attente', labelEn: 'Pending' },
      confirmed: { variant: 'default', label: 'Confirmé', labelEn: 'Confirmed' },
      paid: { variant: 'default', label: 'Payé', labelEn: 'Paid' },
      cancelled: { variant: 'destructive', label: 'Annulé', labelEn: 'Cancelled' },
      completed: { variant: 'secondary', label: 'Terminé', labelEn: 'Completed' },
      refunded: { variant: 'secondary', label: 'Remboursé', labelEn: 'Refunded' },
    }

    const config = statusConfig[status] || { variant: 'outline' as const, label: status, labelEn: status }

    return (
      <Badge variant={config.variant}>
        {language === 'fr' ? config.label : config.labelEn}
      </Badge>
    )
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const confirmedCount = bookings.filter((b) => ['confirmed', 'paid'].includes(b.status)).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-900">
            {t.title}
          </h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t.export}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.pending}</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.confirmed}</p>
                <p className="text-2xl font-bold">{confirmedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <CalendarCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.all}</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="pending">
              {t.pending} ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              {t.confirmed} ({confirmedCount})
            </TabsTrigger>
            <TabsTrigger value="all">
              {t.all} ({bookings.length})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t.allStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatus}</SelectItem>
                {BOOKING_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {language === 'fr' ? option.label : option.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarCheck className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">{t.noBookings}</p>
                <p className="text-gray-400 text-sm mt-1">{t.noBookingsDesc}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t.reference}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t.client}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t.flight}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t.amount}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t.status}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <CalendarCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div className="ml-3">
                              <div className="font-medium text-gray-900">
                                {booking.booking_reference}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(booking.created_at)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="font-medium text-gray-900">
                            {booking.contact_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.seats_booked} {t.passengers}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{booking.flights?.departure_city}</span>
                            <span className="text-gray-400">→</span>
                            <span>{booking.flights?.arrival_city}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {booking.flights?.departure_datetime
                              ? formatDate(booking.flights.departure_datetime)
                              : '-'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="font-semibold text-gray-900">
                            {formatPrice(booking.total_price)}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setIsDetailModalOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.bookingDetails}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Status and Reference */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-500">{t.reference}</Label>
                  <p className="font-mono font-semibold text-lg">{selectedBooking.booking_reference}</p>
                </div>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Flight Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t.flightInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">{language === 'fr' ? 'Trajet' : 'Route'}</Label>
                      <p className="font-semibold">
                        {selectedBooking.flights?.departure_city} → {selectedBooking.flights?.arrival_city}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">{language === 'fr' ? 'Date' : 'Date'}</Label>
                      <p className="font-semibold">
                        {selectedBooking.flights?.departure_datetime
                          ? formatDateTime(selectedBooking.flights.departure_datetime)
                          : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t.clientInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">{language === 'fr' ? 'Nom' : 'Name'}</Label>
                      <p className="font-semibold">{selectedBooking.contact_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">{t.passengers}</Label>
                      <p className="font-semibold">{selectedBooking.seats_booked}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.contact_email}</span>
                    </div>
                    {selectedBooking.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedBooking.contact_phone}</span>
                      </div>
                    )}
                  </div>
                  {selectedBooking.special_requests && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <Label className="text-gray-500">{t.specialRequests}</Label>
                      <p className="text-sm mt-1">{selectedBooking.special_requests}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    {t.paymentInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">{t.amount}</Label>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(selectedBooking.total_price)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">{t.bookedOn}</Label>
                      <p className="font-semibold">
                        {formatDateTime(selectedBooking.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedBooking?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => selectedBooking && updateBookingStatus(selectedBooking.id, 'cancelled')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t.cancelBooking}
                </Button>
                <Button
                  onClick={() => selectedBooking && updateBookingStatus(selectedBooking.id, 'confirmed')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t.confirmBooking}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
