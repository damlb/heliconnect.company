// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'client' | 'company' | 'superadmin'

export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  company_name: string | null
  company_type: string | null
  siret: string | null
  vat_number: string | null
  billing_address: BillingAddress | null
  preferred_language: string
  email_notifications: boolean
  push_notifications: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
  is_active: boolean
  is_verified: boolean
}

export interface BillingAddress {
  street: string
  city: string
  postal_code: string
  country: string
}

// ============================================
// COMPANY TYPES
// ============================================

export interface Company {
  id: string
  owner_id: string | null
  name: string
  legal_name: string | null
  description: string | null
  logo_url: string | null
  website: string | null
  email: string
  phone: string | null
  address: CompanyAddress | null
  siret: string | null
  vat_number: string | null
  operating_license: string | null
  insurance_number: string | null
  insurance_expiry: string | null
  commission_rate: number
  is_active: boolean
  is_verified: boolean
  contract_signed_at: string | null
  contract_url: string | null
  bank_details: BankDetails | null
  stripe_account_id: string | null
  created_at: string
  updated_at: string
}

export interface CompanyAddress {
  street: string
  city: string
  postal_code: string
  country: string
}

export interface BankDetails {
  iban: string
  bic: string
  bank_name: string
  account_holder: string
}

export interface CompanyMember {
  id: string
  company_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  permissions: Record<string, boolean>
  created_at: string
}

// ============================================
// HELICOPTER TYPES
// ============================================

