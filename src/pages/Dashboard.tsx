import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Plane,
  CalendarCheck,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Flight, Booking } from '@/types'

interface ContextType {
  language: 'fr' | 'en'
}

interface DashboardStats {
  totalFlights: number
  activeFlights: number
  totalBookings: number
  monthlyRevenue: number
  revenueChange: number
}

export default function Dashboard() {
  const { language } = useOutletContext<ContextType>()
  const { company } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalFlights: 0,
    activeFlights: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    revenueChange: 12.5,
  })
  const [recentFlights, setRecentFlights] = useState<Flight[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (company?.id) {
      fetchDashboardData()
    } else {
      setIsLoading(false)
    }
  }, [company?.id])

  const fetchDashboardData = async () => {
    if (!company?.id) return

    try {
      // Fetch flights count
      const { count: totalFlights } = await supabase
        .from('flights')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)

      const { count: activeFlights } = await supabase
        .from('flights')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'available')

      // Fetch recent flights
      const { data: flightsData } = await supabase
        .from('flights')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch bookings count
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*, flights!inner(*)', { count: 'exact', head: true })
        .eq('flights.company_id', company.id)

      // Fetch recent bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, flights!inner(*)')
        .eq('flights.company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalFlights: totalFlights || 0,
        activeFlights: activeFlights || 0,
        totalBookings: totalBookings || 0,
        monthlyRevenue: 0, // TODO: Calculate from bookings
        revenueChange: 12.5,
      })

      setRecentFlights(flightsData || [])
      setRecentBookings(bookingsData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const texts = {
    fr: {
      title: 'Tableau de bord',
      welcome: 'Bienvenue',
      totalFlights: 'Total des vols',
      activeFlights: 'Vols actifs',
      totalBookings: 'Réservations',
      monthlyRevenue: 'Revenu mensuel',
      recentFlights: 'Vols récents',
      recentBookings: 'Réservations récentes',
      noFlights: 'Aucun vol pour le moment',
      noBookings: 'Aucune réservation pour le moment',
      viewAll: 'Voir tout',
      from: 'De',
      to: 'À',
      date: 'Date',
      status: 'Statut',
      seats: 'places',
    },
    en: {
      title: 'Dashboard',
      welcome: 'Welcome',
      totalFlights: 'Total flights',
      activeFlights: 'Active flights',
      totalBookings: 'Bookings',
      monthlyRevenue: 'Monthly revenue',
      recentFlights: 'Recent flights',
      recentBookings: 'Recent bookings',
      noFlights: 'No flights yet',
      noBookings: 'No bookings yet',
      viewAll: 'View all',
      from: 'From',
      to: 'To',
      date: 'Date',
      status: 'Status',
      seats: 'seats',
    },
  }

  const t = texts[language]

  const statCards = [
    {
      title: t.totalFlights,
      value: stats.totalFlights,
      icon: Plane,
      change: null,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t.activeFlights,
      value: stats.activeFlights,
      icon: Plane,
      change: null,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: t.totalBookings,
      value: stats.totalBookings,
      icon: CalendarCheck,
      change: null,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t.monthlyRevenue,
      value: formatPrice(stats.monthlyRevenue),
      icon: TrendingUp,
      change: stats.revenueChange,
      color: 'text-gold-600',
      bgColor: 'bg-gold-100',
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
      <div>
        <h1 className="text-2xl font-display font-semibold text-gray-900">
          {t.title}
        </h1>
        <p className="text-gray-500 mt-1">
          {t.welcome}, {company?.name}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  {stat.change !== null && (
                    <div className="flex items-center mt-2">
                      {stat.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm ml-1 ${
                          stat.change >= 0
                            ? 'text-emerald-500'
                            : 'text-red-500'
                        }`}
                      >
                        {Math.abs(stat.change)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent flights and bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent flights */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t.recentFlights}</CardTitle>
            <a
              href="/flights"
              className="text-sm text-primary hover:underline"
            >
              {t.viewAll}
            </a>
          </CardHeader>
          <CardContent>
            {recentFlights.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t.noFlights}</p>
            ) : (
              <div className="space-y-4">
                {recentFlights.map((flight) => (
                  <div
                    key={flight.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Plane className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {flight.departure_city} → {flight.arrival_city}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(flight.departure_datetime)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          flight.status === 'available' ? 'success' : 'secondary'
                        }
                      >
                        {flight.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {flight.available_seats - flight.booked_seats}{' '}
                        {t.seats}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t.recentBookings}</CardTitle>
            <a
              href="/bookings"
              className="text-sm text-primary hover:underline"
            >
              {t.viewAll}
            </a>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t.noBookings}</p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.contact_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.booking_reference}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(booking.total_price)}
                      </p>
                      <Badge
                        variant={
                          booking.status === 'paid' ? 'success' : 'warning'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
