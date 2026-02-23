import { useState } from "react"
import { Eye, EyeOff, Car } from 'lucide-react'
import { supabase } from "../lib/supabase"

export default function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

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

      // onLogin se llamará automáticamente si App.jsx escucha cambios de estado
    } catch (err) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/90 border border-blue-700/50 backdrop-blur-sm rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full shadow-lg">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-blue-100">Bienvenido</h1>
          <p className="text-blue-200/80">Ingresa a tu cuenta para gestionar tu negocio de transporte</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-blue-200 font-medium">Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/60 rounded-lg focus:border-blue-400 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-blue-200 font-medium">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/60 rounded-lg focus:border-blue-400 focus:outline-none"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-blue-300">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => onLogin("register")}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}