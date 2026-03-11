import { useState } from 'react'
import HomeView from './components/HomeView'
import SelectView from './components/SelectView'
import WaveCanvas from './components/WaveCanvas'

function App() {
  const [activeView, setActiveView] = useState('home')
  const [pulseKey, setPulseKey] = useState(0)

  const switchView = (nextView) => {
    setActiveView(nextView)
    setPulseKey((value) => value + 1)
  }

  return (
    <>
      <WaveCanvas pulseKey={pulseKey} />
      <div id="app">
        <HomeView active={activeView === 'home'} onSelect={() => switchView('select')} />
        <SelectView active={activeView === 'select'} onBack={() => switchView('home')} />
      </div>
    </>
  )
}

export default App
