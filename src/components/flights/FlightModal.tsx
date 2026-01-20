import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { Flight, Helicopter } from '@/types'
import { POPULAR_CITIES } from '@/lib/constants'

interface FlightModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  flight: Flight | null
  language: 'fr' | 'en'
}

export default function FlightModal({
  isOpen,
  onClose,
  onSaved,
  flight,
  language,
}: FlightModalProps) {
  const { company, profile } = useAuth()
  const [helicopters, setHelicopters] = useState<Helicopter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    helicopter_id: '',
    departure_city: '',
    arrival_city: '',
    departure_datetime: '',
    flight_duration_minutes: '',
    available_seats: '',
    price_per_seat: '',
    total_price: '',
    public_description: '',
    notes: '',
    allow_partial_booking: true,
    minimum_seats: '1',
    is_flexible_date: false,
    flexible_date_range_days: '0',
  })

  useEffect(() => {
    if (isOpen && company?.id) {
      fetchHelicopters()
    }
  }, [isOpen, company?.id])

  useEffect(() => {
    if (flight) {
      setFormData({
        helicopter_id: flight.helicopter_id || '',
        departure_city: flight.departure_city,
        arrival_city: flight.arrival_city,
        departure_datetime: flight.departure_datetime
          ? new Date(flight.departure_datetime).toISOString().slice(0, 16)
          : '',
        flight_duration_minutes: flight.flight_duration_minutes?.toString() || '',
        available_seats: flight.available_seats.toString(),
        price_per_seat: flight.price_per_seat?.toString() || '',
        total_price: flight.total_price?.toString() || '',
        public_description: flight.public_description || '',
        notes: flight.notes || '',
        allow_partial_booking: flight.allow_partial_booking,
        minimum_seats: flight.minimum_seats.toString(),
        is_flexible_date: flight.is_flexible_date,
        flexible_date_range_days: flight.flexible_date_range_days.toString(),
      })
    } else {
      // Reset form
      setFormData({
        helicopter_id: '',
        departure_city: '',
        arrival_city: '',
        departure_datetime: '',
        flight_duration_minutes: '',
        available_seats: '',
        price_per_seat: '',
        total_price: '',
        public_description: '',
        notes: '',
        allow_partial_booking: true,
        minimum_seats: '1',
        is_flexible_date: false,
        flexible_date_range_days: '0',
      })
    }
  }, [flight, isOpen])

  const fetchHelicopters = async () => {
    if (!company?.id) return

    const { data } = await supabase
      .from('helicopters')
      .select('*')
      .eq('company_id', company.id)
      .eq('is_active', true)

    setHelicopters(data || [])
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const flightData = {
        company_id: company.id,
        helicopter_id: formData.helicopter_id || null,
        departure_city: formData.departure_city,
        arrival_city: formData.arrival_city,
        departure_datetime: new Date(formData.departure_datetime).toISOString(),
        flight_duration_minutes: formData.flight_duration_minutes
          ? parseInt(formData.flight_duration_minutes)
          : null,
        available_seats: parseInt(formData.available_seats),
        price_per_seat: formData.price_per_seat
          ? parseFloat(formData.price_per_seat)
          : null,
        total_price: formData.total_price
          ? parseFloat(formData.total_price)
          : null,
        public_description: formData.public_description || null,
        notes: formData.notes || null,
        allow_partial_booking: formData.allow_partial_booking,
        minimum_seats: parseInt(formData.minimum_seats),
        is_flexible_date: formData.is_flexible_date,
        flexible_date_range_days: parseInt(formData.flexible_date_range_days),
        status: 'available',
        is_visible_to_public: true,
        created_by: profile?.id,
      }

      if (flight) {
        // Update
        const { error } = await supabase
          .from('flights')
          .update(flightData)
          .eq('id', flight.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase.from('flights').insert(flightData)

        if (error) throw error
      }

      onSaved()
    } catch (err: any) {
      console.error('Error saving flight:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const texts = {
    fr: {
      title: flight ? 'Modifier le vol' : 'Nouveau vol',
      helicopter: 'Hélicoptère',
      selectHelicopter: 'Sélectionner un hélicoptère',
      noHelicopter: 'Aucun hélicoptère (non défini)',
      departureCity: 'Ville de départ',
      arrivalCity: "Ville d'arrivée",
      departureDate: 'Date et heure de départ',
      duration: 'Durée (minutes)',
      seats: 'Nombre de places',
      pricePerSeat: 'Prix par place (€)',
      totalPrice: 'Prix total (€)',
      description: 'Description publique',
      notes: 'Notes internes',
      allowPartial: 'Autoriser la réservation partielle',
      minSeats: 'Places minimum',
      flexibleDate: 'Dates flexibles',
      flexibleDays: 'Flexibilité (+/- jours)',
      cancel: 'Annuler',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
    },
    en: {
      title: flight ? 'Edit Flight' : 'New Flight',
      helicopter: 'Helicopter',
      selectHelicopter: 'Select a helicopter',
      noHelicopter: 'No helicopter (undefined)',
      departureCity: 'Departure city',
      arrivalCity: 'Arrival city',
      departureDate: 'Departure date and time',
      duration: 'Duration (minutes)',
      seats: 'Number of seats',
      pricePerSeat: 'Price per seat (€)',
      totalPrice: 'Total price (€)',
      description: 'Public description',
      notes: 'Internal notes',
      allowPartial: 'Allow partial booking',
      minSeats: 'Minimum seats',
      flexibleDate: 'Flexible dates',
      flexibleDays: 'Flexibility (+/- days)',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving...',
    },
  }

  const t = texts[language]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Helicopter selection */}
          <div className="space-y-2">
            <Label>{t.helicopter}</Label>
            <Select
              value={formData.helicopter_id}
              onValueChange={(v) => handleChange('helicopter_id', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectHelicopter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t.noHelicopter}</SelectItem>
                {helicopters.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.registration} - {h.model} ({h.passenger_capacity} places)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.departureCity} *</Label>
              <Input
                value={formData.departure_city}
                onChange={(e) => handleChange('departure_city', e.target.value)}
                list="departure-cities"
                required
              />
              <datalist id="departure-cities">
                {POPULAR_CITIES.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label>{t.arrivalCity} *</Label>
              <Input
                value={formData.arrival_city}
                onChange={(e) => handleChange('arrival_city', e.target.value)}
                list="arrival-cities"
                required
              />
              <datalist id="arrival-cities">
                {POPULAR_CITIES.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Date and duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.departureDate} *</Label>
              <Input
                type="datetime-local"
                value={formData.departure_datetime}
                onChange={(e) =>
                  handleChange('departure_datetime', e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t.duration}</Label>
              <Input
                type="number"
                value={formData.flight_duration_minutes}
                onChange={(e) =>
                  handleChange('flight_duration_minutes', e.target.value)
                }
                placeholder="45"
              />
            </div>
          </div>

          {/* Seats and pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t.seats} *</Label>
              <Input
                type="number"
                value={formData.available_seats}
                onChange={(e) =>
                  handleChange('available_seats', e.target.value)
                }
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.pricePerSeat}</Label>
              <Input
                type="number"
                value={formData.price_per_seat}
                onChange={(e) => handleChange('price_per_seat', e.target.value)}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.totalPrice}</Label>
              <Input
                type="number"
                value={formData.total_price}
                onChange={(e) => handleChange('total_price', e.target.value)}
                step="0.01"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>{t.description}</Label>
            <Textarea
              value={formData.public_description}
              onChange={(e) =>
                handleChange('public_description', e.target.value)
              }
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t.notes}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                t.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
