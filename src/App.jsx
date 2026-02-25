import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './components/LoginPage.jsx'
import RegisterPage from './components/RegisterPage.jsx'
import Dashboard from './components/Dashboard.jsx'
import { supabase } from './lib/supabase'
import { Toaster } from 'sonner'

/**
 * COMPONENTE PRINCIPAL (App.jsx)
 * 
 * Es el punto de entrada de la aplicación. Maneja principalmente:
 * 1. El estado de la sesión del usuario (si está logueado o no).
 * 2. La navegación entre el Login, Registro y el Dashboard principal.
 * 3. La inicialización del sistema de notificaciones (Toaster).
 */
function App() {
  // Estado para guardar la sesión del usuario (proviene de Supabase)
  const [session, setSession] = useState(null)
  // Estado para controlar la pantalla de carga inicial
  const [loading, setLoading] = useState(true)
  // Estado para alternar entre las vistas de "login" y "register" cuando no hay sesión
  const [view, setView] = useState("login")

  useEffect(() => {
    // 1. Verificar si ya existe una sesión activa al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 2. Escuchar cambios en el estado de autenticación (Login, Logout, Registro exitoso)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Limpieza de la suscripción al desmontar el componente (buena práctica)
    return () => subscription.unsubscribe()
  }, [])

  // Pantalla de carga mientras se verifica la sesión en la base de datos
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-blue-400 font-semibold text-lg">
        Cargando sesión...
      </div>
    )
  }

  // FLUJO DE AUTENTICACIÓN: Si no hay sesión activa, mostramos Login o Registro
  if (!session) {
    return view === "login" ? (
      <LoginPage onLogin={(target) => setView(target)} />
    ) : (
      <RegisterPage onBackToLogin={() => setView("login")} />
    )
  }

  // FLUJO PRINCIPAL: Si el usuario está logueado, se muestra el Dashboard
  return (
    <>
      {/* Proveedor de notificaciones Toast configurable en toda la app */}
      <Toaster richColors position="top-right" closeButton />
      <Dashboard session={session} />
    </>
  )
}

export default App