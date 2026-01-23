import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  HelpCircle,
  Plus,
  Search,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { TICKET_CATEGORIES, PRIORITY_LEVELS } from '@/lib/constants'
import { formatDateTime } from '@/lib/utils'

interface ContextType {
  language: 'fr' | 'en'
}

interface SupportTicket {
  id: string
  ticket_number: string
  subject: string
  category: string | null
  priority: string
  status: string
  created_at: string
  updated_at: string
  resolved_at: string | null
}

interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string | null
  message: string
  is_internal: boolean
  created_at: string
}

export default function Support() {
  const { language } = useOutletContext<ContextType>()
  const { company, profile } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('open')
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false)
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'normal',
    message: '',
  })

  const texts = {
    fr: {
      title: 'Support',
      subtitle: 'Besoin d\'aide ? Contactez notre équipe',
      newTicket: 'Nouveau ticket',
      search: 'Rechercher par numéro ou sujet...',
      open: 'Ouverts',
      closed: 'Fermés',
      all: 'Tous',
      noTickets: 'Aucun ticket',
      noTicketsDesc: 'Vous n\'avez pas encore créé de ticket',
      ticketNumber: 'N° Ticket',
      subject: 'Sujet',
      category: 'Catégorie',
      priority: 'Priorité',
      status: 'Statut',
      lastUpdate: 'Dernière mise à jour',
      createTicket: 'Créer un ticket',
      createTicketSubtitle: 'Décrivez votre problème et notre équipe vous répondra rapidement',
      subjectLabel: 'Sujet *',
      subjectPlaceholder: 'Résumez votre problème en une phrase',
      categoryLabel: 'Catégorie',
      selectCategory: 'Sélectionner une catégorie',
      priorityLabel: 'Priorité',
      messageLabel: 'Description *',
      messagePlaceholder: 'Décrivez votre problème en détail...',
      cancel: 'Annuler',
      submit: 'Envoyer',
      sending: 'Envoi...',
      viewConversation: 'Voir la conversation',
      reply: 'Répondre',
      replyPlaceholder: 'Tapez votre message...',
      ticketCreated: 'Ticket créé avec succès',
      openTickets: 'Tickets ouverts',
      avgResponseTime: 'Temps de réponse moyen',
      hours: 'heures',
      statusOpen: 'Ouvert',
      statusInProgress: 'En cours',
      statusResolved: 'Résolu',
      statusClosed: 'Fermé',
    },
    en: {
      title: 'Support',
      subtitle: 'Need help? Contact our team',
      newTicket: 'New ticket',
      search: 'Search by number or subject...',
      open: 'Open',
      closed: 'Closed',
      all: 'All',
      noTickets: 'No tickets',
      noTicketsDesc: 'You haven\'t created any tickets yet',
      ticketNumber: 'Ticket #',
      subject: 'Subject',
      category: 'Category',
      priority: 'Priority',
      status: 'Status',
      lastUpdate: 'Last update',
      createTicket: 'Create a ticket',
      createTicketSubtitle: 'Describe your issue and our team will respond quickly',
      subjectLabel: 'Subject *',
      subjectPlaceholder: 'Summarize your issue in one sentence',
      categoryLabel: 'Category',
      selectCategory: 'Select a category',
      priorityLabel: 'Priority',
      messageLabel: 'Description *',
      messagePlaceholder: 'Describe your issue in detail...',
      cancel: 'Cancel',
      submit: 'Submit',
      sending: 'Sending...',
      viewConversation: 'View conversation',
      reply: 'Reply',
      replyPlaceholder: 'Type your message...',
      ticketCreated: 'Ticket created successfully',
      openTickets: 'Open tickets',
      avgResponseTime: 'Avg response time',
      hours: 'hours',
      statusOpen: 'Open',
      statusInProgress: 'In progress',
      statusResolved: 'Resolved',
      statusClosed: 'Closed',
    },
  }

  const t = texts[language]

  useEffect(() => {
    if (company?.id) {
      fetchTickets()
    } else {
      setIsLoading(false)
    }
  }, [company?.id])

  useEffect(() => {
    filterTickets()
  }, [tickets, searchTerm, activeTab])

  const fetchTickets = async () => {
    if (!company?.id) return
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTickets = () => {
    let filtered = [...tickets]

    // Tab filter
    if (activeTab === 'open') {
      filtered = filtered.filter((t) => ['open', 'in_progress'].includes(t.status))
    } else if (activeTab === 'closed') {
      filtered = filtered.filter((t) => ['resolved', 'closed'].includes(t.status))
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.ticket_number?.toLowerCase().includes(search) ||
          t.subject?.toLowerCase().includes(search)
      )
    }

    setFilteredTickets(filtered)
  }

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('is_internal', false)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleCreateTicket = async () => {
    if (!company?.id || !profile?.id || !newTicket.subject || !newTicket.message) return
    setIsSending(true)

    try {
      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          company_id: company.id,
          user_id: profile.id,
          subject: newTicket.subject,
          category: newTicket.category || null,
          priority: newTicket.priority,
          status: 'open',
        })
        .select()
        .single()

      if (ticketError) throw ticketError

      // Create initial message
      const { error: messageError } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticket.id,
          sender_id: profile.id,
          message: newTicket.message,
          is_internal: false,
        })

      if (messageError) throw messageError

      setIsNewTicketModalOpen(false)
      setNewTicket({ subject: '', category: '', priority: 'normal', message: '' })
      fetchTickets()
    } catch (error) {
      console.error('Error creating ticket:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedTicket || !profile?.id || !newMessage.trim()) return
    setIsSending(true)

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: profile.id,
          message: newMessage.trim(),
          is_internal: false,
        })

      if (error) throw error

      setNewMessage('')
      fetchMessages(selectedTicket.id)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const openTicketDetail = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    await fetchMessages(ticket.id)
    setIsTicketDetailOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; labelEn: string; icon: any }> = {
      open: { variant: 'outline', label: 'Ouvert', labelEn: 'Open', icon: AlertCircle },
      in_progress: { variant: 'default', label: 'En cours', labelEn: 'In progress', icon: Clock },
      resolved: { variant: 'secondary', label: 'Résolu', labelEn: 'Resolved', icon: CheckCircle },
      closed: { variant: 'secondary', label: 'Fermé', labelEn: 'Closed', icon: CheckCircle },
    }

    const c = config[status] || { variant: 'outline' as const, label: status, labelEn: status, icon: HelpCircle }
    const Icon = c.icon

    return (
      <Badge variant={c.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {language === 'fr' ? c.label : c.labelEn}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { color: string; label: string; labelEn: string }> = {
      low: { color: 'bg-gray-100 text-gray-700', label: 'Basse', labelEn: 'Low' },
      normal: { color: 'bg-blue-100 text-blue-700', label: 'Normale', labelEn: 'Normal' },
      high: { color: 'bg-orange-100 text-orange-700', label: 'Haute', labelEn: 'High' },
      urgent: { color: 'bg-red-100 text-red-700', label: 'Urgente', labelEn: 'Urgent' },
    }

    const c = config[priority] || { color: 'bg-gray-100 text-gray-700', label: priority, labelEn: priority }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>
        {language === 'fr' ? c.label : c.labelEn}
      </span>
    )
  }

  const openCount = tickets.filter((t) => ['open', 'in_progress'].includes(t.status)).length

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
        <Button onClick={() => setIsNewTicketModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.newTicket}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <MessageCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.openTickets}</p>
                <p className="text-2xl font-bold">{openCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.avgResponseTime}</p>
                <p className="text-2xl font-bold">{"<"} 24 {t.hours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="open">{t.open} ({openCount})</TabsTrigger>
            <TabsTrigger value="closed">{t.closed}</TabsTrigger>
            <TabsTrigger value="all">{t.all}</TabsTrigger>
          </TabsList>

          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <HelpCircle className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">{t.noTickets}</p>
                <p className="text-gray-400 text-sm mt-1">{t.noTicketsDesc}</p>
                <Button className="mt-4" onClick={() => setIsNewTicketModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.newTicket}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openTicketDetail(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-gray-500">
                            #{ticket.ticket_number}
                          </span>
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <h3 className="font-medium text-gray-900 truncate">
                          {ticket.subject}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {t.lastUpdate}: {formatDateTime(ticket.updated_at)}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Ticket Modal */}
      <Dialog open={isNewTicketModalOpen} onOpenChange={setIsNewTicketModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.createTicket}</DialogTitle>
            <p className="text-sm text-gray-500">{t.createTicketSubtitle}</p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.subjectLabel}</Label>
              <Input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder={t.subjectPlaceholder}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.categoryLabel}</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {language === 'fr' ? cat.label : cat.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t.priorityLabel}</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {language === 'fr' ? p.label : p.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.messageLabel}</Label>
              <Textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                placeholder={t.messagePlaceholder}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTicketModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={isSending || !newTicket.subject || !newTicket.message}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.sending}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t.submit}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Detail Modal */}
      <Dialog open={isTicketDetailOpen} onOpenChange={setIsTicketDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-gray-500">
                #{selectedTicket?.ticket_number}
              </span>
              {selectedTicket && getStatusBadge(selectedTicket.status)}
            </div>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-[300px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender_id === profile?.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_id === profile?.id ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatDateTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply input */}
          {selectedTicket && ['open', 'in_progress'].includes(selectedTicket.status) && (
            <div className="flex gap-2 pt-4 border-t">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t.replyPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
