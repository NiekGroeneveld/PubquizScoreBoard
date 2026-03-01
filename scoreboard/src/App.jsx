import { useState, useCallback, useMemo } from 'react'
import ScoreColumn from './components/ScoreColumn'
import Header from './components/Header'
import './App.css'

import bartImg from './assets/Bart.png'
import folkerImg from './assets/Folker.png'
import ivanImg from './assets/Ivan.png'
import leviImg from './assets/Levi.png'
import mattiImg from './assets/Matti.png'
import thijsImg from './assets/Thijs.png'
import niekImg from './assets/Niek.png'

const PLAYERS = [
  { name: 'Bart',   color: '#00aaff', img: bartImg },
  { name: 'Folker', color: '#ffea00', img: folkerImg },
  { name: 'Ivan',   color: '#d500f9', img: ivanImg },
  { name: 'Levi',   color: '#00e5ff', img: leviImg },
  { name: 'Matti',  color: '#ff6d00', img: mattiImg },
  { name: 'Thijs',  color: '#00e676', img: thijsImg },
]

const NIEK = { name: 'Niek', color: '#ff3d00', img: niekImg }

function App() {
  const initialScores = {}
  PLAYERS.forEach(p => { initialScores[p.name] = 0 })
  initialScores[NIEK.name] = 0

  const [scores, setScores] = useState(initialScores)
  const [showNiek, setShowNiek] = useState(false)

  const activePlayers = useMemo(() => {
    if (!showNiek) return PLAYERS
    const all = [...PLAYERS, NIEK]
    all.sort((a, b) => a.name.localeCompare(b.name))
    return all
  }, [showNiek])

  const activeScores = useMemo(() => {
    const s = {}
    activePlayers.forEach(p => { s[p.name] = scores[p.name] })
    return s
  }, [scores, activePlayers])

  const minScore = useMemo(() => Math.min(...Object.values(activeScores)), [activeScores])
  const maxScore = useMemo(() => Math.max(...Object.values(activeScores)), [activeScores])
  const range = maxScore - minScore

  const increment = useCallback((name) => {
    setScores(prev => ({ ...prev, [name]: prev[name] + 1 }))
  }, [])

  const decrement = useCallback((name) => {
    setScores(prev => ({ ...prev, [name]: prev[name] - 1 }))
  }, [])

  const resetScores = useCallback(() => {
    const fresh = {}
    PLAYERS.forEach(p => { fresh[p.name] = 0 })
    fresh[NIEK.name] = 0
    setScores(fresh)
  }, [])

  return (
    <div className="app">
      <Header showNiek={showNiek} setShowNiek={setShowNiek} onReset={resetScores} />

      <div className="scoreboard">
        {activePlayers.map(player => (
          <ScoreColumn
            key={player.name}
            player={player}
            score={scores[player.name]}
            minScore={minScore}
            maxScore={maxScore}
            onIncrement={() => increment(player.name)}
            onDecrement={() => decrement(player.name)}
          />
        ))}
      </div>
    </div>
  )
}

export default App
