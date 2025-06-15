import React from 'react';
import Registro from '../components/RegistroGanancias'; 
function RegistrarModulo() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 text-center w-full max-w-sm">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Registrar Ganancia</h2>
        <p className="text-gray-600">Aquí puedes registrar tus ganancias.</p>
        <RegistroGanancias/>
      </div>
    </div>
  );
}
import RegistroGanancias from '../components/RegistroGanancias';

export default RegistrarModulo;