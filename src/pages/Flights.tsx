import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Plus,
  Search,
  Plane,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import {
  formatPrice,
  formatDateTime,
  formatDuration,
  flightStatusColors,
  flightStatusLabels,
} from '@/lib/utils'
import type { Flight } from '@/types'
import FlightModal from '@/components/flights/FlightModal'

interface ContextType {
  language: 'fr' | 'en'
}

export default function Flights() {
  const { language } = useOutletContext<ContextType>()
  const { company } = useAuth()
  const [flights, setFlights] = useState<Flight[]>([])
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)

  useEffect(() => {
    if (company?.id) {
      fetchFlights()
    }
  }, [company?.id])

  useEffect(() => {
    filterFlights()
  }, [flights, searchQuery, statusFilter])

  const fetchFlights = async () => {
    if (!company?.id) return

    try {
      const { data, error } = await supabase
        .from('flights')
        .select('*, helicopters(*)')
        .eq('company_id', company.id)
        .order('departure_datetime', { ascending: true })

      if (error) throw error
      setFlights(data || [])
    } catch (error) {
      console.error('Error fetching flights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterFlights = () => {
    let filtered = flights

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (f) =>
          f.departure_city.toLowerCase().includes(query) ||
          f.arrival_city.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((f) => f.status === statusFilter)
    }

    setFilteredFlights(filtered)
  }

  const handleCreateFlight = () => {
    setSelectedFlight(null)
    setIsModalOpen(true)
  }

  const handleEditFlight = (flight: Flight) => {
    setSelectedFlight(flight)
    setIsModalOpen(true)
  }

  const handleDeleteFlight = async (flightId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce vol ?')) return

    try {
      const { error } = await supabase
        .from('flights')
        .delete()
        .eq('id', flightId)

      if (error) throw error
      fetchFlights()
    } catch (error) {
      console.error('Error deleting flight:', error)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedFlight(null)
  }

  const handleFlightSaved = () => {
    fetchFlights()
    handleModalClose()
  }

  const texts = {
    fr: {
      title: 'Mes vols',
      subtitle: 'Gérez vos vols empty legs',
      addFlight: 'Ajouter un vol',
      search: 'Rechercher par ville...',
      filter: 'Filtrer',
      allStatus: 'Tous les statuts',
      noFlights: 'Aucun vol trouvé',
      noFlightsDesc: 'Commencez par ajouter votre premier vol empty leg',
      from: 'De',
      to: 'À',
      date: 'Date',
      seats: 'places',
      available: 'disponibles',
      price: 'Prix',
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      upcoming: 'À venir',
      past: 'Passés',
      all: 'Tous',
    },
    en: {
      title: 'My Flights',
      subtitle: 'Manage your empty leg flights',
      addFlight: 'Add a flight',
      search: 'Search by city...',
      filter: 'Filter',
      allStatus: 'All statuses',
      noFlights: 'No flights found',
      noFlightsDesc: 'Start by adding your first empty leg flight',
      from: 'From',
      to: 'To',
      date: 'Date',
      seats: 'seats',
      available: 'available',
      price: 'Price',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      upcoming: 'Upcoming',
      past: 'Past',
      all: 'All',
    },
  }

  const t = texts[language]

  // Separate flights by date
  const now = new Date()
  const upcomingFlights = filteredFlights.filter(
    (f) => new Date(f.departure_datetime) >= now
  )
  const pastFlights = filteredFlights.filter(
    (f) => new Date(f.departure_datetime) < now
  )

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
        <Button onClick={handleCreateFlight}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addFlight}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t.allStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allStatus}</SelectItem>
            <SelectItem value="available">Disponible</SelectItem>
            <SelectItem value="booked">Réservé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            {t.upcoming} ({upcomingFlights.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            {t.past} ({pastFlights.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            {t.all} ({filteredFlights.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <FlightsList
            flights={upcomingFlights}
            onEdit={handleEditFlight}
            onDelete={handleDeleteFlight}
            t={t}
            language={language}
          />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <FlightsList
            flights={pastFlights}
            onEdit={handleEditFlight}
            onDelete={handleDeleteFlight}
            t={t}
            language={language}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <FlightsList
            flights={filteredFlights}
            onEdit={handleEditFlight}
            onDelete={handleDeleteFlight}
            t={t}
            language={language}
          />
        </TabsContent>
      </Tabs>

      {/* Flight Modal */}
      <FlightModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSaved={handleFlightSaved}
        flight={selectedFlight}
        language={language}
      />
    </div>
  )
}

// Flights list component
interface FlightsListProps {
  flights: Flight[]
  onEdit: (flight: Flight) => void
  onDelete: (id: string) => void
  t: Record<string, string>
  language: 'fr' | 'en'
}

function FlightsList({ flights, onEdit, onDelete, t, language }: FlightsListProps) {
  if (flights.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Plane className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">{t.noFlights}</p>
          <p className="text-gray-400 text-sm mt-1">{t.noFlightsDesc}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {flights.map((flight) => (
        <Card
          key={flight.id}
          className="hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Flight info */}
              <div className="flex items-center gap-6">
                {/* Route */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Plane className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {flight.departure_city}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-semibold text-gray-900">
                        {flight.arrival_city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDateTime(flight.departure_datetime)}</span>
                      {flight.flight_duration_minutes && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span>
                            {formatDuration(flight.flight_duration_minutes)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seats */}
                <div className="hidden md:block">
                  <p className="text-sm text-gray-500">{t.seats}</p>
                  <p className="font-medium">
                    {flight.available_seats - flight.booked_seats} / {flight.available_seats}
                  </p>
                </div>

                {/* Price */}
                <div className="hidden md:block">
                  <p className="text-sm text-gray-500">{t.price}</p>
                  <p className="font-semibold text-primary">
                    {flight.price_per_seat
                      ? `${formatPrice(flight.price_per_seat)} / ${language === 'fr' ? 'place' : 'seat'}`
                      : formatPrice(flight.total_price)}
                  </p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-4">
                <Badge
                  className={`${flightStatusColors[flight.status]?.bg} ${flightStatusColors[flight.status]?.text}`}
                >
                  {flightStatusLabels[flight.status] || flight.status}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(flight)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(flight.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
