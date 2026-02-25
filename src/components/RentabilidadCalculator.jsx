"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import mapboxgl from "mapbox-gl"
import { Info } from 'lucide-react'

/**
 * INTEGRACIÓN CON MAPBOX
 * 
 * Se configura el token de acceso para utilizar los servicios de Mapbox 
 * (Geocoding para sugerencias y Directions para rutas).
 */
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

/**
 * COMPONENTE CALCULADORA DE RENTABILIDAD
 * 
 * Este módulo utiliza APIs externas para calcular la distancia real por carretera
 * entre dos puntos y determinar si el precio de un viaje cubre los costos operativos.
 */
export default function RentabilidadCalculator() {
  // Estados de los inputs y búsqueda
  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState("")
  const [precio, setPrecio] = useState("")
  const [precioKm, setPrecioKm] = useState("750") // Costo base por defecto

  // Estados para el motor de búsqueda (Geocoding API)
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState([])
  const [sugerenciasDestino, setSugerenciasDestino] = useState([])

  // Coordenadas [lng, lat] obtenidas de la búsqueda
  const [coordOrigen, setCoordOrigen] = useState(null)
  const [coordDestino, setCoordDestino] = useState(null)

  const [error, setError] = useState("")
  const [resultado, setResultado] = useState(null)

  // Referencias para el control del mapa de Mapbox GL JS
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [routeGeoJSON, setRouteGeoJSON] = useState(null)

  // INICIALIZACIÓN DEL MAPA: Se ejecuta una sola vez al montar el componente
  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11", // Estilo oscuro para UI premium
      center: [-58.4173, -34.6118], // Buenos Aires como centro por defecto
      zoom: 10,
    })
  }, [])

  // RENDERIZADO DE LA RUTA: Se dispara cada vez que cambia el GeoJSON de la ruta calculada
  useEffect(() => {
    if (!map.current || !routeGeoJSON) return

    // Limpiar capas previas antes de dibujar la nueva
    if (map.current.getSource("route")) {
      map.current.removeLayer("route")
      map.current.removeSource("route")
    }

    // Agregar la fuente de datos GeoJSON (la línea del camino)
    map.current.addSource("route", {
      type: "geojson",
      data: routeGeoJSON,
    })

    // Definir el estilo visual de la línea azul en el mapa
    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3b82f6",
        "line-width": 5,
        "line-opacity": 0.75,
      },
    })

    // FIT BOUNDS: Ajusta el zoom del mapa para que el viaje completo quepa en pantalla
    const coords = routeGeoJSON.features[0].geometry.coordinates
    const bounds = coords.reduce(
      (bounds, coord) => bounds.extend(coord),
      new mapboxgl.LngLatBounds(coords[0], coords[0]),
    )

    map.current.fitBounds(bounds, { padding: 50 })
  }, [routeGeoJSON])

  /**
   * FUNCIÓN: Buscar Direcciones (Autocompletado)
   * Llama a la Geocoding API de Mapbox para obtener sugerencias de texto a coordenadas.
   */
  const handleOrigenChange = async (e) => {
    const value = e.target.value
    setOrigen(value)
    if (value.length > 2) {
      try {
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json`, {
          params: {
            access_token: mapboxgl.accessToken,
            country: "ar",
          },
        })
        setSugerenciasOrigen(response.data.features)
      } catch (err) {
        console.error("Error fetching origin suggestions:", err)
      }
    } else {
      setSugerenciasOrigen([])
    }
  }

  const handleDestinoChange = async (e) => {
    const value = e.target.value
    setDestino(value)
    if (value.length > 2) {
      try {
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json`, {
          params: {
            access_token: mapboxgl.accessToken,
            country: "ar",
          },
        })
        setSugerenciasDestino(response.data.features)
      } catch (err) {
        console.error("Error fetching destination suggestions:", err)
      }
    } else {
      setSugerenciasDestino([])
    }
  }

  // Funciones para confirmar la selección de una sugerencia de búsqueda
  const selectOrigen = (suggestion) => {
    setOrigen(suggestion.place_name)
    setCoordOrigen(suggestion.geometry.coordinates)
    setSugerenciasOrigen([])
  }

  const selectDestino = (suggestion) => {
    setDestino(suggestion.place_name)
    setCoordDestino(suggestion.geometry.coordinates)
    setSugerenciasDestino([])
  }

  /**
   * FUNCIÓN NÚCLEO: Calcular Ruta y Rentabilidad
   * 1. Llama a la Directions API para obtener la distancia real por calle.
   * 2. Calcula el costo del viaje según el precio por KM.
   * 3. Compara el precio ingresado con el costo calculado.
   */
  const calcularDistancia = async () => {
    setError("")
    setResultado(null)
    setRouteGeoJSON(null)

    if (!coordOrigen || !coordDestino) {
      setError("Por favor selecciona origen y destino válidos de las sugerencias.")
      return
    }

    const numericPrecio = precio === "" ? null : Number.parseFloat(precio)

    try {
      // LLAMADA A DIRECTIONS API (Driving mode)
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordOrigen[0]},${coordOrigen[1]};${coordDestino[0]},${coordDestino[1]}`
      const directionsResponse = await axios.get(directionsUrl, {
        params: {
          access_token: mapboxgl.accessToken,
          geometries: "geojson",
          overview: "full",
        },
      })

      if (!directionsResponse.data.routes || directionsResponse.data.routes.length === 0) {
        setError("No se pudo calcular la ruta entre los puntos seleccionados.")
        return
      }

      const ruta = directionsResponse.data.routes[0]
      const distanciaKm = ruta.distance / 1000
      const precioRequerido = distanciaKm * parseFloat(precioKm)

      // Establecer los resultados para mostrar en la interfaz
      setResultado({
        esRentable: numericPrecio !== null ? numericPrecio >= precioRequerido : null,
        isEstimation: numericPrecio === null,
        distancia: distanciaKm.toFixed(2),
        precioRequerido: precioRequerido.toFixed(2),
        precioEstimado: precioRequerido.toFixed(2),
      })

      // Preparar el GeoJSON para el efecto del mapa
      setRouteGeoJSON({
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: ruta.geometry, properties: {} }],
      })

      // MAREKRS: Añadir punteros de inicio y fin en el mapa (Verde y Rojo)
      if (window.markerOrigen) window.markerOrigen.remove()
      if (window.markerDestino) window.markerDestino.remove()

      window.markerOrigen = new mapboxgl.Marker({ color: "#10b981" }).setLngLat(coordOrigen).addTo(map.current)
      window.markerDestino = new mapboxgl.Marker({ color: "#ef4444" }).setLngLat(coordDestino).addTo(map.current)

    } catch (err) {
      console.error(err)
      setError("Ocurrió un error al calcular la distancia")
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div>
        <h2 className="text-3xl font-bold text-blue-100 mb-2">Calculadora de Rentabilidad</h2>
        <p className="text-blue-200/80 text-lg">
          Calcula si un viaje es rentable basado en la distancia real y el precio ofrecido.
        </p>
      </div>

      <div className="bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-blue-100 text-xl mb-4 italic font-medium">Parámetros del cálculo</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Origen con buscador dinámico */}
            <div className="space-y-2 relative">
              <label className="text-blue-200 font-medium">Dirección de Origen</label>
              <input
                placeholder="Ej: Av. Rivadavia 1234, CABA"
                value={origen}
                onChange={handleOrigenChange}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/40 rounded-lg focus:border-blue-400 focus:outline-none"
              />
              {sugerenciasOrigen.length > 0 && (
                <ul className="absolute z-10 w-full bg-slate-700 border border-blue-600/50 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-2xl">
                  {sugerenciasOrigen.map((sug) => (
                    <li key={sug.id} onClick={() => selectOrigen(sug)} className="p-3 text-blue-100 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-b-0">
                      {sug.place_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Input Destino con buscador dinámico */}
            <div className="space-y-2 relative">
              <label className="text-blue-200 font-medium">Dirección de Destino</label>
              <input
                placeholder="Ej: Calle 50, La Plata"
                value={destino}
                onChange={handleDestinoChange}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/40 rounded-lg focus:border-blue-400 focus:outline-none"
              />
              {sugerenciasDestino.length > 0 && (
                <ul className="absolute z-10 w-full bg-slate-700 border border-blue-600/50 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-2xl">
                  {sugerenciasDestino.map((sug) => (
                    <li key={sug.id} onClick={() => selectDestino(sug)} className="p-3 text-blue-100 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-b-0">
                      {sug.place_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Configuración de Precios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <label className="text-blue-200 font-medium">Precio Ofrecido (ARS)</label>
              </div>
              <input
                type="number"
                placeholder="Si lo dejas vacío, te daremos el sugerido"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 rounded-lg focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-blue-200 font-medium">Tu Costo por KM (ARS)</label>
              <input
                type="number"
                value={precioKm}
                onChange={(e) => setPrecioKm(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 rounded-lg focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={calcularDistancia}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg"
          >
            {precio === "" ? "GENERAR ESTIMACIÓN DE PRECIO" : "EVALUAR RENTABILIDAD"}
          </button>
        </div>
      </div>

      {/* RESULTADO VISUAL */}
      {resultado && (
        <div className="bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-xl font-bold">{resultado.isEstimation ? "Resultado de Estimación" : "Resultado de Análisis"}</h3>
            <div className="px-3 py-1 bg-blue-900/50 border border-blue-500 rounded-full text-blue-300 text-xs font-black uppercase tracking-widest">{resultado.distancia} KM RECORRIDOS</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/40 rounded-xl border border-blue-600/20">
              <span className="block text-blue-300/50 text-xs font-black uppercase mb-1">Costo Operativo Mínimo</span>
              <span className="text-2xl font-black text-white">$ {resultado.precioRequerido}</span>
            </div>
            {!resultado.isEstimation && (
              <div className={`p-4 rounded-xl border ${resultado.esRentable ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"}`}>
                <span className="block text-blue-300/50 text-xs font-black uppercase mb-1">Estado del Viaje</span>
                <span className={`text-2xl font-black ${resultado.esRentable ? "text-green-400" : "text-red-400"}`}>
                  {resultado.esRentable ? "¡ES RENTABLE!" : "NO ES RENTABLE"}
                </span>
              </div>
            )}
            {resultado.isEstimation && (
              <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-500/30">
                <span className="block text-blue-300/50 text-xs font-black uppercase mb-1">Precio Sugerido Final</span>
                <span className="text-2xl font-black text-blue-400">$ {resultado.precioEstimado}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAPA VISUAL CON LA RUTA SELECCIONADA */}
      <div className="bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-blue-100 text-xl font-medium mb-4 italic">Visualización del Recorrido</h3>
        <div ref={mapContainer} className="w-full h-96 rounded-lg border border-blue-600/30 shadow-inner" />
      </div>
    </div>
  )
}
