import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Ilustración */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm">
              <img
                src="/404-illustration.jpg"
                alt="Página no encontrada"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Contenido */}
          <div className="flex flex-col justify-center md:justify-start">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-block">
                  <span className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    404
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  Página no encontrada
                </h1>
                <p className="text-lg text-slate-600">
                  Lo sentimos, la ruta que buscas no existe. Parece que el camino se perdió en el camino.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  Aquí hay algunas cosas útiles:
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    Verifica que la URL sea correcta
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    Vuelve a la página anterior
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    Regresa al inicio
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Ir al inicio
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Link to="/" onClick={() => window.history.back()} className="flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    Atrás
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            ¿Necesitas ayuda? <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contacta con soporte</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
