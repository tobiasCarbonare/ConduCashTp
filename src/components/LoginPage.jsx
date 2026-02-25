import { useState } from "react"
import { Eye, EyeOff, Car } from 'lucide-react'
import { supabase } from "../lib/supabase"

/**
 * PÁGINA DE LOGIN
 * 
 * Permite a los usuarios existentes acceder a la aplicación mediante 
 * el sistema de autenticación de Supabase (Email/Password).
 */
export default function LoginPage({ onLogin }) {
  // Estados para controlar los campos del formulario
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  /**
   * FUNCIÓN: Iniciar Sesión
   * Llama a la API de Supabase Auth para validar las credenciales.
   */
  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // NOTA: No es necesario llamar a onLogin explícitamente porque App.jsx 
      // detecta el cambio de sesión automáticamente mediante 'onAuthStateChange'.
    } catch (err) {
      // Manejo de errores específicos (ej: contraseña incorrecta)
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/90 border border-blue-700/50 backdrop-blur-sm rounded-lg p-6 shadow-2xl">
        {/* Cabecera visual del Login */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full shadow-lg">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-blue-100 italic tracking-tighter uppercase">CONDUCASH</h1>
          <p className="text-blue-200/80 text-sm">Gestiona tu negocio de transporte de forma inteligente</p>
        </div>

        {/* Mensaje de error si la autenticación falla */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-blue-200 font-medium text-sm">Email Corporativo / Personal</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/30 rounded-lg focus:border-blue-400 focus:outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-blue-200 font-medium text-sm">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu clave"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/30 rounded-lg focus:border-blue-400 focus:outline-none transition-all"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-100"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "PROCESANDO..." : "INGRESAR AL PANEL"}
          </button>
        </form>

        <div className="mt-8 text-center bg-slate-900/30 p-4 rounded-xl border border-blue-900/40">
          <p className="text-blue-300 text-sm">
            ¿Aún no tienes una cuenta operativa?{" "}
            <button
              onClick={() => onLogin("register")}
              className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-4 decoration-2 transition-all"
            >
              Crea una aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}