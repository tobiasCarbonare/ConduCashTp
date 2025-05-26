import '../css/Registro.css';

import  { useState } from 'react';

function RegistroGanancias() {
 
  
  // 1. Definir el estado inicial del formulario de forma separada
  const initialFormState = {
    ganancias: '',
    viajes: '',
    kms: '',
    horas: '',
    gananciasExtras: '',
    combustible: '',
    gastosVarios: ''
  };

  const [formulario, setFormulario] = useState(initialFormState); // Usamos el estado inicial
  const [resultado, setResultado] = useState(null);
   const isFormIncomplete = Object.values(formulario).some(value => value === "");
   

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const ganancias = parseFloat(formulario.ganancias) || 0;
    const viajes = parseFloat(formulario.viajes) || 0;
    const kms = parseFloat(formulario.kms) || 0;
    const horas = parseFloat(formulario.horas) || 0;
    const gananciasExtras = parseFloat(formulario.gananciasExtras) || 0;
    const combustible = parseFloat(formulario.combustible) || 0;
    const gastosVarios = parseFloat(formulario.gastosVarios) || 0;

    const gananciasBrutas = ganancias + gananciasExtras;
    const gastosTotales = combustible + gastosVarios;
    const gananciaNeta = gananciasBrutas - gastosTotales;
  

    setResultado({
      gananciasBrutas,
      precioBrutoPorKm: kms > 0 ? gananciasBrutas / kms : 0,
      precioBrutoPorHora: horas > 0 ? gananciasBrutas / horas : 0,
      precioBrutoPorViaje: viajes > 0 ? gananciasBrutas / viajes : 0,
      gastosTotales,
      gananciaNeta,
      precioNetoPorKm: kms > 0 ? gananciaNeta / kms : 0,
      precioNetoPorHora: horas > 0 ? gananciaNeta / horas : 0,
      precioNetoPorViaje: viajes > 0 ? gananciaNeta / viajes : 0
    });
  };

  // Función para reiniciar todos los campos del formulario y el resultado
  const handleReset = () => {
    setFormulario(initialFormState); // Restablece el formulario a su estado inicial
    setResultado(null); // Borra el resultado mostrado también
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Registro de Ganancias</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/*
          IMPORTANTE: Asegúrate de añadir el atributo 'value' a cada input,
          vinculándolo con el estado 'formulario'. Esto es crucial para que
          los campos se reinicien visualmente cuando cambias el estado.
        */}
        
        <input
          type="number"
          name="ganancias"
          placeholder="Ganancias"
          value={formulario.ganancias} // <-- Añadido
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-4"
        />
        <input
          type="number"
          name="viajes"
          placeholder="Viajes"
          value={formulario.viajes} // <-- Añadido
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-3"
        />
        <input
          type="number"
          name="kms"
          placeholder="Kms"
          value={formulario.kms} // <-- Añadido
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-3"
        />
        <input
          type="number"
          name="horas"
          placeholder="Horas"
          value={formulario.horas} // <-- Añadido
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-3"
        />
        <input
          type="number"
          name="gananciasExtras"
          placeholder="propinas, viajes particulares"
          value={formulario.gananciasExtras} // <-- Añadido
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-3"
        />
        <input
          type="number"
          name="combustible"
          placeholder="Gasto de combustible"
          value={formulario.combustible} // <-- Añadido
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-3"
        />
        <input
          type="number"
          name="gastosVarios"
          placeholder="Gastos varios (comida, kiosco, etc)"
          value={formulario.gastosVarios} // <-- Añadido
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-3"
        />
        

        {/* Contenedor para los dos botones juntos y separados */}
        
       
        <div className="flex justify-between space-x-4 pt-4"> {/* Añadido padding-top para separarlos un poco de los inputs */}
          
          <button
            type="submit"
            className="calcular flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            
            disabled={isFormIncomplete}   // Des habilita el botón si el formulario está incompleto
            
            
          >
            
            Calcular Ganancias
          </button>
          <button
            type="button" // MUY IMPORTANTE: type="button" para que no envíe el formulario
            onClick={handleReset}
            className="reiniciar flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition"
          >
            Reiniciar Campos
          </button>
        </div>
      </form>

      {resultado && (
        <div className="resultados mt-6 p-4 bg-gray-100 rounded-md shadow-inner">
          <h3 className="text-xl font-semibold mb-2">Resultados:</h3>
          <ul className="space-y-1">
            <li>🔹 <strong>Ganancias brutas:</strong> ${resultado.gananciasBrutas.toFixed(2)}</li>
            <li>📏 <strong>Precio bruto por km:</strong> ${resultado.precioBrutoPorKm.toFixed(2)}</li>
            <li>⏱️ <strong>Precio bruto por hora:</strong> ${resultado.precioBrutoPorHora.toFixed(2)}</li>
            <li>🚕 <strong>Precio bruto por viaje:</strong> ${resultado.precioBrutoPorViaje.toFixed(2)}</li>
            <li className="text-red-600 font-medium">💸 <strong>Gastos totales:</strong> ${resultado.gastosTotales.toFixed(2)}</li>
            <li className="text-green-600 text-lg font-bold">✅ <strong>Ganancia neta:</strong> ${resultado.gananciaNeta.toFixed(2)}</li>
            <li>📏 <strong>Precio neto por km:</strong> ${resultado.precioNetoPorKm.toFixed(2)}</li>
            <li>⏱️ <strong>Precio neto por hora:</strong> ${resultado.precioNetoPorHora.toFixed(2)}</li>
            <li>🚕 <strong>Precio neto por viaje:</strong> ${resultado.precioNetoPorViaje.toFixed(2)}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default RegistroGanancias;
