import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Overlay bleu profond avec opacité */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1D51]/95 via-[#1a365d]/90 to-[#2d4a7c]/95 z-10"></div>

      {/* Vidéo d'hélicoptère en arrière-plan */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover blur-sm"
        >
          <source src="/videos/helicopter-flight.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Contenu */}
      <div className="max-w-md w-full relative z-20">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/images/logo-white.svg"
            alt="HeliConnect"
            className="h-24 w-24 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            HeliConnect
          </h1>
          <p className="text-[#D4AF64]">
            Espace Compagnies - Gérez vos vols
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-[#0B1D51] mb-6 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Connexion
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1D51] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@compagnie.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1D51] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4AF64] focus:outline-none transition-colors"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#D4AF64] to-[#C99846] text-[#0B1D51] py-3 px-4 rounded-xl font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Pas encore de compte ?{' '}
              <a
                href="https://heliconnect.fr#contact"
                className="text-[#D4AF64] hover:text-[#C99846] font-semibold transition-colors"
              >
                Contactez-nous
              </a>
            </p>
          </div>

          <div className="mt-4 text-center">
            <a
              href="https://heliconnect.fr"
              className="text-sm text-gray-500 hover:text-[#D4AF64] transition-colors"
            >
              ← Retour au site
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200/80 text-sm mt-6">
          © 2024 HeliConnect. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
