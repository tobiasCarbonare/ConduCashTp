import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  History,
  PlusCircle,
  Wrench,
  Calendar,
  Gauge,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCcw,
  Settings2
} from 'lucide-react';

/**
 * CONFIGURACIÓN DE SERVICIOS
 * 
 * Define los tipos de mantenimiento, sus íconos y la lógica de cálculo
 * para el próximo vencimiento (estimación por kilómetros o tiempo).
 */
const SERVICE_CONFIG = {
  vtv: {
    label: "VTV",
    icon: Calendar,
    color: "blue",
    getNext: () => {
      const fecha = new Date();
      fecha.setFullYear(fecha.getFullYear() + 2); // Estimación estándar de 2 años
      return `Repetir el ${fecha.toLocaleDateString()}`;
    },
  },
  aceite: {
    label: "Cambio de Aceite",
    icon: Settings2,
    color: "amber",
    getNext: (km) => `Próximo cambio a los ${km + 10000} km`, // Cada 10k km
  },
  distribucion: {
    label: "Cambio de Distribución",
    icon: Wrench,
    color: "red",
    getNext: (km) => `Próximo cambio a los ${km + 70000} km`, // Cada 70k km
  },
  frenos: {
    label: "Cambio de Frenos",
    icon: AlertCircle,
    color: "orange",
    getNext: (km) => `Próximo cambio a los ${km + 40000} km`, // Cada 40k km
  },
};

/**
 * COMPONENTE SERVICIOS
 * 
 * Gestiona el mantenimiento del vehículo, permitiendo registrar
 * qué servicios se hicieron y en qué kilometraje.
 */
