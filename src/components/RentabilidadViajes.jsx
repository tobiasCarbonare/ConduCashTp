import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import '../css/Rentabilidad.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiNDI4OTk3NDciLCJhIjoiY21iNm5qOGZ0MDFubDJycGxyaW03MTN0YSJ9.KiujcKaRF9ED2we6H3-GAw'; // Make sure this is your actual Mapbox token

const RentabilidadViaje = () => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [precio, setPrecio] = useState(''); // Assuming 'precio' is a number, you might want to parse it later
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState([]);
  const [coordOrigen, setCoordOrigen] = useState(null);
  const [coordDestino, setCoordDestino] = useState(null);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);

  // Initialize the map only once
  useEffect(() => {
    if (map.current) return; // avoid reinicializar

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-58.4173, -34.6118], // initial center (e.g., Buenos Aires)
      zoom: 10,
    });
  }, []);

  useEffect(() => {
    if (!map.current || !routeGeoJSON) return;

    // If the layer already exists, remove it to refresh
    if (map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }

    map.current.addSource('route', {
      type: 'geojson',
      data: routeGeoJSON,
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75,
      },
    });

    // Fit the map to show the entire route
    const coords = routeGeoJSON.features[0].geometry.coordinates;
    const bounds = coords.reduce(function (bounds, coord) {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coords[0], coords[0]));

    map.current.fitBounds(bounds, {
      padding: 50,
    });
  }, [routeGeoJSON]);

  // Handle changes for origin and destination inputs
  const handleOrigenChange = async (e) => {
    const value = e.target.value;
    setOrigen(value);
    if (value.length > 2) { // Fetch suggestions after 2 characters
      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json`,
          {
            params: {
              access_token: mapboxgl.accessToken,
              country: 'ar', // Limit to Argentina, adjust if needed
            },
          }
        );
        setSugerenciasOrigen(response.data.features);
      } catch (err) {
        console.error("Error fetching origin suggestions:", err);
      }
    } else {
      setSugerenciasOrigen([]);
    }
  };

  const handleDestinoChange = async (e) => {
    const value = e.target.value;
    setDestino(value);
    if (value.length > 2) {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json`,
          {
            params: {
              access_token: mapboxgl.accessToken,
              country: 'ar', // Limit to Argentina, adjust if needed
            },
          }
        );
        setSugerenciasDestino(response.data.features);
      } catch (err) {
        console.error("Error fetching destination suggestions:", err);
      }
    } else {
      setSugerenciasDestino([]);
    }
  };

  const selectOrigen = (suggestion) => {
    setOrigen(suggestion.place_name);
    setCoordOrigen(suggestion.geometry.coordinates);
    setSugerenciasOrigen([]); // Clear suggestions after selection
  };

  const selectDestino = (suggestion) => {
    setDestino(suggestion.place_name);
    setCoordDestino(suggestion.geometry.coordinates);
    setSugerenciasDestino([]); // Clear suggestions after selection
  };

  const calcularDistancia = async () => {
    setError('');
    setResultado(null);
    setRouteGeoJSON(null);

    if (!coordOrigen || !coordDestino) {
      setError('Por favor selecciona origen y destino válidos de las sugerencias.');
      return;
    }
    
    // Ensure precio is a number
    const numericPrecio = parseFloat(precio);
    if (isNaN(numericPrecio) || numericPrecio <= 0) {
      setError('Por favor ingresa un precio válido.');
      return;
    }


    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordOrigen[0]},${coordOrigen[1]};${coordDestino[0]},${coordDestino[1]}`,
        {
          params: {
            access_token: mapboxgl.accessToken, // Use the correct access token variable
            geometries: 'geojson',
            overview: 'full',
          },
        }
      );

      if (!response.data.routes || response.data.routes.length === 0) {
        setError('No se pudo calcular la ruta entre los puntos seleccionados.');
        return;
      }

      const ruta = response.data.routes[0];
      const distanciaMetros = ruta.distance;
      const distanciaKm = distanciaMetros / 1000;
      const precioRequerido = distanciaKm * 750;

      setResultado({
        esRentable: numericPrecio >= precioRequerido, // Use numericPrecio here
        distancia: distanciaKm.toFixed(2),
        precioRequerido: precioRequerido.toFixed(2),
      });

      // Save the route to display on the map
      setRouteGeoJSON({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: ruta.geometry,
            properties: {},
          },
        ],
      });

      // Optional: remove previous markers
      if (window.markerOrigen) window.markerOrigen.remove();
      if (window.markerDestino) window.markerDestino.remove();

      window.markerOrigen = new mapboxgl.Marker({ color: 'green' })
        .setLngLat(coordOrigen)
        .addTo(map.current);

      window.markerDestino = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(coordDestino)
        .addTo(map.current);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al calcular la distancia');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Calculadora de Rentabilidad de Viaje</h1>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="origen" style={{ display: 'block', marginBottom: '5px' }}>Origen:</label>
        <input
          id="origen"
          type="text"
          value={origen}
          onChange={handleOrigenChange}
          placeholder="Ingresa la dirección de origen"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        {sugerenciasOrigen.length > 0 && (
          <ul style={{ listStyleType: 'none', padding: 0, border: '1px solid #eee', maxHeight: '150px', overflowY: 'auto', background: '#fff', borderRadius: '4px' }}>
            {sugerenciasOrigen.map((sug) => (
              <li
                key={sug.id}
                onClick={() => selectOrigen(sug)}
                style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
              >
                {sug.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="destino" style={{ display: 'block', marginBottom: '5px' }}>Destino:</label>
        <input
          id="destino"
          type="text"
          value={destino}
          onChange={handleDestinoChange}
          placeholder="Ingresa la dirección de destino"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        {sugerenciasDestino.length > 0 && (
          <ul style={{ listStyleType: 'none', padding: 0, border: '1px solid #eee', maxHeight: '150px', overflowY: 'auto', background: '#fff', borderRadius: '4px' }}>
            {sugerenciasDestino.map((sug) => (
              <li
                key={sug.id}
                onClick={() => selectDestino(sug)}
                style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
              >
                {sug.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="precio" style={{ display: 'block', marginBottom: '5px' }}>Precio del Viaje (ARS):</label>
        <input
          id="precio"
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Ej: 5000"
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <button
        onClick={calcularDistancia}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Calcular Rentabilidad
      </button>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      {resultado && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2>Resultados:</h2>
          <p>Distancia del Viaje: <strong>{resultado.distancia} km</strong></p>
          <p>Precio Requerido (mínimo para ser rentable): <strong>ARS {resultado.precioRequerido}</strong></p>
          <p>Rentabilidad: {' '}
            <strong style={{ color: resultado.esRentable ? 'green' : 'red' }}>
              {resultado.esRentable ? '¡Rentable!' : 'No Rentable'}
            </strong>
          </p>
        </div>
      )}

      <div
        ref={mapContainer}
        style={{ width: '100%', height: '400px', marginTop: '20px', borderRadius: '8px' }}
      />
    </div>
  );
};

export default RentabilidadViaje;