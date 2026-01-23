import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Store,
  Search,
  MapPin,
  Calendar,
  Users,
  Plane,
  Clock,
  ChevronRight,
  Send,
  MessageSquare,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface ContextType {
  language: 'fr' | 'en'
}

interface MarketplaceFlight {
  id: string
  company_id: string
  departure_city: string
  arrival_city: string
  departure_datetime: string
  available_seats: number
  booked_seats: number
  price_per_seat: number
  aircraft_type: string
  status: string
  company?: {
    name: string
    logo_url: string | null
    rating?: number
    verified?: boolean
  }
}

interface PartnerRequest {
  id: string
  from_company_id: string
  to_company_id: string
  flight_id: string
  seats_requested: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  from_company?: {
    name: string
    logo_url: string | null
  }
  flight?: MarketplaceFlight
}

const CITIES = [
  'Paris', 'Monaco', 'Nice', 'Cannes', 'Saint-Tropez', 'Courchevel',
  'Megève', 'Chamonix', 'Lyon', 'Marseille', 'Bordeaux', 'Genève',
]

export default function Marketplace() {
  const { language } = useOutletContext<ContextType>()
  const { company } = useAuth()
  const [activeTab, setActiveTab] = useState('browse')
  const [isLoading, setIsLoading] = useState(true)
  const [flights, setFlights] = useState<MarketplaceFlight[]>([])
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>([])
  const [myRequests, setMyRequests] = useState<PartnerRequest[]>([])
  const [selectedFlight, setSelectedFlight] = useState<MarketplaceFlight | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [departureFilter, setDepartureFilter] = useState<string>('all')
  const [arrivalFilter, setArrivalFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')

  // Request form
  const [requestSeats, setRequestSeats] = useState(1)
  const [requestMessage, setRequestMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const texts = {
    fr: {
      title: 'Marketplace',
      subtitle: 'Trouvez des places disponibles ou partagez vos vols',
      browse: 'Parcourir',
      received: 'Demandes reçues',
      sent: 'Mes demandes',
      searchPlaceholder: 'Rechercher une destination...',
      departure: 'Départ',
      arrival: 'Arrivée',
      date: 'Date',
      allCities: 'Toutes les villes',
      availableSeats: 'places disponibles',
      perSeat: '/place',
      viewDetails: 'Voir détails',
      requestSeats: 'Demander des places',
      noFlights: 'Aucun vol disponible',
      noFlightsDesc: 'Il n\'y a pas de vols correspondant à vos critères',
      noRequests: 'Aucune demande',
      noRequestsDesc: 'Vous n\'avez pas encore de demandes',
      flightDetails: 'Détails du vol',
      companyInfo: 'Informations compagnie',
      verified: 'Vérifié',
      rating: 'Note',
      flightInfo: 'Informations vol',
      departureTime: 'Heure de départ',
      aircraft: 'Appareil',
      capacity: 'Capacité',
      pricePerSeat: 'Prix par place',
      sendRequest: 'Envoyer la demande',
      seatsToRequest: 'Nombre de places',
      message: 'Message (optionnel)',
      messagePlaceholder: 'Présentez-vous et expliquez votre demande...',
      requestSent: 'Demande envoyée',
      requestSentDesc: 'Votre demande a été envoyée à la compagnie',
      pending: 'En attente',
      accepted: 'Acceptée',
      rejected: 'Refusée',
      accept: 'Accepter',
      reject: 'Refuser',
      seats: 'places',
      from: 'De',
      requestedOn: 'Demandé le',
      passengers: 'passagers',
      contact: 'Contact',
      respondToRequest: 'Répondre à la demande',
    },
    en: {
      title: 'Marketplace',
      subtitle: 'Find available seats or share your flights',
      browse: 'Browse',
      received: 'Received requests',
      sent: 'My requests',
      searchPlaceholder: 'Search a destination...',
      departure: 'Departure',
      arrival: 'Arrival',
      date: 'Date',
      allCities: 'All cities',
      availableSeats: 'available seats',
      perSeat: '/seat',
      viewDetails: 'View details',
      requestSeats: 'Request seats',
      noFlights: 'No flights available',
      noFlightsDesc: 'There are no flights matching your criteria',
      noRequests: 'No requests',
      noRequestsDesc: 'You don\'t have any requests yet',
      flightDetails: 'Flight details',
      companyInfo: 'Company information',
      verified: 'Verified',
      rating: 'Rating',
      flightInfo: 'Flight information',
      departureTime: 'Departure time',
      aircraft: 'Aircraft',
      capacity: 'Capacity',
      pricePerSeat: 'Price per seat',
      sendRequest: 'Send request',
      seatsToRequest: 'Number of seats',
      message: 'Message (optional)',
      messagePlaceholder: 'Introduce yourself and explain your request...',
      requestSent: 'Request sent',
      requestSentDesc: 'Your request has been sent to the company',
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      accept: 'Accept',
      reject: 'Reject',
      seats: 'seats',
      from: 'From',
      requestedOn: 'Requested on',
      passengers: 'passengers',
      contact: 'Contact',
      respondToRequest: 'Respond to request',
    },
  }

  const t = texts[language]

  useEffect(() => {
    if (company?.id) {
      fetchMarketplaceData()
    } else {
      setIsLoading(false)
    }
  }, [company?.id, activeTab])

  const fetchMarketplaceData = async () => {
    if (!company?.id) return
    setIsLoading(true)

    try {
      if (activeTab === 'browse') {
        // Fetch available flights from other companies
        const { data: flightsData } = await supabase
          .from('flights')
          .select(`
            *,
            companies (
              name,
              logo_url
            )
          `)
          .neq('company_id', company.id)
          .eq('status', 'scheduled')
          .gt('available_seats', 0)
          .gte('departure_datetime', new Date().toISOString())
          .order('departure_datetime', { ascending: true })

        const formattedFlights = flightsData?.map((f: any) => ({
          ...f,
          company: f.companies,
        })) || []

        setFlights(formattedFlights)
      } else if (activeTab === 'received') {
        // Fetch requests received for my flights
        const { data: requestsData } = await supabase
          .from('partner_requests')
          .select(`
            *,
            from_company:companies!partner_requests_from_company_id_fkey (
              name,
              logo_url
            ),
            flight:flights (
              *
            )
          `)
          .eq('to_company_id', company.id)
          .order('created_at', { ascending: false })

        setPartnerRequests(requestsData || [])
      } else if (activeTab === 'sent') {
        // Fetch my sent requests
        const { data: requestsData } = await supabase
          .from('partner_requests')
          .select(`
            *,
            to_company:companies!partner_requests_to_company_id_fkey (
              name,
              logo_url
            ),
            flight:flights (
              *,
              companies (
                name,
                logo_url
              )
            )
          `)
          .eq('from_company_id', company.id)
          .order('created_at', { ascending: false })

        setMyRequests(requestsData || [])
      }
    } catch (error) {
      console.error('Error fetching marketplace data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredFlights = flights.filter((flight) => {
    const matchesSearch =
      searchQuery === '' ||
      flight.departure_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flight.arrival_city.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDeparture =
      departureFilter === 'all' || flight.departure_city === departureFilter

    const matchesArrival =
      arrivalFilter === 'all' || flight.arrival_city === arrivalFilter

    const matchesDate =
      dateFilter === '' ||
      new Date(flight.departure_datetime).toDateString() ===
        new Date(dateFilter).toDateString()

    return matchesSearch && matchesDeparture && matchesArrival && matchesDate
  })

  const handleSendRequest = async () => {
    if (!selectedFlight || !company?.id) return
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('partner_requests').insert({
        from_company_id: company.id,
        to_company_id: selectedFlight.company_id,
        flight_id: selectedFlight.id,
        seats_requested: requestSeats,
        message: requestMessage,
        status: 'pending',
      })

      if (error) throw error

      setShowRequestModal(false)
      setRequestSeats(1)
      setRequestMessage('')
      setSelectedFlight(null)
      // Show success toast would go here
    } catch (error) {
      console.error('Error sending request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('partner_requests')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId)

      if (error) throw error

      fetchMarketplaceData()
    } catch (error) {
      console.error('Error responding to request:', error)
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      time: date.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      pending: { variant: 'secondary', label: t.pending },
      accepted: { variant: 'default', label: t.accepted },
      rejected: { variant: 'destructive', label: t.rejected },
    }
    const config = variants[status] || variants.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

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
      <div>
        <h1 className="text-2xl font-display font-semibold text-gray-900">
          {t.title}
        </h1>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            {t.browse}
          </TabsTrigger>
          <TabsTrigger value="received" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t.received}
            {partnerRequests.filter((r) => r.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {partnerRequests.filter((r) => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {t.sent}
          </TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="mt-6 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={departureFilter} onValueChange={setDepartureFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.departure} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCities}</SelectItem>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={arrivalFilter} onValueChange={setArrivalFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.arrival} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCities}</SelectItem>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Flights Grid */}
          {filteredFlights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlights.map((flight) => {
                const { date, time } = formatDateTime(flight.departure_datetime)
                const availableSeats = flight.available_seats - flight.booked_seats

                return (
                  <Card
                    key={flight.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedFlight(flight)
                      setShowDetailModal(true)
                    }}
                  >
                    <CardContent className="p-4">
                      {/* Company */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {flight.company?.logo_url ? (
                            <img
                              src={flight.company.logo_url}
                              alt={flight.company.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {flight.company?.name || 'Unknown Company'}
                          </p>
                          {flight.company?.verified && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              {t.verified}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {flight.departure_city}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {flight.arrival_city}
                        </span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {time}
                        </div>
                      </div>

                      {/* Aircraft */}
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                        <Plane className="h-4 w-4" />
                        {flight.aircraft_type}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {availableSeats} {t.availableSeats}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(flight.price_per_seat)}
                          <span className="text-sm font-normal text-gray-500">
                            {t.perSeat}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t.noFlights}
                  </h3>
                  <p className="text-gray-500">{t.noFlightsDesc}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Received Requests Tab */}
        <TabsContent value="received" className="mt-6">
          {partnerRequests.length > 0 ? (
            <div className="space-y-4">
              {partnerRequests.map((request) => {
                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {request.from_company?.logo_url ? (
                              <img
                                src={request.from_company.logo_url}
                                alt={request.from_company.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">
                                {request.from_company?.name}
                              </p>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {request.seats_requested} {t.seats} • {request.flight?.departure_city} → {request.flight?.arrival_city}
                            </p>
                            {request.message && (
                              <p className="text-sm text-gray-500 italic">
                                "{request.message}"
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {t.requestedOn} {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex gap-2 sm:flex-col">
                            <Button
                              size="sm"
                              onClick={() => handleRespondToRequest(request.id, true)}
                            >
                              {t.accept}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRespondToRequest(request.id, false)}
                            >
                              {t.reject}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t.noRequests}
                  </h3>
                  <p className="text-gray-500">{t.noRequestsDesc}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sent Requests Tab */}
        <TabsContent value="sent" className="mt-6">
          {myRequests.length > 0 ? (
            <div className="space-y-4">
              {myRequests.map((request: any) => {
                const flight = request.flight
                const { date } = flight
                  ? formatDateTime(flight.departure_datetime)
                  : { date: '' }

                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {flight?.companies?.logo_url ? (
                              <img
                                src={flight.companies.logo_url}
                                alt={flight.companies.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">
                                {flight?.companies?.name || 'Unknown'}
                              </p>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {flight?.departure_city} → {flight?.arrival_city}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {request.seats_requested} {t.seats}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {t.requestedOn} {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {formatPrice((flight?.price_per_seat || 0) * request.seats_requested)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.seats_requested} x {formatPrice(flight?.price_per_seat || 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t.noRequests}
                  </h3>
                  <p className="text-gray-500">{t.noRequestsDesc}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Flight Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.flightDetails}</DialogTitle>
          </DialogHeader>
          {selectedFlight && (
            <div className="space-y-6">
              {/* Company Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  {t.companyInfo}
                </h4>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    {selectedFlight.company?.logo_url ? (
                      <img
                        src={selectedFlight.company.logo_url}
                        alt={selectedFlight.company.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-7 w-7 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedFlight.company?.name}
                    </p>
                    {selectedFlight.company?.verified && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        {t.verified}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Flight Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  {t.flightInfo}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.departure}</span>
                    <span className="font-medium">{selectedFlight.departure_city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.arrival}</span>
                    <span className="font-medium">{selectedFlight.arrival_city}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.departureTime}</span>
                    <span className="font-medium">
                      {formatDateTime(selectedFlight.departure_datetime).date}{' '}
                      {formatDateTime(selectedFlight.departure_datetime).time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.aircraft}</span>
                    <span className="font-medium">{selectedFlight.aircraft_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.availableSeats}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {selectedFlight.available_seats - selectedFlight.booked_seats} {t.seats}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">{t.pricePerSeat}</span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(selectedFlight.price_per_seat)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setShowDetailModal(false)
                  setShowRequestModal(true)
                }}
              >
                {t.requestSeats}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Request Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.requestSeats}</DialogTitle>
          </DialogHeader>
          {selectedFlight && (
            <div className="space-y-4">
              {/* Flight Summary */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {selectedFlight.departure_city} → {selectedFlight.arrival_city}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateTime(selectedFlight.departure_datetime).date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(selectedFlight.departure_datetime).time}
                  </span>
                </div>
              </div>

              {/* Seats Selection */}
              <div>
                <Label>{t.seatsToRequest}</Label>
                <Select
                  value={requestSeats.toString()}
                  onValueChange={(v) => setRequestSeats(parseInt(v))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: selectedFlight.available_seats - selectedFlight.booked_seats },
                      (_, i) => i + 1
                    ).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'place' : 'places'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div>
                <Label>{t.message}</Label>
                <Textarea
                  className="mt-1"
                  placeholder={t.messagePlaceholder}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(selectedFlight.price_per_seat * requestSeats)}
                </span>
              </div>

              <Button
                className="w-full"
                onClick={handleSendRequest}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t.sendRequest}
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
