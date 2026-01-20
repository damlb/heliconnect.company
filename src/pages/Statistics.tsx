import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  Euro,
  Plane,
  CalendarCheck,
  Users,
  MapPin,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'

interface ContextType {
  language: 'fr' | 'en'
}

interface Stats {
  totalRevenue: number
  totalBookings: number
  completedFlights: number
  averageBookingValue: number
  totalSeats: number
  occupancyRate: number
}

const PERIODS = [
  { value: 'week', labelFr: 'Cette semaine', labelEn: 'This week' },
  { value: 'month', labelFr: 'Ce mois', labelEn: 'This month' },
  { value: 'quarter', labelFr: 'Ce trimestre', labelEn: 'This quarter' },
  { value: 'year', labelFr: 'Cette année', labelEn: 'This year' },
  { value: 'all', labelFr: 'Tout le temps', labelEn: 'All time' },
]

export default function Statistics() {
  const { language } = useOutletContext<ContextType>()
  const { company } = useAuth()
  const [period, setPeriod] = useState('month')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalBookings: 0,
    completedFlights: 0,
    averageBookingValue: 0,
    totalSeats: 0,
    occupancyRate: 0,
  })
  const [topRoutes, setTopRoutes] = useState<{ route: string; count: number; revenue: number }[]>([])
  const [recentBookings, setRecentBookings] = useState<any[]>([])

  const texts = {
    fr: {
      title: 'Statistiques',
      subtitle: 'Analysez les performances de votre activité',
      overview: 'Vue d\'ensemble',
      totalRevenue: 'Chiffre d\'affaires',
      totalBookings: 'Réservations',
      completedFlights: 'Vols effectués',
      averageBooking: 'Panier moyen',
      totalSeats: 'Places vendues',
      occupancyRate: 'Taux d\'occupation',
      topRoutes: 'Trajets les plus populaires',
      recentBookings: 'Réservations récentes',
      noData: 'Aucune donnée disponible',
      bookings: 'réservations',
      passengers: 'passagers',
    },
    en: {
      title: 'Statistics',
      subtitle: 'Analyze your business performance',
      overview: 'Overview',
      totalRevenue: 'Total Revenue',
      totalBookings: 'Bookings',
      completedFlights: 'Completed flights',
      averageBooking: 'Average booking',
      totalSeats: 'Seats sold',
      occupancyRate: 'Occupancy rate',
      topRoutes: 'Most popular routes',
      recentBookings: 'Recent bookings',
      noData: 'No data available',
      bookings: 'bookings',
      passengers: 'passengers',
    },
  }

  const t = texts[language]

  useEffect(() => {
    if (company?.id) {
      fetchStatistics()
    }
  }, [company?.id, period])

  const getDateFilter = () => {
    const now = new Date()
    switch (period) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString()
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString()
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3)).toISOString()
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString()
      default:
        return null
    }
  }

  const fetchStatistics = async () => {
    if (!company?.id) return
    setIsLoading(true)

    try {
      const dateFilter = getDateFilter()

      // Fetch bookings for this company's flights
      let bookingsQuery = supabase
        .from('bookings')
        .select(`
          *,
          flights!inner (
            id,
            company_id,
            departure_city,
            arrival_city,
            available_seats,
            booked_seats
          )
        `)
        .eq('flights.company_id', company.id)

      if (dateFilter) {
        bookingsQuery = bookingsQuery.gte('created_at', dateFilter)
      }

      const { data: bookings } = await bookingsQuery

      // Calculate stats
      const completedBookings = bookings?.filter((b) =>
        ['completed', 'paid', 'confirmed'].includes(b.status)
      ) || []

      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
      const totalSeats = completedBookings.reduce((sum, b) => sum + (b.seats_booked || 0), 0)
      const averageBookingValue = completedBookings.length > 0
        ? totalRevenue / completedBookings.length
        : 0

      // Fetch flights count
      let flightsQuery = supabase
        .from('flights')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'completed')

      if (dateFilter) {
        flightsQuery = flightsQuery.gte('departure_datetime', dateFilter)
      }

      const { count: completedFlights } = await flightsQuery

      // Calculate occupancy rate
      let allFlightsQuery = supabase
        .from('flights')
        .select('available_seats, booked_seats')
        .eq('company_id', company.id)

      if (dateFilter) {
        allFlightsQuery = allFlightsQuery.gte('departure_datetime', dateFilter)
      }

      const { data: allFlights } = await allFlightsQuery

      const totalAvailable = allFlights?.reduce((sum, f) => sum + (f.available_seats || 0), 0) || 0
      const totalBooked = allFlights?.reduce((sum, f) => sum + (f.booked_seats || 0), 0) || 0
      const occupancyRate = totalAvailable > 0 ? (totalBooked / totalAvailable) * 100 : 0

      setStats({
        totalRevenue,
        totalBookings: bookings?.length || 0,
        completedFlights: completedFlights || 0,
        averageBookingValue,
        totalSeats,
        occupancyRate,
      })

      // Calculate top routes
      const routeCounts: Record<string, { count: number; revenue: number }> = {}
      bookings?.forEach((booking: any) => {
        const route = `${booking.flights?.departure_city} → ${booking.flights?.arrival_city}`
        if (!routeCounts[route]) {
          routeCounts[route] = { count: 0, revenue: 0 }
        }
        routeCounts[route].count++
        routeCounts[route].revenue += booking.total_price || 0
      })

      const sortedRoutes = Object.entries(routeCounts)
        .map(([route, data]) => ({ route, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setTopRoutes(sortedRoutes)

      // Fetch recent bookings
      const { data: recent } = await supabase
        .from('bookings')
        .select(`
          *,
          flights!inner (
            departure_city,
            arrival_city,
            company_id
          )
        `)
        .eq('flights.company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentBookings(recent || [])
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const kpiCards = [
    {
      title: t.totalRevenue,
      value: formatPrice(stats.totalRevenue),
      icon: Euro,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t.totalBookings,
      value: stats.totalBookings.toString(),
      icon: CalendarCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t.completedFlights,
      value: stats.completedFlights.toString(),
      icon: Plane,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: t.averageBooking,
      value: formatPrice(stats.averageBookingValue),
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: t.totalSeats,
      value: stats.totalSeats.toString(),
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t.occupancyRate,
      value: `${stats.occupancyRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
  ]

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
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {language === 'fr' ? p.labelFr : p.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5" />
              {t.topRoutes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topRoutes.length > 0 ? (
              <div className="space-y-4">
                {topRoutes.map((route, index) => (
                  <div
                    key={route.route}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-medium text-gray-900">{route.route}</span>
                        <p className="text-sm text-gray-500">
                          {route.count} {t.bookings}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatPrice(route.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">{t.noData}</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="h-5 w-5" />
              {t.recentBookings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.flights?.departure_city} → {booking.flights?.arrival_city}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {booking.booking_reference}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {booking.seats_booked} {t.passengers}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-primary">
                      {formatPrice(booking.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">{t.noData}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
