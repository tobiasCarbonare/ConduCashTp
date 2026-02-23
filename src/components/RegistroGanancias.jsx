import '../css/Registro.css';
import { useState, useEffect } from 'react';
import { History, PlusCircle, Calendar, DollarSign, Clock, MapPin, Gauge } from 'lucide-react';

function RegistroGanancias() {
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
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [view, setView] = useState('form'); // 'form' o 'history'
  const isFormIncomplete = Object.values(formulario).some(value => value === "");

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
        .from('registros_ganancias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistorial(data);
    } catch (err) {
      console.error("Error al cargar historial:", err);
      alert("Error al cargar el historial: " + err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
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

    try {
      const { supabase } = await import("../lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuario no autenticado");

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

      alert("¡Registro guardado exitosamente!");
      if (view === 'history') fetchHistorial(); // Refrescar si estamos en historial
    } catch (err) {
      console.error(err);
      alert("Error al guardar en Supabase: " + err.message);
    } finally {
      setLoadingHistory(false)
    }
  };

  const handleReset = () => {
    setFormulario(initialFormState);
    setResultado(null);
  };

  return (
    <div className="space-y-6 registro-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-100 mb-2">Registro de Ganancias</h2>
          <p className="text-blue-200/80 text-lg">Administra y revisa tu historial de rentabilidad diaria.</p>
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
        <div className="max-w-xl mx-auto p-6 bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-xl shadow-md mt-10">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-100">Nuevo Registro del Día</h2>
          <form onSubmit={handleSubmit} className="space-y-4 registro-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-blue-200 text-sm font-medium">Ganancias de App/Plataforma</label>
                <input
                  type="number"
                  name="ganancias"
                  placeholder="Ej: 50000"
                  value={formulario.ganancias}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/40 rounded-lg focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-blue-200 text-sm font-medium">Viajes Realizados</label>
                <input
                  type="number"
                  name="viajes"
                  placeholder="Ej: 15"
                  value={formulario.viajes}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/40 rounded-lg focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-blue-200 text-sm font-medium">Kilómetros recorridos</label>
                <input
                  type="number"
                  name="kms"
                  placeholder="Ej: 120"
                  value={formulario.kms}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/40 rounded-lg focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-blue-200 text-sm font-medium">Horas de trabajo</label>
                <input
                  type="number"
                  name="horas"
                  placeholder="Ej: 8"
                  value={formulario.horas}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/40 rounded-lg focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-blue-200 text-sm font-medium">Ganancias Extras (propinas, particulares)</label>
              <input
                type="number"
                name="gananciasExtras"
                placeholder="Ej: 2000"
                value={formulario.gananciasExtras}
                onChange={handleChange}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/40 rounded-lg focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-blue-200 text-sm font-medium">Gasto Combustible</label>
                <input
                  type="number"
                  name="combustible"
                  placeholder="Ej: 10000"
                  value={formulario.combustible}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/40 rounded-lg focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-blue-200 text-sm font-medium">Gastos Varios</label>
                <input
                  type="number"
                  name="gastosVarios"
                  placeholder="Ej: 1500"
                  value={formulario.gastosVarios}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/40 rounded-lg focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between space-x-4 pt-6">
              <button
                type="submit"
                className={`flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98] ${isFormIncomplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isFormIncomplete}
              >
                Guardar y Calcular
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-blue-700 text-blue-300 rounded-lg hover:bg-slate-700 transition-all font-medium"
              >
                Limpiar
              </button>
            </div>
          </form>

          {resultado && (
            <div className="resultados-box mt-8 p-6 bg-slate-900/40 border border-blue-800/30 rounded-xl backdrop-blur-md shadow-inner animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-xl font-bold text-blue-100 mb-4 flex items-center">
                <span className="bg-blue-500 w-1.5 h-6 rounded mr-3"></span>
                Resultados del Registro:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <li className="flex justify-between items-center text-blue-100">
                  <span className="text-blue-300/80">Ganancias Brutas:</span>
                  <span className="font-bold">${resultado.gananciasBrutas.toFixed(2)}</span>
                </li>
                <li className="flex justify-between items-center text-blue-100">
                  <span className="text-blue-300/80">Ganancia Neta:</span>
                  <span className="font-bold text-green-400 text-lg">${resultado.gananciaNeta.toFixed(2)}</span>
                </li>
                <li className="flex justify-between items-center text-blue-100 border-t border-blue-900/40 pt-2 col-span-full">
                  <span className="text-red-400/90 font-medium">Gastos Totales:</span>
                  <span className="font-bold text-red-400">${resultado.gastosTotales.toFixed(2)}</span>
                </li>
                <li className="flex justify-between items-center text-blue-300/70 text-sm">
                  <span>Precio neto / km:</span>
                  <span className="font-medium">${resultado.precioNetoPorKm.toFixed(2)}</span>
                </li>
                <li className="flex justify-between items-center text-blue-300/70 text-sm">
                  <span>Precio neto / hora:</span>
                  <span className="font-medium">${resultado.precioNetoPorHora.toFixed(2)}</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-800/60 border border-blue-700/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-blue-700/50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-blue-100">Historial de Registros</h3>
            <button onClick={fetchHistorial} className="text-blue-400 hover:text-blue-300 text-sm">Actualizar</button>
          </div>
          <div className="overflow-x-auto">
            {loadingHistory ? (
              <div className="p-12 text-center text-blue-400 font-medium italic">Cargando registros...</div>
            ) : historial.length === 0 ? (
              <div className="p-12 text-center text-blue-300/70 italic">No hay registros guardados aún.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/50 text-blue-200/60 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">Bruto</th>
                    <th className="px-6 py-4 font-semibold">Gastos</th>
                    <th className="px-6 py-4 font-semibold text-green-400">Neto</th>
                    <th className="px-6 py-4 font-semibold text-center">Viajes</th>
                    <th className="px-6 py-4 font-semibold text-center">KM</th>
                    <th className="px-6 py-4 font-semibold text-center hidden md:table-cell">Horas</th>
                  </tr>
                </thead>
                <tbody className="text-blue-100 divide-y divide-blue-900/30">
                  {historial.map((reg) => {
                    const bruto = (reg.ganancias || 0) + (reg.ganancias_extras || 0);
                    const gastos = (reg.combustible || 0) + (reg.gastos_varios || 0);
                    const neto = bruto - gastos;
                    return (
                      <tr key={reg.id} className="hover:bg-blue-600/10 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium">${bruto.toLocaleString()}</td>
                        <td className="px-6 py-4 text-red-400/90">${gastos.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-green-400">${neto.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">{reg.viajes}</td>
                        <td className="px-6 py-4 text-center">{reg.kms}</td>
                        <td className="px-6 py-4 text-center hidden md:table-cell">{reg.horas}h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroGanancias;
