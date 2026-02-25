import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  History,
  Bell,
  Car,
  TrendingUp,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * COMPONENTE PRINCIPAL (Home View)
 * 
 * Es la pantalla de bienvenida y resumen que aparece al iniciar el Dashboard.
 * Proporciona un vistazo rápido de las ganancias y acceso directo a las herramientas.
 */
function Principal({ onNavigate }) {
  const [gananciaHoy, setGananciaHoy] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cargar la ganancia del día actual desde la base de datos
  useEffect(() => {
    fetchGananciaHoy();
  }, []);

  /**
   * FUNCIÓN: Obtener Ganancia del Día
   * Consulta los registros de hoy para el usuario actual y suma la ganancia neta.
   */
  const fetchGananciaHoy = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener la fecha de hoy en formato ISO (YYYY-MM-DD)
      const hoy = new Date().toISOString().split('T')[0];

      // Consultar registros creados hoy
      const { data, error } = await supabase
        .from('registros_ganancias')
        .select('ganancias, ganancias_extras, combustible, gastos_varios')
        .eq('user_id', user.id)
        .gte('created_at', hoy);

      if (error) throw error;

      // Calcular la ganancia neta total del día
      const totalNeto = data.reduce((acc, current) => {
        const bruto = (current.ganancias || 0) + (current.ganancias_extras || 0);
        const gastos = (current.combustible || 0) + (current.gastos_varios || 0);
        return acc + (bruto - gastos);
      }, 0);

      setGananciaHoy(totalNeto);
    } catch (err) {
      console.error("Error al obtener ganancias de hoy:", err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  /**
   * ACCIONES RÁPIDAS
   * Mapeo de los botones principales con sus destinos y estilos.
   */
  const quickActions = [
    {
      id: "earnings",
      title: "Registrar Ganancias",
      icon: PlusCircle,
      color: "from-blue-600 to-indigo-600",
      description: "Suma tus viajes del día"
    },
    {
      id: "earnings_history", // Esto navegará a earnings y luego el componente maneja su vista de historial
      title: "Historial",
      icon: History,
      color: "from-cyan-600 to-blue-600",
      description: "Revisa meses pasados"
    },
    {
      // Por ahora Recordatorios y Vehículo redirigen a Servicios, que es lo que tenemos implementado
      id: "services",
      title: "Mantenimiento",
      icon: Car,
      color: "from-slate-700 to-slate-800",
      description: "Estado de tu unidad"
    },
    {
      id: "calculator",
      title: "Calculadora",
      icon: TrendingUp,
      color: "from-blue-700 to-blue-900",
      description: "¿Es rentable el viaje?"
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* CARD DE RESUMEN DE GANANCIAS (EL "HERO" DE LA PÁGINA) */}
      <div className="relative overflow-hidden bg-slate-800/40 border border-blue-700/20 backdrop-blur-2xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 text-center md:text-left">
          <div className="space-y-1 md:space-y-2">
            <p className="text-blue-200/60 text-xs md:text-lg font-bold uppercase tracking-[0.2em]">Ganancia Neta Hoy</p>
            <div className="flex items-baseline justify-center md:justify-start gap-1 md:gap-2">
              <span className="text-2xl md:text-4xl font-light text-blue-400">$</span>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                {gananciaHoy.toLocaleString()}
              </h2>
            </div>
          </div>

          <button
            onClick={() => onNavigate('earnings')}
            className="flex items-center justify-center gap-2 md:gap-3 bg-white text-slate-900 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            NUEVO REGISTRO
            <PlusCircle className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
      </div>

      {/* BOTONES PRINCIPALES: Lista en mobile, 2 Columnas en desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * index }}
            onClick={() => onNavigate(action.id)}
            className="group cursor-pointer relative overflow-hidden bg-slate-900/40 border border-blue-900/30 p-4 md:p-8 rounded-2xl md:rounded-3xl hover:bg-slate-800/60 transition-all duration-300 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-0"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${action.color} opacity-[0.03] group-hover:opacity-10 transition-opacity rounded-bl-full`}></div>

            <div className={`p-3 md:p-4 bg-gradient-to-br ${action.color} rounded-xl md:rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-500 mb-0 md:mb-4 shrink-0`}>
              <action.icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-2xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight">
                  {action.title}
                </h3>
                <ArrowRight className="h-5 w-5 text-blue-500 transform group-hover:translate-x-1 transition-all md:hidden" />
                <ArrowRight className="hidden md:block h-6 w-6 text-blue-500/0 group-hover:text-blue-500/100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
              </div>
              <p className="text-[10px] text-blue-200/40 font-bold uppercase tracking-widest mt-0.5 md:mt-1">
                {action.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* SECCIÓN DE TIPS O RECORDATORIOS RÁPIDOS (OPCIONAL) */}
      <div className="flex items-center gap-3 md:gap-4 p-4 md:p-6 bg-blue-900/10 border border-blue-500/10 rounded-xl md:rounded-2xl">
        <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
          <Bell className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
        </div>
        <p className="text-blue-200/70 text-[10px] md:text-sm font-medium leading-tight">
          <span className="text-blue-400 font-bold">Tip:</span> ¿Sabías que los martes suelen ser los más rentables? ¡Aprovecha la mañana!
        </p>
      </div>
    </motion.div>
  );
}

export default Principal;