import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  Euro,
  Receipt,
  FileCheck,
  FileClock,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import { formatDate, formatPrice } from '@/lib/utils'

interface ContextType {
  language: 'fr' | 'en'
}

interface Invoice {
  id: string
  invoice_number: string
  type: string
  total: number
  status: string
  due_date: string | null
  paid_at: string | null
  pdf_url: string | null
  stripe_invoice_pdf: string | null
  created_at: string
}

interface Contract {
  id: string
  contract_number: string
  type: string
  start_date: string
  end_date: string | null
  commission_rate: number
  document_url: string | null
  status: string
  signed_by_company_at: string | null
  created_at: string
}

export default function Documents() {
  const { language } = useOutletContext<ContextType>()
  const { company } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('invoices')

  const texts = {
    fr: {
      title: 'Documents',
      subtitle: 'Consultez vos factures et contrats',
      invoices: 'Factures',
      contracts: 'Contrats',
      search: 'Rechercher par numéro...',
      allStatus: 'Tous les statuts',
      noInvoices: 'Aucune facture',
      noInvoicesDesc: 'Vos factures apparaîtront ici',
      noContracts: 'Aucun contrat',
      noContractsDesc: 'Vos contrats apparaîtront ici',
      invoiceNumber: 'N° Facture',
      contractNumber: 'N° Contrat',
      type: 'Type',
      amount: 'Montant',
      date: 'Date',
      dueDate: 'Échéance',
      status: 'Statut',
      actions: 'Actions',
      download: 'Télécharger',
      view: 'Voir',
      pending: 'En attente',
      paid: 'Payé',
      overdue: 'En retard',
      cancelled: 'Annulé',
      draft: 'Brouillon',
      active: 'Actif',
      terminated: 'Résilié',
      pendingSignature: 'En attente de signature',
      commission: 'Commission',
      booking: 'Réservation',
      subscription: 'Abonnement',
      startDate: 'Début',
      endDate: 'Fin',
      commissionRate: 'Taux de commission',
      totalPending: 'En attente',
      totalPaid: 'Payé ce mois',
    },
    en: {
      title: 'Documents',
      subtitle: 'View your invoices and contracts',
      invoices: 'Invoices',
      contracts: 'Contracts',
      search: 'Search by number...',
      allStatus: 'All statuses',
      noInvoices: 'No invoices',
      noInvoicesDesc: 'Your invoices will appear here',
      noContracts: 'No contracts',
      noContractsDesc: 'Your contracts will appear here',
      invoiceNumber: 'Invoice #',
      contractNumber: 'Contract #',
      type: 'Type',
      amount: 'Amount',
      date: 'Date',
      dueDate: 'Due date',
      status: 'Status',
      actions: 'Actions',
      download: 'Download',
      view: 'View',
      pending: 'Pending',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      draft: 'Draft',
      active: 'Active',
      terminated: 'Terminated',
      pendingSignature: 'Pending signature',
      commission: 'Commission',
      booking: 'Booking',
      subscription: 'Subscription',
      startDate: 'Start',
      endDate: 'End',
      commissionRate: 'Commission rate',
      totalPending: 'Pending',
      totalPaid: 'Paid this month',
    },
  }

  const t = texts[language]

  useEffect(() => {
    if (company?.id) {
      fetchDocuments()
    } else {
      setIsLoading(false)
    }
  }, [company?.id])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter])

  const fetchDocuments = async () => {
    if (!company?.id) return
    setIsLoading(true)

    try {
      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      setInvoices(invoicesData || [])

      // Fetch contracts
      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      setContracts(contractsData || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = [...invoices]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((i) =>
        i.invoice_number?.toLowerCase().includes(search)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((i) => i.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  const getInvoiceStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; labelEn: string }> = {
      pending: { variant: 'outline', label: 'En attente', labelEn: 'Pending' },
      paid: { variant: 'default', label: 'Payé', labelEn: 'Paid' },
      overdue: { variant: 'destructive', label: 'En retard', labelEn: 'Overdue' },
      cancelled: { variant: 'secondary', label: 'Annulé', labelEn: 'Cancelled' },
    }

    const c = config[status] || { variant: 'outline' as const, label: status, labelEn: status }
    return (
      <Badge variant={c.variant}>
        {language === 'fr' ? c.label : c.labelEn}
      </Badge>
    )
  }

  const getContractStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; labelEn: string }> = {
      draft: { variant: 'outline', label: 'Brouillon', labelEn: 'Draft' },
      pending_signature: { variant: 'outline', label: 'En attente de signature', labelEn: 'Pending signature' },
      active: { variant: 'default', label: 'Actif', labelEn: 'Active' },
      terminated: { variant: 'secondary', label: 'Résilié', labelEn: 'Terminated' },
    }

    const c = config[status] || { variant: 'outline' as const, label: status, labelEn: status }
    return (
      <Badge variant={c.variant}>
        {language === 'fr' ? c.label : c.labelEn}
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, { fr: string; en: string }> = {
      commission: { fr: 'Commission', en: 'Commission' },
      booking: { fr: 'Réservation', en: 'Booking' },
      subscription: { fr: 'Abonnement', en: 'Subscription' },
    }
    return types[type]?.[language] || type
  }

  const pendingAmount = invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + i.total, 0)

  const thisMonthPaid = invoices
    .filter((i) => {
      if (i.status !== 'paid' || !i.paid_at) return false
      const paidDate = new Date(i.paid_at)
      const now = new Date()
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, i) => sum + i.total, 0)

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100">
                <FileClock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.totalPending}</p>
                <p className="text-2xl font-bold">{formatPrice(pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <FileCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.totalPaid}</p>
                <p className="text-2xl font-bold">{formatPrice(thisMonthPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices">
            <Receipt className="h-4 w-4 mr-2" />
            {t.invoices} ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <FileText className="h-4 w-4 mr-2" />
            {t.contracts} ({contracts.length})
          </TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 sm:max-w-xs">
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
                <SelectItem value="pending">{t.pending}</SelectItem>
                <SelectItem value="paid">{t.paid}</SelectItem>
                <SelectItem value="overdue">{t.overdue}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices List */}
          {filteredInvoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Receipt className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">{t.noInvoices}</p>
                <p className="text-gray-400 text-sm mt-1">{t.noInvoicesDesc}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t.invoiceNumber}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t.type}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t.amount}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        {t.date}
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
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Receipt className="h-5 w-5 text-primary" />
                            </div>
                            <div className="ml-3">
                              <div className="font-mono font-medium text-gray-900">
                                {invoice.invoice_number}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <Badge variant="outline">
                            {getTypeLabel(invoice.type)}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-semibold">
                          {formatPrice(invoice.total)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                          {formatDate(invoice.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {getInvoiceStatusBadge(invoice.status)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          {(invoice.pdf_url || invoice.stripe_invoice_pdf) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={invoice.pdf_url || invoice.stripe_invoice_pdf || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="mt-6">
          {contracts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">{t.noContracts}</p>
                <p className="text-gray-400 text-sm mt-1">{t.noContractsDesc}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <Card key={contract.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-mono font-semibold text-gray-900">
                              {contract.contract_number}
                            </h3>
                            {getContractStatusBadge(contract.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{t.startDate}: {formatDate(contract.start_date)}</span>
                            </div>
                            {contract.end_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{t.endDate}: {formatDate(contract.end_date)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Euro className="h-4 w-4" />
                              <span>{t.commissionRate}: {contract.commission_rate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {contract.document_url && (
                        <Button variant="outline" asChild>
                          <a
                            href={contract.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t.view}
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
