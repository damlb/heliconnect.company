// Application constants

// Navigation items for company sidebar
export const SIDEBAR_ITEMS = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    labelEn: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
  },
  {
    id: 'flights',
    label: 'Mes vols',
    labelEn: 'My Flights',
    icon: 'Plane',
    path: '/flights',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    labelEn: 'Marketplace',
    icon: 'ShoppingBag',
    path: '/marketplace',
  },
  {
    id: 'bookings',
    label: 'Réservations',
    labelEn: 'Bookings',
    icon: 'CalendarCheck',
    path: '/bookings',
  },
  {
    id: 'fleet',
    label: 'Ma flotte',
    labelEn: 'My Fleet',
    icon: 'Helicopter',
    path: '/fleet',
  },
  {
    id: 'statistics',
    label: 'Statistiques',
    labelEn: 'Statistics',
    icon: 'BarChart3',
    path: '/statistics',
  },
  {
    id: 'documents',
    label: 'Documents',
    labelEn: 'Documents',
    icon: 'FileText',
    path: '/documents',
  },
  {
    id: 'team',
    label: 'Équipe',
    labelEn: 'Team',
    icon: 'Users',
    path: '/team',
  },
  {
    id: 'support',
    label: 'Support',
    labelEn: 'Support',
    icon: 'HelpCircle',
    path: '/support',
  },
  {
    id: 'settings',
    label: 'Paramètres',
    labelEn: 'Settings',
    icon: 'Settings',
    path: '/settings',
  },
]

// Flight status options
export const FLIGHT_STATUS_OPTIONS = [
  { value: 'available', label: 'Disponible', labelEn: 'Available' },
  { value: 'booked', label: 'Réservé', labelEn: 'Booked' },
  { value: 'cancelled', label: 'Annulé', labelEn: 'Cancelled' },
  { value: 'completed', label: 'Terminé', labelEn: 'Completed' },
  { value: 'expired', label: 'Expiré', labelEn: 'Expired' },
]

// Booking status options
export const BOOKING_STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', labelEn: 'Pending' },
  { value: 'confirmed', label: 'Confirmé', labelEn: 'Confirmed' },
  { value: 'paid', label: 'Payé', labelEn: 'Paid' },
  { value: 'cancelled', label: 'Annulé', labelEn: 'Cancelled' },
  { value: 'completed', label: 'Terminé', labelEn: 'Completed' },
  { value: 'refunded', label: 'Remboursé', labelEn: 'Refunded' },
]

// Helicopter amenities
export const HELICOPTER_AMENITIES = [
  { value: 'air_conditioning', label: 'Climatisation', labelEn: 'Air conditioning' },
  { value: 'leather_seats', label: 'Sièges en cuir', labelEn: 'Leather seats' },
  { value: 'wifi', label: 'WiFi', labelEn: 'WiFi' },
  { value: 'champagne_bar', label: 'Bar à champagne', labelEn: 'Champagne bar' },
  { value: 'noise_cancelling', label: 'Casques anti-bruit', labelEn: 'Noise cancelling headsets' },
  { value: 'luggage_compartment', label: 'Compartiment à bagages', labelEn: 'Luggage compartment' },
  { value: 'panoramic_view', label: 'Vue panoramique', labelEn: 'Panoramic view' },
  { value: 'vip_interior', label: 'Intérieur VIP', labelEn: 'VIP interior' },
]

// Support ticket categories
export const TICKET_CATEGORIES = [
  { value: 'bug', label: 'Bug / Problème technique', labelEn: 'Bug / Technical issue' },
  { value: 'feature_request', label: 'Demande de fonctionnalité', labelEn: 'Feature request' },
  { value: 'billing', label: 'Facturation', labelEn: 'Billing' },
  { value: 'booking', label: 'Réservation', labelEn: 'Booking' },
  { value: 'account', label: 'Compte', labelEn: 'Account' },
  { value: 'other', label: 'Autre', labelEn: 'Other' },
]

// Priority levels
export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Basse', labelEn: 'Low' },
  { value: 'normal', label: 'Normale', labelEn: 'Normal' },
  { value: 'high', label: 'Haute', labelEn: 'High' },
  { value: 'urgent', label: 'Urgente', labelEn: 'Urgent' },
]

// Time slots for flight flexibility
export const TIME_SLOTS = [
  { value: 'morning', label: 'Matin (6h-12h)', labelEn: 'Morning (6am-12pm)' },
  { value: 'afternoon', label: 'Après-midi (12h-18h)', labelEn: 'Afternoon (12pm-6pm)' },
  { value: 'evening', label: 'Soir (18h-22h)', labelEn: 'Evening (6pm-10pm)' },
  { value: 'flexible', label: 'Flexible', labelEn: 'Flexible' },
]

// Popular French cities for helicopters
export const POPULAR_CITIES = [
  'Paris',
  'Nice',
  'Cannes',
  'Monaco',
  'Saint-Tropez',
  'Marseille',
  'Lyon',
  'Bordeaux',
  'Toulouse',
  'Ajaccio',
  'Bastia',
  'Calvi',
  'Figari',
  'Porto-Vecchio',
  'Genève',
  'Milan',
  'Courchevel',
  'Megève',
  'Chamonix',
]