export default function Servicios() {
  const [kmActual, setKmActual] = useState("");
  const [seleccionados, setSeleccionados] = useState({}); // Mapeo de servicios marcados {aceite: true, vtv: false}
  const [resultados, setResultados] = useState([]); // Almacena las alertas generadas tras guardar
  const [historial, setHistorial] = useState([]); // Datos persistentes de Supabase
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState('form');

  // Recupera el historial cuando el usuario entra a la pestaña 'Historial'
  useEffect(() => {
    if (view === 'history') {
      fetchHistorial();
    }
  }, [view]);

  /**
   * FUNCIÓN: Traer Historial de Base de Datos
   */
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
      toast.error("Error al cargar el historial: " + err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  /**
   * FUNCIÓN: Alternar selección de un servicio
   */
  const handleChangeServicio = (key) => {
    setSeleccionados((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    if (resultados.length > 0) setResultados([]); // Limpia alertas viejas si cambia la selección
  };

  /**
   * FUNCIÓN: Registrar en Supabase
   * Procesa cada servicio seleccionado y lo guarda como una fila individual en la DB.
   */
  const registrarServicios = async () => {
    if (isSaving) return;

    const km = parseInt(kmActual);
    if (isNaN(km)) {
      toast.error("Ingresá un número válido para los kilómetros.");
      return;
    }

    // Preparar los objetos para la inserción
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
      toast.warning("Seleccioná al menos un servicio para registrar.");
      return;
    }

    setIsSaving(true);
    try {
      const { supabase } = await import("../lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuario no autenticado");

      // Inserción masiva de servicios
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

      // Actualizar UI tras éxito
      setResultados(nuevosResultados);
      setKmActual("");
      setSeleccionados({});

      if (view === 'history') fetchHistorial();
      toast.success("¡Servicios registrados exitosamente!");

    } catch (err) {
      console.error(err);
      toast.error("Error al registrar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-5xl mx-auto px-4"
    >
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Mantenimiento de <span className="text-blue-500">Unidad</span>
          </h2>
          <p className="text-blue-200/60 text-lg font-medium">Gestiona el mantenimiento preventivo de tu vehículo.</p>
        </div>
        <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-blue-700/30 backdrop-blur-xl shadow-2xl">
          <button
            onClick={() => setView('form')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${view === 'form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-blue-300 hover:text-white hover:bg-slate-800'}`}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Nuevo</span>
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${view === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-blue-300 hover:text-white hover:bg-slate-800'}`}
          >
            <History className="h-5 w-5" />
            <span>Historial</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-12 xl:col-span-12 w-full max-w-3xl mx-auto">
              <div className="bg-slate-800/40 border border-blue-700/20 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="space-y-8 relative z-10">
                  {/* Kilometraje actual para base de cálculo */}
                  <div className="space-y-3 group">
                    <label className="text-blue-200 text-sm font-bold ml-1 flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-blue-500" />
                      Kilometraje Actual de la Unidad
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Ej: 45000"
                        value={kmActual}
                        onChange={(e) => setKmActual(e.target.value)}
                        onFocus={() => resultados.length > 0 && setResultados([])}
                        disabled={isSaving}
                        className={`w-full p-4 pl-12 bg-slate-900/60 border border-blue-700/30 text-blue-100 placeholder:text-blue-300/20 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 text-lg font-bold ${isSaving ? 'opacity-50 grayscale' : ''}`}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-black text-xl italic opacity-40 group-focus-within:opacity-100 transition-opacity tracking-widest">
                        KM
                      </div>
                    </div>
                  </div>

                  {/* Selector visual de servicios (Cartas interactivas) */}
                  <div className="space-y-4">
                    <label className="text-blue-200 text-sm font-bold ml-1 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-blue-500" />
                      Selecciona los Servicios Realizados
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(SERVICE_CONFIG).map(([key, config]) => {
                        const Icon = config.icon;
                        const isSelected = !!seleccionados[key];
                        return (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={key}
                            onClick={() => handleChangeServicio(key)}
                            className={`relative overflow-hidden flex items-center space-x-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 group ${isSelected
                              ? `bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10`
                              : "bg-slate-900/40 border-blue-900/30 hover:border-blue-700 hover:bg-slate-800/60"
                              }`}
                          >
                            <div className={`p-3 rounded-xl transition-colors duration-300 ${isSelected ? `bg-blue-500 text-white shadow-lg shadow-blue-500/40` : "bg-slate-800 text-blue-400 group-hover:text-blue-300"}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <span className={`font-bold block text-lg ${isSelected ? "text-white" : "text-blue-100 group-hover:text-white"}`}>
                                {config.label}
                              </span>
                              <span className="text-xs text-blue-300/40 font-semibold uppercase tracking-widest group-hover:text-blue-300/60 transition-colors">
                                {isSelected ? "Seleccionado" : "Click para marcar"}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={registrarServicios}
                    disabled={isSaving || !kmActual}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    {isSaving ? <RefreshCcw className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                    {isSaving ? 'Guardando...' : 'Registrar Mantenimiento'}
                  </button>
                </div>
              </div>

              {/* Muesta de Alertas Proyectadas tras guardar */}
              <AnimatePresence>
                {resultados.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 space-y-4"
                  >
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3 pb-2">
                      <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                      Próximos vencimientos calculados
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {resultados.map((r, index) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          key={index}
                          className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-blue-500/20 rounded-2xl backdrop-blur-3xl shadow-xl flex items-center gap-4 group"
                        >
                          <div className="p-3 bg-blue-600/20 rounded-xl group-hover:bg-blue-600/30 transition-colors">
                            <Clock className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-blue-400/60 text-xs font-black uppercase tracking-widest mb-1">{r.nombre}</p>
                            <p className="text-white text-xl font-black">{r.proximo}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* Historial: Consumo de datos desde Supabase */
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-900/40 border border-blue-700/30 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-blue-800/30 flex justify-between items-center bg-slate-900/60">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <History className="h-6 w-6 text-blue-500" />
                Historial de Servicios
              </h3>
              <button
                onClick={fetchHistorial}
                disabled={loadingHistory}
                className="text-blue-400 hover:text-white flex items-center gap-2 font-bold transition-all p-2 hover:bg-blue-600/20 rounded-lg"
              >
                <RefreshCcw className={`h-5 w-5 ${loadingHistory ? 'animate-spin' : ''}`} />
                {loadingHistory ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
            <div className="overflow-x-auto min-h-[400px]">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-blue-300 font-bold text-lg animate-pulse">Sincronizando con la nube...</p>
                </div>
              ) : historial.length === 0 ? (
                <div className="p-24 text-center">
                  <p className="text-blue-300/40 text-xl font-bold italic">No hay registros previos.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900/80 text-blue-200/50 text-[10px] sm:text-xs uppercase font-black tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6">Fecha</th>
                      <th className="px-8 py-6">Tipo de Servicio</th>
                      <th className="px-8 py-6 text-center">Kilometraje</th>
                      <th className="px-8 py-6">Detalles / Alertas</th>
                    </tr>
                  </thead>
                  <tbody className="text-blue-100 divide-y divide-blue-900/20">
                    {historial.map((serv, index) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={serv.id}
                        className="hover:bg-blue-600/5 transition-all group"
                      >
                        <td className="px-8 py-5 text-sm font-bold text-blue-400">
                          {new Date(serv.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-400 text-xs font-black border border-blue-600/20 uppercase">
                            {SERVICE_CONFIG[serv.tipo_servicio]?.label || serv.tipo_servicio}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center font-black">
                          {serv.kilomentraje_en_servicio.toLocaleString()} km
                        </td>
                        <td className="px-8 py-5 text-xs text-blue-300/80 font-medium whitespace-pre-wrap leading-relaxed">
                          {serv.comentarios || "-"}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
