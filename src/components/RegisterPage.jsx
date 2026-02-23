import { useState } from "react"
import { Eye, EyeOff, Car, ArrowLeft } from 'lucide-react'
import { supabase } from "../lib/supabase"

export default function RegisterPage({ onBackToLogin }) {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nombre_completo: fullName,
                    },
                },
            })

            if (authError) throw authError

            setSuccess(true)
        } catch (err) {
            setError(err.message || "Error al registrarse")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-slate-800/90 border border-blue-700/50 backdrop-blur-sm rounded-lg p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-500/20 p-3 rounded-full">
                            <Car className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-blue-100 mb-2">¡Registro Exitoso!</h1>
                    <p className="text-blue-200/80 mb-6">Hemos enviado un correo de confirmación. Por favor revisa tu bandeja de entrada para activar tu cuenta.</p>
                    <button
                        onClick={onBackToLogin}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800/90 border border-blue-700/50 backdrop-blur-sm rounded-lg p-6">
                <button
                    onClick={onBackToLogin}
                    className="flex items-center text-blue-300 hover:text-blue-100 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al login
                </button>

                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full shadow-lg">
                            <Car className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-blue-100">Crear Cuenta</h1>
                    <p className="text-blue-200/80">Regístrate para empezar a gestionar tus ganancias</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-blue-200 font-medium">Nombre Completo</label>
                        <input
                            type="text"
                            placeholder="Juan Pérez"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/60 rounded-lg focus:border-blue-400 focus:outline-none"
                            required
                        />
                    </div>

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
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-slate-700/50 border border-blue-600/50 text-blue-100 placeholder:text-blue-300/60 rounded-lg focus:border-blue-400 focus:outline-none"
                                required
                                minLength={6}
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
                        {loading ? "Registrando..." : "Crear Cuenta"}
                    </button>
                </form>
            </div>
        </div>
    )
}
