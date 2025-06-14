import { useState } from "react"
import { Car, Calculator, TrendingUp, Settings } from 'lucide-react'
import RentabilidadCalculator from "./RentabilidadCalculator.jsx"
import RegistroGanancias from "./RegistroGanancias.jsx"
import Servicios from "./Servicios.jsx"

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const menuItems = [
    {
      id: "calculator",
      title: "Calculadora de Rentabilidad",
      description: "Calcula si un viaje es rentable",
      icon: Calculator,
      color: "bg-gradient-to-r from-blue-600 to-cyan-600",
    },
    {
      id: "earnings",
      title: "Registro de Ganancias",
      description: "Registra y analiza tus ganancias",
      icon: TrendingUp,
      color: "bg-gradient-to-r from-cyan-500 to-blue-500",
    },
    {
      id: "services",
      title: "Servicios del Vehículo",
      description: "Gestiona el mantenimiento",
      icon: Settings,
      color: "bg-gradient-to-r from-blue-700 to-indigo-600",
    },
  ]

  const renderPage = () => {
    switch (currentPage) {
      case "calculator":
        return <RentabilidadCalculator />
      case "earnings":
        return <RegistroGanancias />
      case "services":
        return <Servicios />
      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-blue-100 mb-2">¡Bienvenido a tu Panel de Control!</h2>
              <p className="text-blue-200/80 text-lg">
                Selecciona una opción para comenzar a gestionar tu negocio de transporte.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm hover:bg-slate-800/80 rounded-lg p-6"
                  onClick={() => setCurrentPage(item.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${item.color} p-3 rounded-xl shadow-lg`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl text-blue-100 font-semibold">{item.title}</h3>
                      <p className="text-blue-200/70">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <header className="bg-slate-800/80 backdrop-blur-sm shadow-lg border-b border-blue-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-blue-100">TransportApp</h1>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="border border-blue-600/50 text-blue-200 hover:bg-blue-700/30 hover:text-blue-100 px-4 py-2 rounded-lg transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage !== "dashboard" && (
          <div className="mb-6">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="mb-4 border border-blue-600/50 text-blue-200 hover:bg-blue-700/30 hover:text-blue-100 px-4 py-2 rounded-lg transition-all"
            >
              ← Volver al Panel Principal
            </button>
          </div>
        )}

        {renderPage()}
      </div>
    </div>
  )
}
