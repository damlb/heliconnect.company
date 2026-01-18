import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in EUR
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

// Format date in French
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: fr })
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy HH:mm', { locale: fr })
}

// Format date long (e.g., "15 janvier 2025")
export function formatDateLong(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMMM yyyy', { locale: fr })
}

// Format time only
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm', { locale: fr })
}

// Format duration in minutes to human readable
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

// Generate booking reference
export function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'HEL-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Flight status colors
export const flightStatusColors: Record<string, { bg: string; text: string }> = {
  available: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  booked: { bg: 'bg-blue-100', text: 'text-blue-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  expired: { bg: 'bg-orange-100', text: 'text-orange-700' },
}

// Booking status colors
export const bookingStatusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  paid: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  refunded: { bg: 'bg-purple-100', text: 'text-purple-700' },
}

// Status labels in French
export const flightStatusLabels: Record<string, string> = {
  available: 'Disponible',
  booked: 'Réservé',
  cancelled: 'Annulé',
  completed: 'Terminé',
  expired: 'Expiré',
}

export const bookingStatusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  paid: 'Payé',
  cancelled: 'Annulé',
  completed: 'Terminé',
  refunded: 'Remboursé',
}
