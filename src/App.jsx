import { useState, useEffect } from 'react'
import './App.css'
import LoginPage from './components/LoginPage.jsx'
import RegisterPage from './components/RegisterPage.jsx'
import Dashboard from './components/Dashboard.jsx'
import { supabase } from './lib/supabase'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const [view, setView] = useState("login")

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-blue-400 font-semibold text-lg">
        Cargando...
      </div>
    )
  }

  if (!session) {
    return view === "login" ? (
      <LoginPage onLogin={(target) => setView(target)} />
    ) : (
      <RegisterPage onBackToLogin={() => setView("login")} />
    )
  }

  return <Dashboard session={session} />
}

export default App