export interface Helicopter {
  id: string
  company_id: string
  registration: string
  model: string
  manufacturer: string | null
  serial_number: string | null
  passenger_capacity: number
  luggage_capacity_kg: number | null
  year_of_manufacture: number | null
  max_range_km: number | null
  cruise_speed_kmh: number | null
  amenities: string[]
  airworthiness_certificate_url: string | null
  airworthiness_expiry: string | null
  insurance_certificate_url: string | null
  images: string[]
  thumbnail_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================
// AIRPORT TYPES
// ============================================

export interface Airport {
  id: string
  icao_code: string | null
  iata_code: string | null
  name: string
  city: string
  region: string | null
  country: string
  latitude: number | null
  longitude: number | null
  type: 'heliport' | 'airport' | 'private'
  is_active: boolean
  created_at: string
}

// ============================================
// FLIGHT TYPES
// ============================================

export type FlightStatus = 'available' | 'booked' | 'cancelled' | 'completed' | 'expired'

export interface Flight {
  id: string
  company_id: string
  helicopter_id: string | null
  departure_airport_id: string | null
  arrival_airport_id: string | null
  departure_city: string
  arrival_city: string
  departure_location: string | null
  arrival_location: string | null
  departure_datetime: string
  estimated_arrival_datetime: string | null
  flight_duration_minutes: number | null
  is_flexible_date: boolean
  flexible_date_range_days: number
  is_flexible_time: boolean
  flexible_time_range_hours: number
  available_seats: number
  booked_seats: number
  price_per_seat: number | null
  total_price: number | null
  original_price: number | null
  discount_percentage: number | null
  currency: string
  allow_partial_booking: boolean
  minimum_seats: number
  status: FlightStatus
  is_visible_to_public: boolean
  priority_end_datetime: string | null
  notes: string | null
  public_description: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  // Joined data
  helicopter?: Helicopter
  company?: Company
  departure_airport?: Airport
  arrival_airport?: Airport
}

export interface FlightFormData {
  helicopter_id: string
  departure_city: string
  arrival_city: string
  departure_airport_id?: string
  arrival_airport_id?: string
  departure_datetime: string
  estimated_arrival_datetime?: string
  flight_duration_minutes?: number
  available_seats: number
  price_per_seat?: number
  total_price?: number
  original_price?: number
  discount_percentage?: number
  is_flexible_date: boolean
  flexible_date_range_days: number
  is_flexible_time: boolean
  flexible_time_range_hours: number
  allow_partial_booking: boolean
  minimum_seats: number
  public_description?: string
  notes?: string
}

// ============================================
// BOOKING TYPES
// ============================================

export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled' | 'completed' | 'refunded'

export interface Passenger {
  name: string
  email: string
  phone?: string
  id_number?: string
}

export interface Booking {
  id: string
  flight_id: string
  user_id: string | null
  company_id: string | null
  booking_reference: string
  seats_booked: number
  passengers: Passenger[]
  contact_name: string
  contact_email: string
  contact_phone: string | null
  unit_price: number
  subtotal: number
  commission_rate: number
  commission_amount: number
  total_price: number
  currency: string
  payment_status: string
  payment_method: string | null
  stripe_payment_intent_id: string | null
  stripe_invoice_id: string | null
  paid_at: string | null
  status: BookingStatus
  cancelled_at: string | null
  cancellation_reason: string | null
  refund_amount: number | null
  special_requests: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
  // Joined data
  flight?: Flight
  user?: Profile
  booking_company?: Company
}

// ============================================
// SUPPORT TYPES
// ============================================

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface SupportTicket {
  id: string
  user_id: string | null
  company_id: string | null
  ticket_number: string
  subject: string
  category: string | null
  priority: string
  status: TicketStatus
  assigned_to: string | null
  booking_id: string | null
  flight_id: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  // Joined data
  messages?: SupportMessage[]
  user?: Profile
  company?: Company
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string | null
  message: string
  attachments: string[]
  is_internal: boolean
  created_at: string
  // Joined data
  sender?: Profile
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'flight_alert' | 'booking_update' | 'payment' | 'system' | 'flight_request'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown>
  action_url: string | null
  is_read: boolean
  read_at: string | null
  sent_via_email: boolean
  sent_via_push: boolean
  created_at: string
}

// ============================================
// CONTRACT TYPES
// ============================================

export interface Contract {
  id: string
  company_id: string
  contract_number: string
  type: 'standard' | 'premium' | 'custom'
  start_date: string
  end_date: string | null
  commission_rate: number
  minimum_flights_per_month: number | null
  exclusive_territories: string[] | null
  document_url: string | null
  signed_by_company_at: string | null
  signed_by_company_name: string | null
  signed_by_admin_at: string | null
  signed_by_admin_id: string | null
  status: 'draft' | 'pending_signature' | 'active' | 'terminated'
  created_at: string
  updated_at: string
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface CompanyStatistics {
  id: string
  company_id: string
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  period_start: string
  period_end: string
  flights_created: number
  flights_booked: number
  flights_cancelled: number
  total_revenue: number
  total_commission: number
  net_revenue: number
  total_bookings: number
  total_seats_sold: number
  calculated_at: string
}

// ============================================
// INVOICE TYPES
// ============================================

export interface Invoice {
  id: string
  user_id: string | null
  company_id: string | null
  booking_id: string | null
  subscription_id: string | null
  invoice_number: string
  type: 'booking' | 'subscription' | 'commission'
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  currency: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string | null
  paid_at: string | null
  payment_method: string | null
  stripe_invoice_id: string | null
  stripe_invoice_url: string | null
  stripe_invoice_pdf: string | null
  pdf_url: string | null
  line_items: InvoiceLineItem[]
  notes: string | null
  billing_address: BillingAddress | null
  created_at: string
  updated_at: string
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

// ============================================
// FLIGHT REQUEST TYPES (from clients)
// ============================================

export type FlightRequestStatus = 'active' | 'fulfilled' | 'expired' | 'cancelled'

export interface FlightRequest {
  id: string
  user_id: string
  departure_city: string
  arrival_city: string
  departure_airport_id: string | null
  arrival_airport_id: string | null
  preferred_date: string
  date_flexibility_days: number
  preferred_time_slot: string | null
  passengers_count: number
  max_budget: number | null
  currency: string
  notes: string | null
  status: FlightRequestStatus
  expires_at: string | null
  is_visible_to_companies: boolean
  created_at: string
  updated_at: string
  // Joined data
  user?: Profile
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
