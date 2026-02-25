import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  History,
  PlusCircle,
  Calendar,
  DollarSign,
  Clock,
  Gauge,
  Briefcase,
  TrendingUp,
  Fuel,
  Settings,
  Trash2,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';

/**
 * COMPONENTE REGISTRO DE GANANCIAS
 * 
 * Este módulo permite al usuario ingresar sus métricas diarias de trabajo
 * (ganancias, viajes, kms, horas y gastos) para analizar su rentabilidad.
 */
function RegistroGanancias({ initialView = 'form' }) {
  // Estado inicial vacío para el formulario
  const initialFormState = {
    ganancias: '',
    viajes: '',
    kms: '',
    horas: '',
    gananciasExtras: '',
    combustible: '',
    gastosVarios: ''
  };

  const [formulario, setFormulario] = useState(initialFormState);
  const [resultado, setResultado] = useState(null); // Para mostrar cálculos en tiempo real tras guardar
  const [historial, setHistorial] = useState([]); // Datos traídos de Supabase
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState(initialView); // Controla si se ve el formulario o el historial

  // Lógica simple para deshabilitar el botón si faltan campos obligatorios
  const isFormIncomplete = Object.values(formulario).some(value => value === "" && !['gananciasExtras'].includes(Object.keys(formulario).find(key => formulario[key] === value)));

  // Cargar el historial automáticamente cuando el usuario cambia a la pestaña de "Historial"
  useEffect(() => {
    if (view === 'history') {
      fetchHistorial();
    }
  }, [view]);

  /**
   * FUNCIÓN: Traer datos de Supabase
   * Realiza una consulta a la tabla 'registros_ganancias' ordenada por fecha.
   */
  const fetchHistorial = async () => {
    setLoadingHistory(true);
    try {
      const { supabase } = await import("../lib/supabase");
      const { data, error } = await supabase
        .from('registros_ganancias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistorial(data);
    } catch (err) {
      console.error("Error al cargar historial:", err);
      toast.error("Error al cargar el historial: " + err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  /**
   * FUNCIÓN: Manejar cambios en inputs
   * Actualiza el estado del formulario dinámicamente según el 'name' del input.
   */
  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  /**
   * FUNCIÓN: Guardar Registro
   * 1. Procesa los números del formulario.
   * 2. Calcula Ganancia Neta y Totales.
   * 3. Inserta los datos en la tabla 'registros_ganancias' de Supabase.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    // Conversión de string a float para cálculos
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

    setIsSaving(true);
    try {
      const { supabase } = await import("../lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuario no autenticado");

      // INSERCIÓN EN BASE DE DATOS
      const { error: insertError } = await supabase
        .from('registros_ganancias')
        .insert([
          {
            user_id: user.id,
            ganancias,
            viajes,
            kms,
            horas,
            ganancias_extras: gananciasExtras,
            combustible,
            gastos_varios: gastosVarios,
          }
        ]);

      if (insertError) throw insertError;

      // Actualizar estado local para mostrar el resumen al usuario inmediatamente
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

      toast.success("¡Registro guardado exitosamente!");
      if (view === 'history') fetchHistorial();
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormulario(initialFormState);
    setResultado(null);
    toast.info("Formulario limpiado");
  };

  // Variantes de animación para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  /**
   * SUB-COMPONENTE: Campo de Entrada Estilizado
   * Reutilizable para mantener consistencia visual en el formulario.
   */
  const InputField = ({ label, name, placeholder, value, icon: Icon, type = "number", required = true }) => (
    <div className="space-y-2 group">
      <label className="text-blue-200 text-sm font-semibold ml-1 group-focus-within:text-blue-400 transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/60 group-focus-within:text-blue-400 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={required}
          className="w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-blue-700/30 text-blue-100 placeholder:text-blue-300/20 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300"
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-5xl mx-auto px-4"
    >
      {/* Título y Selector de Vista (Nuevo vs Historial) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Registro de <span className="text-blue-500">Ganancias</span>
          </h2>
          <p className="text-blue-200/60 text-lg font-medium">Administra y revisa tu historial de rentabilidad diaria.</p>
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-12 xl:col-span-12 w-full max-w-3xl mx-auto">
              <div className="bg-slate-800/40 border border-blue-700/20 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <h3 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  Nuevo Registro del Día
                </h3>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Ganancias App/Plataforma" name="ganancias" placeholder="Ej: 50000" value={formulario.ganancias} icon={DollarSign} />
                    <InputField label="Viajes Realizados" name="viajes" placeholder="Ej: 15" value={formulario.viajes} icon={Briefcase} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Kilómetros Recorridos" name="kms" placeholder="Ej: 120" value={formulario.kms} icon={Gauge} />
                    <InputField label="Horas de Trabajo" name="horas" placeholder="Ej: 8" value={formulario.horas} icon={Clock} />
                  </div>

                  <InputField label="Ganancias Extras (Propinas, Particulares)" name="gananciasExtras" placeholder="Ej: 2000" value={formulario.gananciasExtras} icon={TrendingUp} required={false} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Gasto en Combustible" name="combustible" placeholder="Ej: 10000" value={formulario.combustible} icon={Fuel} />
                    <InputField label="Gastos Varios" name="gastosVarios" placeholder="Ej: 1500" value={formulario.gastosVarios} icon={Settings} />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isFormIncomplete || isSaving}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      {isSaving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      {isSaving ? 'Guardando...' : 'Guardar y Calcular'}
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-8 py-4 border border-blue-700/50 text-blue-400 font-bold rounded-2xl hover:bg-slate-700/50 hover:text-blue-200 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <Trash2 className="h-5 w-5" />
                      Limpiar
                    </button>
                  </div>
                </form>
              </div>

              {/* MUESTRA DE RESULTADOS: Solo aparece tras un guardado exitoso */}
              <AnimatePresence>
                {resultado && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-8 bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/20 backdrop-blur-3xl rounded-3xl shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                        Resumen del Registro
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center group p-4 bg-slate-900/30 rounded-2xl border border-blue-500/10 hover:border-blue-500/30 transition-all">
                          <span className="text-blue-200/70 font-semibold">Ganancias Brutas</span>
                          <span className="text-3xl font-black text-white">${resultado.gananciasBrutas.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center group p-4 bg-red-900/10 rounded-2xl border border-red-500/10 hover:border-red-500/30 transition-all">
                          <span className="text-red-300/70 font-semibold">Gastos Totales</span>
                          <span className="text-2xl font-bold text-red-500">-${resultado.gastosTotales.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center group p-6 bg-green-900/20 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all shadow-lg shadow-green-500/5">
                          <span className="text-green-300 font-bold text-lg">Ganancia Neta</span>
                          <span className="text-4xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">${resultado.gananciaNeta.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Proporciones calculadas (Análisis por unidad) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: 'Neto / KM', val: resultado.precioNetoPorKm, icon: Gauge },
                          { label: 'Neto / Hora', val: resultado.precioNetoPorHora, icon: Clock },
                          { label: 'Neto / Viaje', val: resultado.precioNetoPorViaje, icon: Briefcase },
                          { label: 'Bruto / KM', val: resultado.precioBrutoPorKm, icon: TrendingUp }
                        ].map((item, id) => (
                          <div key={id} className="p-4 bg-slate-900/50 rounded-2xl border border-blue-900/30 flex flex-col justify-center items-center text-center">
                            <item.icon className="h-5 w-5 text-blue-500/50 mb-2" />
                            <span className="text-blue-300/40 text-xs font-bold uppercase tracking-tighter mb-1">{item.label}</span>
                            <span className="text-lg font-bold text-blue-100">${item.val.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* VISTA DE HISTORIAL: Listado de todos los datos en Supabase */
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
                Listado de Registros (Base de Datos)
              </h3>
              <button
                onClick={fetchHistorial}
                disabled={loadingHistory}
                className="text-blue-400 hover:text-white flex items-center gap-2 font-bold transition-all p-2 hover:bg-blue-600/20 rounded-lg"
              >
                <RefreshCcw className={`h-5 w-5 ${loadingHistory ? 'animate-spin' : ''}`} />
                {loadingHistory ? 'Cargando...' : 'Sincronizar'}
              </button>
            </div>
            <div className="min-h-[400px]">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-blue-300 font-bold text-lg">Consultando a Supabase...</p>
                </div>
              ) : historial.length === 0 ? (
                <div className="p-24 text-center">
                  <p className="text-blue-300/50 text-xl font-medium">No hay registros guardados aún.</p>
                </div>
              ) : (
                <>
                  {/* VISTA MOBILE: Cards (oculto en lg) */}
                  <div className="lg:hidden p-4 space-y-4">
                    {historial.map((reg, index) => {
                      const bruto = (reg.ganancias || 0) + (reg.ganancias_extras || 0);
                      const gastos = (reg.combustible || 0) + (reg.gastos_varios || 0);
                      const neto = bruto - gastos;
                      return (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={reg.id}
                          className="bg-slate-900/60 border border-blue-900/40 rounded-2xl p-5 space-y-4"
                        >
                          <div className="flex justify-between items-center border-b border-blue-900/20 pb-3">
                            <span className="text-blue-400 font-bold text-sm">
                              {new Date(reg.created_at).toLocaleDateString()}
                            </span>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1">
                              <span className="text-green-400 font-black text-lg">${neto.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-blue-200/40 text-[10px] uppercase font-black tracking-widest">Ingreso Bruto</p>
                              <p className="text-white font-bold text-lg">${bruto.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-red-400/40 text-[10px] uppercase font-black tracking-widest">Gastos Totales</p>
                              <p className="text-red-400 font-bold text-lg">-${gastos.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-slate-950/40 rounded-xl p-3">
                            <div className="text-center">
                              <p className="text-blue-300/30 text-[8px] font-bold uppercase">Viajes</p>
                              <p className="text-blue-100 font-bold">{reg.viajes}</p>
                            </div>
                            <div className="text-center border-x border-blue-900/20">
                              <p className="text-blue-300/30 text-[8px] font-bold uppercase">KM</p>
                              <p className="text-blue-100 font-bold">{reg.kms}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-blue-300/30 text-[8px] font-bold uppercase">Horas</p>
                              <p className="text-blue-100 font-bold">{reg.horas}h</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* VISTA DESKTOP: Tabla (oculto en mobile) */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-900/80 text-blue-200/50 text-[10px] sm:text-xs uppercase font-black tracking-[0.2em]">
                        <tr>
                          <th className="px-8 py-6">Fecha</th>
                          <th className="px-8 py-6">Bruto</th>
                          <th className="px-8 py-6">Gastos</th>
                          <th className="px-8 py-6 text-green-400">Neto</th>
                          <th className="px-8 py-6 text-center">Viajes</th>
                          <th className="px-8 py-6 text-center">KM</th>
                          <th className="px-8 py-6 text-center">Horas</th>
                        </tr>
                      </thead>
                      <tbody className="text-blue-100 divide-y divide-blue-900/20">
                        {historial.map((reg, index) => {
                          const bruto = (reg.ganancias || 0) + (reg.ganancias_extras || 0);
                          const gastos = (reg.combustible || 0) + (reg.gastos_varios || 0);
                          const neto = bruto - gastos;
                          return (
                            <motion.tr
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              key={reg.id}
                              className="hover:bg-blue-600/5 transition-all"
                            >
                              <td className="px-8 py-5 text-sm font-bold text-blue-400">
                                {new Date(reg.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-8 py-5 font-black text-lg">
                                ${bruto.toLocaleString()}
                              </td>
                              <td className="px-8 py-5 text-red-400 font-bold">
                                -${gastos.toLocaleString()}
                              </td>
                              <td className="px-8 py-5">
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1 inline-block">
                                  <span className="text-green-400 font-black text-lg">${neto.toLocaleString()}</span>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-center font-bold">{reg.viajes}</td>
                              <td className="px-8 py-5 text-center font-bold">{reg.kms}</td>
                              <td className="px-8 py-5 text-center font-bold">{reg.horas}h</td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default RegistroGanancias;
