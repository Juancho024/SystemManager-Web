import { useEffect, useState } from 'react'
import '../public/styles.css'
import Sidebar from './components/Sidebar'
import VistaPrincipal from './components/VistaPrincipal'
import VistaPropietarios from './components/VistaPropietarios'
import VistaContabilidad from './components/VistaContabilidad'

function App() {
  const [owners, setOwners] = useState([])
  const [currentView, setCurrentView] = useState('principal')
  const [selectedOwner, setSelectedOwner] = useState(null)
  const apiBase = import.meta.env.VITE_API_BASE

  useEffect(() => {
    if (!apiBase) return
    fetch(`${apiBase}/api/propietarios`)
      .then((res) => res.json())
      .then((data) => setOwners(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [apiBase])

  const handleShowView = (viewName) => {
    setCurrentView(viewName)
  }

  const handleSelectOwner = (owner) => {
    setSelectedOwner(owner)
  }

  return (
    <div className="layout d-flex">
      <Sidebar onShowView={handleShowView} currentView={currentView} />
      <div className="main-content flex-grow-1">
        {currentView === 'principal' && <VistaPrincipal owners={owners} />}
        {currentView === 'propietarios' && (
          <VistaPropietarios
            owners={owners}
            selectedOwner={selectedOwner}
            onSelectOwner={handleSelectOwner}
          />
        )}
        {currentView === 'contabilidad' && <VistaContabilidad owners={owners} />}
      </div>
    </div>
  )
}

export default App
