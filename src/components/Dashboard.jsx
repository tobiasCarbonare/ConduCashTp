import { useState } from "react"
import { Car, Calculator, TrendingUp, Settings } from 'lucide-react'
import RentabilidadCalculator from "./RentabilidadCalculator.jsx"
import RegistroGanancias from "./RegistroGanancias.jsx"
import Servicios from "./Servicios.jsx"
import Principal from "./Principal.jsx"

/**
 * COMPONENTE DASHBOARD
 * 
 * Es el contenedor principal que se muestra después del login.
 * Actúa como un "hub" o menú desde donde el usuario puede acceder 
 * a las diferentes herramientas de la aplicación.
 */
export default function Dashboard() {
  // Estado para controlar qué "página" o herramienta se está visualizando actualmente
  const [currentPage, setCurrentPage] = useState("dashboard")

  // Definición de los elementos del menú principal
  const menuItems = [
    {
      id: "calculator",
      title: "Calculadora de Rentabilidad",
      description: "Calcula si un viaje es rentable proyectando costos de combustible y mantenimiento.",
      icon: Calculator,
      color: "bg-gradient-to-r from-blue-600 to-cyan-600",
    },
    {
      id: "earnings",
      title: "Registro de Ganancias",
      description: "Lleva un control diario de tus ingresos, kilometraje y gastos operativos.",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-cyan-500 to-blue-500",
    },
    {
      id: "services",
      title: "Servicios del Vehículo",
      description: "Gestiona el mantenimiento preventivo y recibe alertas de próximos servicios.",
      icon: Settings,
      color: "bg-gradient-to-r from-blue-700 to-indigo-600",
    },
  ]

  // FUNCIÓN DE RENDERIZADO CONDICIONAL: 
  // Devuelve el componente correspondiente según el ID guardado en 'currentPage'
  const renderPage = () => {
    switch (currentPage) {
      case "calculator":
        return <RentabilidadCalculator />
      case "earnings":
        return <RegistroGanancias />
      case "earnings_history":
        return <RegistroGanancias initialView="history" />
      case "services":
        return <Servicios />
      default:
        // Vista por defecto: El Panel de Control Principal (Principal.jsx)
        return <Principal onNavigate={(page) => setCurrentPage(page)} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* BARRA DE NAVEGACIÓN SUPERIOR (Sticky Header) */}
      <header className="bg-slate-800/80 backdrop-blur-sm shadow-lg border-b border-blue-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y Nombre de la App */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage("dashboard")}>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-blue-100 italic tracking-wider">TransportApp</h1>
            </div>
            <button
              onClick={async () => {
                const { supabase } = await import("../lib/supabase")
                await supabase.auth.signOut()
              }}
              className="border border-red-500/30 text-red-300 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-all text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* CONTENEDOR DE CONTENIDO DINÁMICO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón para volver atrás si no estamos en la página principal */}
        {currentPage !== "dashboard" && (
          <div className="mb-6">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="mb-4 border border-blue-600/50 text-blue-200 hover:bg-blue-700/30 hover:text-blue-100 px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2"
            >
              ← Volver al Panel Principal
            </button>
          </div>
        )}

        {/* Inyección de la vista seleccionada */}
        {renderPage()}
      </div>
    </div>
  )
}
