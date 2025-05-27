
import '../css/Principal.css';
import { FaPlus, FaHistory, FaBell, FaCar } from 'react-icons/fa';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';


function Principal() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 text-center w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">ConduApp</h1>

        {/* Ganancia neta hoy card */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
          <p className="text-gray-600 text-lg">Ganancia neta hoy</p>
          <h2 className="text-5xl font-extrabold text-gray-900 mt-2">$0</h2>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button className="botonPrincipal flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200">
            <FaPlus className="text-3xl text-gray-700 mb-2" />
            <span className="text-gray-800 font-medium">Registrar ganancias</span>
          </button>

          <button className=" botonPrincipal  flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200">
            <FaHistory className="text-3xl text-gray-700 mb-2" />
            <span className="text-gray-800 font-medium">Historial</span>
          </button>

          <button className="botonPrincipal flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200">
            <FaBell className="text-3xl text-gray-700 mb-2" />
            <span className="text-gray-800 font-medium">Recordatorios</span>
          </button>

          <button className="botonPrincipal flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200">
            <FaCar className="text-3xl text-gray-700 mb-2" />
            <span className="text-gray-800 font-medium">Vehículo</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Principal;