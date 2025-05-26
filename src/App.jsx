import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import RegistroGanancias from './components/RegistroGanancias'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <RegistroGanancias />
    </>
  )
}

export default App
