import { useState } from 'react'
import './App.css'
import LoginPage from './components/LoginPage.jsx'
import Dashboard from './components/Dashboard.jsx'

function App() {
  

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  if (isLoggedIn) {
    return <Dashboard />
  }


  return <LoginPage onLogin={() => setIsLoggedIn(true)} />
}

export default App