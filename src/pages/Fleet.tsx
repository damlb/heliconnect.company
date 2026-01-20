import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  Gauge,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { HELICOPTER_AMENITIES } from '@/lib/constants'
import type { Helicopter } from '@/types'

interface ContextType {
  language: 'fr' | 'en'
}

const defaultFormData = {
  registration: '',
  model: '',
  manufacturer: '',
  serial_number: '',
  passenger_capacity: '',
  luggage_capacity_kg: '',
  year_of_manufacture: '',
  max_range_km: '',
  cruise_speed_kmh: '',
  amenities: [] as string[],
  is_active: true,
}

export default function Fleet() {
  const { language } = useOutletContext<ContextType>()
  const { company } = useAuth()
  const [helicopters, setHelicopters] = useState<Helicopter[]>([])
  const [filteredHelicopters, setFilteredHelicopters] = useState<Helicopter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedHelicopter, setSelectedHelicopter] = useState<Helicopter | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState(defaultFormData)
  const [error, setError] = useState('')

  const texts = {
    fr: {
      title: 'Ma flotte',
      subtitle: 'Gérez vos hélicoptères',
      addHelicopter: 'Ajouter un hélicoptère',
      search: 'Rechercher par immatriculation, modèle...',
      noHelicopters: 'Aucun hélicoptère',
      noHelicoptersDesc: 'Ajoutez votre premier hélicoptère pour commencer',
      editHelicopter: 'Modifier l\'hélicoptère',
      newHelicopter: 'Nouvel hélicoptère',
      registration: 'Immatriculation *',
      model: 'Modèle *',
      manufacturer: 'Constructeur',
      serialNumber: 'Numéro de série',
      passengerCapacity: 'Capacité passagers *',
      luggageCapacity: 'Capacité bagages (kg)',
      yearOfManufacture: 'Année de fabrication',
      maxRange: 'Autonomie max (km)',
      cruiseSpeed: 'Vitesse de croisière (km/h)',
      amenities: 'Équipements',
      active: 'Actif',
      activeDesc: 'L\'hélicoptère peut être assigné à des vols',
      save: 'Enregistrer',
      cancel: 'Annuler',
      saving: 'Enregistrement...',
      delete: 'Supprimer',
      deleteTitle: 'Supprimer l\'hélicoptère',
      deleteDescription: 'Êtes-vous sûr de vouloir supprimer cet hélicoptère ? Cette action est irréversible.',
      passengers: 'passagers',
      activeHelicopters: 'Actifs',
      totalHelicopters: 'Total',
      totalCapacity: 'Capacité totale',
    },
    en: {
      title: 'My Fleet',
      subtitle: 'Manage your helicopters',
      addHelicopter: 'Add helicopter',
      search: 'Search by registration, model...',
      noHelicopters: 'No helicopters',
      noHelicoptersDesc: 'Add your first helicopter to get started',
      editHelicopter: 'Edit helicopter',
      newHelicopter: 'New helicopter',
      registration: 'Registration *',
      model: 'Model *',
      manufacturer: 'Manufacturer',
      serialNumber: 'Serial number',
      passengerCapacity: 'Passenger capacity *',
      luggageCapacity: 'Luggage capacity (kg)',
      yearOfManufacture: 'Year of manufacture',
      maxRange: 'Max range (km)',
      cruiseSpeed: 'Cruise speed (km/h)',
      amenities: 'Amenities',
      active: 'Active',
      activeDesc: 'Helicopter can be assigned to flights',
      save: 'Save',
      cancel: 'Cancel',
      saving: 'Saving...',
      delete: 'Delete',
      deleteTitle: 'Delete helicopter',
      deleteDescription: 'Are you sure you want to delete this helicopter? This action cannot be undone.',
      passengers: 'passengers',
      activeHelicopters: 'Active',
      totalHelicopters: 'Total',
      totalCapacity: 'Total capacity',
    },
  }

  const t = texts[language]

  useEffect(() => {
    if (company?.id) {
      fetchHelicopters()
    }
  }, [company?.id])

  useEffect(() => {
    filterHelicopters()
  }, [helicopters, searchTerm])

  const fetchHelicopters = async () => {
    if (!company?.id) return
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('helicopters')
        .select('*')
        .eq('company_id', company.id)
        .order('registration', { ascending: true })

      if (error) throw error
      setHelicopters(data || [])
    } catch (error) {
      console.error('Error fetching helicopters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterHelicopters = () => {
    if (!searchTerm) {
      setFilteredHelicopters(helicopters)
      return
    }

    const search = searchTerm.toLowerCase()
    setFilteredHelicopters(
      helicopters.filter(
        (h) =>
          h.registration?.toLowerCase().includes(search) ||
          h.model?.toLowerCase().includes(search) ||
          h.manufacturer?.toLowerCase().includes(search)
      )
    )
  }

  const handleOpenModal = (helicopter?: Helicopter) => {
    if (helicopter) {
      setSelectedHelicopter(helicopter)
      setFormData({
        registration: helicopter.registration,
        model: helicopter.model,
        manufacturer: helicopter.manufacturer || '',
        serial_number: helicopter.serial_number || '',
        passenger_capacity: helicopter.passenger_capacity.toString(),
        luggage_capacity_kg: helicopter.luggage_capacity_kg?.toString() || '',
        year_of_manufacture: helicopter.year_of_manufacture?.toString() || '',
        max_range_km: helicopter.max_range_km?.toString() || '',
        cruise_speed_kmh: helicopter.cruise_speed_kmh?.toString() || '',
        amenities: helicopter.amenities || [],
        is_active: helicopter.is_active,
      })
    } else {
      setSelectedHelicopter(null)
      setFormData(defaultFormData)
    }
    setError('')
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!company?.id) return
    if (!formData.registration || !formData.model || !formData.passenger_capacity) {
      setError(language === 'fr' ? 'Veuillez remplir tous les champs obligatoires' : 'Please fill in all required fields')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const helicopterData = {
        company_id: company.id,
        registration: formData.registration.toUpperCase(),
        model: formData.model,
        manufacturer: formData.manufacturer || null,
        serial_number: formData.serial_number || null,
        passenger_capacity: parseInt(formData.passenger_capacity),
        luggage_capacity_kg: formData.luggage_capacity_kg ? parseInt(formData.luggage_capacity_kg) : null,
        year_of_manufacture: formData.year_of_manufacture ? parseInt(formData.year_of_manufacture) : null,
        max_range_km: formData.max_range_km ? parseInt(formData.max_range_km) : null,
        cruise_speed_kmh: formData.cruise_speed_kmh ? parseInt(formData.cruise_speed_kmh) : null,
        amenities: formData.amenities,
        is_active: formData.is_active,
      }

      if (selectedHelicopter) {
        const { error } = await supabase
          .from('helicopters')
          .update(helicopterData)
          .eq('id', selectedHelicopter.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('helicopters')
          .insert(helicopterData)

        if (error) throw error
      }

      setIsModalOpen(false)
      fetchHelicopters()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedHelicopter) return

    try {
      const { error } = await supabase
        .from('helicopters')
        .delete()
        .eq('id', selectedHelicopter.id)

      if (error) throw error

      setIsDeleteDialogOpen(false)
      setSelectedHelicopter(null)
      fetchHelicopters()
    } catch (error) {
      console.error('Error deleting helicopter:', error)
    }
  }

  const toggleAmenity = (amenityValue: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityValue)
        ? prev.amenities.filter((a) => a !== amenityValue)
        : [...prev.amenities, amenityValue],
    }))
  }

  const activeCount = helicopters.filter((h) => h.is_active).length
  const totalCapacity = helicopters.reduce((sum, h) => sum + h.passenger_capacity, 0)

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
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addHelicopter}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.totalHelicopters}</p>
                <p className="text-2xl font-bold">{helicopters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.activeHelicopters}</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.totalCapacity}</p>
                <p className="text-2xl font-bold">{totalCapacity} {t.passengers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Helicopters Grid */}
      {filteredHelicopters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{t.noHelicopters}</p>
            <p className="text-gray-400 text-sm mt-1">{t.noHelicoptersDesc}</p>
            <Button className="mt-4" onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addHelicopter}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHelicopters.map((helicopter) => (
            <Card key={helicopter.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-mono">
                      {helicopter.registration}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {helicopter.manufacturer && `${helicopter.manufacturer} `}
                      {helicopter.model}
                    </p>
                  </div>
                  <Badge variant={helicopter.is_active ? 'default' : 'secondary'}>
                    {helicopter.is_active
                      ? (language === 'fr' ? 'Actif' : 'Active')
                      : (language === 'fr' ? 'Inactif' : 'Inactive')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{helicopter.passenger_capacity} {t.passengers}</span>
                    </div>
                    {helicopter.year_of_manufacture && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{helicopter.year_of_manufacture}</span>
                      </div>
                    )}
                    {helicopter.max_range_km && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Gauge className="h-4 w-4" />
                        <span>{helicopter.max_range_km} km</span>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  {helicopter.amenities && helicopter.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {helicopter.amenities.slice(0, 3).map((amenity) => {
                        const amenityInfo = HELICOPTER_AMENITIES.find((a) => a.value === amenity)
                        return (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenityInfo ? (language === 'fr' ? amenityInfo.label : amenityInfo.labelEn) : amenity}
                          </Badge>
                        )
                      })}
                      {helicopter.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{helicopter.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(helicopter)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        setSelectedHelicopter(helicopter)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedHelicopter ? t.editHelicopter : t.newHelicopter}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.registration}</Label>
                <Input
                  value={formData.registration}
                  onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                  placeholder="F-HXXX"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.model}</Label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="H125"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.manufacturer}</Label>
                <Input
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="Airbus Helicopters"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.serialNumber}</Label>
                <Input
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                />
              </div>
            </div>

            {/* Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t.passengerCapacity}</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.passenger_capacity}
                  onChange={(e) => setFormData({ ...formData, passenger_capacity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.luggageCapacity}</Label>
                <Input
                  type="number"
                  value={formData.luggage_capacity_kg}
                  onChange={(e) => setFormData({ ...formData, luggage_capacity_kg: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.yearOfManufacture}</Label>
                <Input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={formData.year_of_manufacture}
                  onChange={(e) => setFormData({ ...formData, year_of_manufacture: e.target.value })}
                />
              </div>
            </div>

            {/* Performance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.maxRange}</Label>
                <Input
                  type="number"
                  value={formData.max_range_km}
                  onChange={(e) => setFormData({ ...formData, max_range_km: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.cruiseSpeed}</Label>
                <Input
                  type="number"
                  value={formData.cruise_speed_kmh}
                  onChange={(e) => setFormData({ ...formData, cruise_speed_kmh: e.target.value })}
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <Label>{t.amenities}</Label>
              <div className="flex flex-wrap gap-2">
                {HELICOPTER_AMENITIES.map((amenity) => (
                  <Badge
                    key={amenity.value}
                    variant={formData.amenities.includes(amenity.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(amenity.value)}
                  >
                    {language === 'fr' ? amenity.label : amenity.labelEn}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base">{t.active}</Label>
                <p className="text-sm text-gray-500">{t.activeDesc}</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.saving}
                </>
              ) : (
                t.save
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
