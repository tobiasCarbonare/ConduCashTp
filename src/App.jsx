import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import RegistroGanancias from './components/RegistroGanancias'
import Principal from './components/Principal'
import RentabilidadViajes from './components/RentabilidadViajes'
import Servicios from './components/Servicios'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    
    <RegistroGanancias/>
    <RentabilidadViajes/>
    <Servicios/>
    </>
  )
}

export default App
