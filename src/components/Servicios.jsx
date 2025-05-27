import React, { useState } from "react";

const SERVICE_CONFIG = {
  vtv: {
    label: "VTV",
    getNext: () => {
      const fecha = new Date();
      fecha.setFullYear(fecha.getFullYear() + 2);
      return `Repetir el ${fecha.toLocaleDateString()}`;
    },
  },
  aceite: {
    label: "Cambio de Aceite",
    getNext: (km) => `Próximo cambio a los ${km + 10000} km`,
  },
  distribucion: {
    label: "Cambio de Distribución",
    getNext: (km) => `Próximo cambio a los ${km + 70000} km`,
  },
  frenos: {
    label: "Cambio de Frenos",
    getNext: (km) => `Próximo cambio a los ${km + 40000} km`,
  },
};

export default function Servicios() {
  const [kmActual, setKmActual] = useState("");
  const [seleccionados, setSeleccionados] = useState({});
  const [resultados, setResultados] = useState([]);

  const handleChangeServicio = (key) => {
    setSeleccionados((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const calcularServicios = () => {
    const km = parseInt(kmActual);
    if (isNaN(km)) {
      alert("Ingresá un número válido para los kilómetros.");
      return;
    }

    const resultado = Object.entries(seleccionados)
      .filter(([_, activo]) => activo)
      .map(([key]) => {
        const servicio = SERVICE_CONFIG[key];
        return {
          nombre: servicio.label,
          proximo: servicio.getNext(km),
        };
      });

    setResultados(resultado);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Registro de servicios del vehículo</h2>

      <div style={{ marginBottom: "1em" }}>
        <label>Kilometraje actual:</label>
        <input
          type="number"
          value={kmActual}
          onChange={(e) => setKmActual(e.target.value)}
          style={{ width: "100%", padding: "0.5em", marginTop: "5px" }}
        />
      </div>

      <div>
        <label>Seleccioná los servicios realizados:</label>
        <div style={{ marginTop: "5px" }}>
          {Object.entries(SERVICE_CONFIG).map(([key, { label }]) => (
            <div key={key}>
              <input
                type="checkbox"
                id={key}
                checked={!!seleccionados[key]}
                onChange={() => handleChangeServicio(key)}
              />
              <label htmlFor={key} style={{ marginLeft: "8px" }}>
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={calcularServicios}
        style={{
          marginTop: "1em",
          padding: "0.5em 1em",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Registrar Servicios
      </button>

      {resultados.length > 0 && (
        <div style={{ marginTop: "2em" }}>
          <h3>Próximos servicios:</h3>
          <ul>
            {resultados.map((r, index) => (
              <li key={index}>
                {r.nombre}: {r.proximo}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
