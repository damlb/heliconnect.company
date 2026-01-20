import { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'

// Ce composant vérifie périodiquement si une nouvelle version est disponible
// en comparant le hash du fichier index.html actuel avec celui du serveur

export default function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [initialHash, setInitialHash] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer le hash initial au chargement
    const getHash = async () => {
      try {
        const response = await fetch('/', { cache: 'no-store' })
        const text = await response.text()
        // Créer un hash simple basé sur la longueur et quelques caractères
        const hash = `${text.length}-${text.slice(100, 150)}`
        return hash
      } catch {
        return null
      }
    }

    // Stocker le hash initial
    getHash().then(hash => {
      if (hash) setInitialHash(hash)
    })

    // Vérifier périodiquement (toutes les 30 secondes)
    const interval = setInterval(async () => {
      if (!initialHash) return

      const currentHash = await getHash()
      if (currentHash && currentHash !== initialHash) {
        setShowBanner(true)
        clearInterval(interval) // Arrêter de vérifier une fois détecté
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [initialHash])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleDismiss = () => {
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin-slow" />
          <p className="text-sm font-medium">
            Une nouvelle version est disponible ! Rafraîchissez la page pour bénéficier des dernières mises à jour.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white text-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Rafraîchir
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-red-500 rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
