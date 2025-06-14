"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import mapboxgl from "mapbox-gl"

// Configurar el token de Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoiNDI4OTk3NDciLCJhIjoiY21iNm5qOGZ0MDFubDJycGxyaW03MTN0YSJ9.KiujcKaRF9ED2we6H3-GAw"

export default function RentabilidadCalculator() {
  // Estados del componente
  const [origen, setOrigen] = useState("")
  const [destino, setDestino] = useState("")
  const [precio, setPrecio] = useState("")
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState([])
  const [sugerenciasDestino, setSugerenciasDestino] = useState([])
  const [coordOrigen, setCoordOrigen] = useState(null)
  const [coordDestino, setCoordDestino] = useState(null)
  const [error, setError] = useState("")
  const [resultado, setResultado] = useState(null)

  // Referencias para el mapa
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [routeGeoJSON, setRouteGeoJSON] = useState(null)

  // Inicializar el mapa solo una vez
  useEffect(() => {
    if (map.current) return // evitar reinicializar

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11", // Usar tema oscuro para que combine
      center: [-58.4173, -34.6118], // centro inicial (Buenos Aires)
      zoom: 10,
    })
  }, [])

  // Efecto para mostrar la ruta en el mapa
  useEffect(() => {
    if (!map.current || !routeGeoJSON) return

    // Si la capa ya existe, removerla para refrescar
    if (map.current.getSource("route")) {
      map.current.removeLayer("route")
      map.current.removeSource("route")
    }

    map.current.addSource("route", {
      type: "geojson",
      data: routeGeoJSON,
    })

    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#3b82f6", // Azul para que combine con el tema
        "line-width": 5,
        "line-opacity": 0.75,
      },
    })

    // Ajustar el mapa para mostrar toda la ruta
    const coords = routeGeoJSON.features[0].geometry.coordinates
    const bounds = coords.reduce(
      (bounds, coord) => bounds.extend(coord),
      new mapboxgl.LngLatBounds(coords[0], coords[0]),
    )

    map.current.fitBounds(bounds, {
      padding: 50,
    })
  }, [routeGeoJSON])

  // Manejar cambios en el input de origen
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

  // Manejar cambios en el input de destino
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

  // Seleccionar origen de las sugerencias
  const selectOrigen = (suggestion) => {
    setOrigen(suggestion.place_name)
    setCoordOrigen(suggestion.geometry.coordinates)
    setSugerenciasOrigen([])
  }

  // Seleccionar destino de las sugerencias
  const selectDestino = (suggestion) => {
    setDestino(suggestion.place_name)
    setCoordDestino(suggestion.geometry.coordinates)
    setSugerenciasDestino([])
  }

  // Calcular distancia real usando la API de Mapbox
  const calcularDistancia = async () => {
    setError("")
    setResultado(null)
    setRouteGeoJSON(null)

    if (!coordOrigen || !coordDestino) {
      setError("Por favor selecciona origen y destino válidos de las sugerencias.")
      return
    }

    // Asegurar que el precio es un número
    const numericPrecio = Number.parseFloat(precio)
    if (isNaN(numericPrecio) || numericPrecio <= 0) {
      setError("Por favor ingresa un precio válido.")
      return
    }

    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordOrigen[0]},${coordOrigen[1]};${coordDestino[0]},${coordDestino[1]}`,
        {
          params: {
            access_token: mapboxgl.accessToken,
            geometries: "geojson",
            overview: "full",
          },
        },
      )

      if (!response.data.routes || response.data.routes.length === 0) {
        setError("No se pudo calcular la ruta entre los puntos seleccionados.")
        return
      }

      const ruta = response.data.routes[0]
      const distanciaMetros = ruta.distance
      const distanciaKm = distanciaMetros / 1000
      const precioRequerido = distanciaKm * 750

      setResultado({
        esRentable: numericPrecio >= precioRequerido,
        distancia: distanciaKm.toFixed(2),
        precioRequerido: precioRequerido.toFixed(2),
      })

      // Guardar la ruta para mostrar en el mapa
      setRouteGeoJSON({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: ruta.geometry,
            properties: {},
          },
        ],
      })

      // Remover marcadores previos
      if (window.markerOrigen) window.markerOrigen.remove()
      if (window.markerDestino) window.markerDestino.remove()

      // Agregar nuevos marcadores
      window.markerOrigen = new mapboxgl.Marker({ color: "#10b981" }) // Verde
        .setLngLat(coordOrigen)
        .addTo(map.current)

      window.markerDestino = new mapboxgl.Marker({ color: "#ef4444" }) // Rojo
        .setLngLat(coordDestino)
        .addTo(map.current)
    } catch (err) {
      console.error(err)
      setError("Ocurrió un error al calcular la distancia")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-blue-100 mb-2">Calculadora de Rentabilidad de Viaje</h2>
        <p className="text-blue-200/80 text-lg">
          Calcula si un viaje es rentable basado en la distancia real y el precio ofrecido.
        </p>
      </div>

      <div className="bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-blue-100 text-xl mb-4">Datos del Viaje</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input de Origen */}
            <div className="space-y-2 relative">
              <label className="text-blue-200 font-medium">Origen</label>
              <input
                placeholder="Ingresa la dirección de origen"
                value={origen}
                onChange={handleOrigenChange}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/60 rounded-lg focus:border-blue-400 focus:outline-none"
              />
              {sugerenciasOrigen.length > 0 && (
                <ul className="absolute z-10 w-full bg-slate-700 border border-blue-600/50 rounded-lg mt-1 max-h-40 overflow-y-auto">
                  {sugerenciasOrigen.map((sug) => (
                    <li
                      key={sug.id}
                      onClick={() => selectOrigen(sug)}
                      className="p-3 text-blue-100 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-b-0"
                    >
                      {sug.place_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Input de Destino */}
            <div className="space-y-2 relative">
              <label className="text-blue-200 font-medium">Destino</label>
              <input
                placeholder="Ingresa la dirección de destino"
                value={destino}
                onChange={handleDestinoChange}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/60 rounded-lg focus:border-blue-400 focus:outline-none"
              />
              {sugerenciasDestino.length > 0 && (
                <ul className="absolute z-10 w-full bg-slate-700 border border-blue-600/50 rounded-lg mt-1 max-h-40 overflow-y-auto">
                  {sugerenciasDestino.map((sug) => (
                    <li
                      key={sug.id}
                      onClick={() => selectDestino(sug)}
                      className="p-3 text-blue-100 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-b-0"
                    >
                      {sug.place_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Input de Precio */}
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

          {/* Botón de Calcular */}
          <button
            onClick={calcularDistancia}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Calcular Rentabilidad
          </button>
        </div>
      </div>

      {/* Mostrar Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Mostrar Resultados */}
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

      {/* Contenedor del Mapa */}
      <div className="bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-blue-100 text-xl mb-4">Mapa de la Ruta</h3>
        <div ref={mapContainer} className="w-full h-96 rounded-lg border border-blue-600/30" />
      </div>
    </div>
  )
}
