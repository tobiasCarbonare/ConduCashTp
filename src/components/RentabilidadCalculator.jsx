import { useState } from "react"

export default function RentabilidadCalculator() {
  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState("")
  const [precio, setPrecio] = useState("")
  const [resultado, setResultado] = useState(null)

  const calcularRentabilidad = () => {
    const distanciaSimulada = Math.random() * 50 + 5
    const precioRequerido = distanciaSimulada * 750
    const precioIngresado = parseFloat(precio)

    setResultado({
      distancia: distanciaSimulada.toFixed(2),
      precioRequerido: precioRequerido.toFixed(2),
      esRentable: precioIngresado >= precioRequerido,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-blue-100 mb-2">Calculadora de Rentabilidad de Viaje</h2>
        <p className="text-blue-200/80 text-lg">
          Calcula si un viaje es rentable basado en la distancia y el precio ofrecido.
        </p>
      </div>

      <div className="bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-blue-100 text-xl mb-4">Datos del Viaje</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-blue-200 font-medium">Origen</label>
              <input
                placeholder="Dirección de origen"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/60 rounded-lg focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-blue-200 font-medium">Destino</label>
              <input
                placeholder="Dirección de destino"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/60 rounded-lg focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-blue-200 font-medium">Precio del Viaje (ARS)</label>
            <input
              type="number"
              placeholder="Ej: 5000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/60 rounded-lg focus:border-blue-400 focus:outline-none"
            />
          </div>
          <button
            onClick={calcularRentabilidad}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Calcular Rentabilidad
          </button>
        </div>
      </div>

      {resultado && (
        <div className="bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-blue-100 text-xl mb-4">Resultados</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
              <span className="text-blue-200">Distancia del Viaje:</span>
              <span className="font-semibold text-blue-100">{resultado.distancia} km</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
              <span className="text-blue-200">Precio Requerido (mínimo):</span>
              <span className="font-semibold text-blue-100">ARS {resultado.precioRequerido}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-700/40 to-slate-600/40 rounded-lg border border-blue-600/30">
              <span className="text-blue-200 text-lg">Rentabilidad:</span>
              <span className={`font-bold text-lg ${resultado.esRentable ? "text-green-400" : "text-red-400"}`}>
                {resultado.esRentable ? "¡Rentable!" : "No Rentable"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}