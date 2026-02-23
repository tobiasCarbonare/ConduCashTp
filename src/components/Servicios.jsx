import React, { useState, useEffect } from "react";
import { History, PlusCircle, Wrench, Calendar, Gauge } from 'lucide-react';

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
  const [historial, setHistorial] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [view, setView] = useState('form'); // 'form' o 'history'

  useEffect(() => {
    if (view === 'history') {
      fetchHistorial();
    }
  }, [view]);

  const fetchHistorial = async () => {
    setLoadingHistory(true);
    try {
      const { supabase } = await import("../lib/supabase");
      const { data, error } = await supabase
        .from('servicios_mantenimiento')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistorial(data);
    } catch (err) {
      console.error("Error al cargar historial de servicios:", err);
      alert("Error al cargar el historial: " + err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleChangeServicio = (key) => {
    setSeleccionados((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const registrarServicios = async () => {
    const km = parseInt(kmActual);
    if (isNaN(km)) {
      alert("Ingresá un número válido para los kilómetros.");
      return;
    }

    const nuevosResultados = Object.entries(seleccionados)
      .filter(([_, activo]) => activo)
      .map(([key]) => {
        const servicio = SERVICE_CONFIG[key];
        return {
          nombre: servicio.label,
          proximo: servicio.getNext(km),
          key: key
        };
      });

    if (nuevosResultados.length === 0) {
      alert("Seleccioná al menos un servicio para registrar.");
      return;
    }

    try {
      const { supabase } = await import("../lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuario no autenticado");

      const inserts = nuevosResultados.map(r => ({
        user_id: user.id,
        tipo_servicio: r.key,
        kilomentraje_en_servicio: km,
        comentarios: `Cálculo automático: ${r.proximo}`
      }));

      const { error: insertError } = await supabase
        .from('servicios_mantenimiento')
        .insert(inserts);

      if (insertError) throw insertError;

      setResultados(nuevosResultados);
      alert("¡Servicios registrados exitosamente!");
      setKmActual("");
      setSeleccionados({});
      if (view === 'history') fetchHistorial();
    } catch (err) {
      console.error(err);
      alert("Error al registrar en Supabase: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-100 mb-2">Servicios del Vehículo</h2>
          <p className="text-blue-200/80 text-lg">Gestiona el mantenimiento preventivo de tu unidad.</p>
        </div>
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-blue-700/50 backdrop-blur-sm self-start md:self-center">
          <button
            onClick={() => setView('form')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${view === 'form' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-200 hover:text-blue-100'}`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nuevo</span>
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${view === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-200 hover:text-blue-100'}`}
          >
            <History className="h-4 w-4" />
            <span>Historial</span>
          </button>
        </div>
      </div>

      {view === 'form' ? (
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-xl p-6 shadow-xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-blue-200 font-medium">Kilometraje actual</label>
                <input
                  type="number"
                  placeholder="Ej: 45000"
                  value={kmActual}
                  onChange={(e) => setKmActual(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/60 rounded-lg focus:border-blue-400 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-blue-200 font-medium block">Seleccioná los servicios realizados</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(SERVICE_CONFIG).map(([key, { label }]) => (
                    <div
                      key={key}
                      onClick={() => handleChangeServicio(key)}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${seleccionados[key]
                        ? "bg-blue-600/30 border-blue-500 text-blue-100"
                        : "bg-slate-700/30 border-blue-900/50 text-blue-300 hover:border-blue-700"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!seleccionados[key]}
                        readOnly
                        className="h-4 w-4 rounded border-blue-500 text-blue-600 focus:ring-blue-500 bg-slate-800"
                      />
                      <span className="font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={registrarServicios}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform active:scale-[0.98] transition-all"
              >
                Registrar Servicios Realizados
              </button>
            </div>
          </div>

          {resultados.length > 0 && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-semibold text-blue-100 mb-4 flex items-center">
                <span className="bg-blue-500 w-2 h-6 rounded mr-3"></span>
                Próximos vencimientos calculados:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resultados.map((r, index) => (
                  <div key={index} className="p-4 bg-slate-800/40 border border-blue-800/30 rounded-lg backdrop-blur-sm">
                    <p className="text-blue-400 text-sm font-medium uppercase tracking-wider">{r.nombre}</p>
                    <p className="text-blue-100 text-lg font-bold mt-1">{r.proximo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-blue-700/50 flex justify-between items-center bg-slate-900/40">
            <h3 className="text-xl font-bold text-blue-100">Historial de Mantenimiento</h3>
            <button onClick={fetchHistorial} className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Actualizar
            </button>
          </div>
          <div className="overflow-x-auto">
            {loadingHistory ? (
              <div className="p-12 text-center text-blue-400 font-medium italic">Cargando registros...</div>
            ) : historial.length === 0 ? (
              <div className="p-12 text-center text-blue-300/70 italic">No hay servicios registrados aún.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/60 text-blue-200/60 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">Servicio</th>
                    <th className="px-6 py-4 font-semibold">Kilometraje</th>
                    <th className="px-6 py-4 font-semibold">Estimación / Próximo</th>
                  </tr>
                </thead>
                <tbody className="text-blue-100 divide-y divide-blue-900/30">
                  {historial.map((serv) => (
                    <tr key={serv.id} className="hover:bg-blue-600/10 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-blue-400" />
                          {new Date(serv.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                          {SERVICE_CONFIG[serv.tipo_servicio]?.label || serv.tipo_servicio}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-3.5 w-3.5 text-blue-400" />
                          {serv.kilomentraje_en_servicio.toLocaleString()} km
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-300/90 italic">
                        {serv.comentarios || "Sin detalles"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
