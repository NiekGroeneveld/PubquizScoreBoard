import { useState, useCallback, useMemo, useEffect } from 'react'
import ScoreColumn from './components/ScoreColumn'
import Header from './components/Header'
import GameSetup from './components/GameSetup'
import {
  useGameSession,
  createNewGame,
  gameExists,
  listPublicGames,
} from './firebase/useGameSession'
import './App.css'

import bartImg from './assets/Bart.png'
import folkerImg from './assets/Folker.png'
import ivanImg from './assets/Ivan.png'
import leviImg from './assets/Levi.png'
import mattiImg from './assets/Matti.png'
import thijsImg from './assets/Thijs.png'
import niekImg from './assets/Niek.png'

const ALL_PLAYERS = [
  { name: 'Bart', color: '#00aaff', img: bartImg },
  { name: 'Folker', color: '#ffea00', img: folkerImg },
  { name: 'Ivan', color: '#d500f9', img: ivanImg },
  { name: 'Levi', color: '#00e5ff', img: leviImg },
  { name: 'Matti', color: '#ff6d00', img: mattiImg },
  { name: 'Niek', color: '#ff3d00', img: niekImg },
  { name: 'Thijs', color: '#00e676', img: thijsImg },
]

function App() {
  const [currentGameId, setCurrentGameId] = useState(null)
  const [readOnlyMode, setReadOnlyMode] = useState(false)
  const [publicGames, setPublicGames] = useState([])
  const [loadingGames, setLoadingGames] = useState(false)
  const [publicGamesError, setPublicGamesError] = useState('')

  const {
    scores,
    activePlayers,
    metadata,
    isConnected,
    error,
    incrementScore,
    decrementScore,
    togglePlayer,
    resetScores,
    updateScores,
    updateActivePlayers,
    deleteGame,
  } = useGameSession(currentGameId)

  const loadPublicGames = useCallback(async () => {
    setLoadingGames(true)
    setPublicGamesError('')
    try {
      const games = await listPublicGames()
      setPublicGames(games)
    } catch (err) {
      setPublicGamesError(
        `Could not load public games: ${err?.message || 'Check Firebase Database Rules.'}`
      )
    } finally {
      setLoadingGames(false)
    }
  }, [])

  useEffect(() => {
    loadPublicGames()
  }, [loadPublicGames])

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadPublicGames()
    }, 15000)

    return () => clearInterval(intervalId)
  }, [loadPublicGames])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gameFromUrl = params.get('game')
    const modeFromUrl = params.get('mode')

    if (gameFromUrl) {
      setCurrentGameId(gameFromUrl)
      setReadOnlyMode(modeFromUrl === 'view')
    }
  }, [])

  useEffect(() => {
    if (currentGameId && isConnected && Object.keys(scores).length === 0) {
      const initialScores = {}
      const initialActivePlayers = {}

      ALL_PLAYERS.forEach((p) => {
        initialScores[p.name] = 0
        initialActivePlayers[p.name] = true
      })

      updateScores(initialScores)
      updateActivePlayers(initialActivePlayers)
    }
  }, [currentGameId, isConnected, scores, updateScores, updateActivePlayers])

  useEffect(() => {
    const url = new URL(window.location.href)

    if (!currentGameId) {
      url.searchParams.delete('game')
      url.searchParams.delete('mode')
      window.history.replaceState({}, '', url.toString())
      return
    }

    url.searchParams.set('game', currentGameId)
    if (readOnlyMode) {
      url.searchParams.set('mode', 'view')
    } else {
      url.searchParams.delete('mode')
    }

    window.history.replaceState({}, '', url.toString())
  }, [currentGameId, readOnlyMode])

  const displayedPlayers = useMemo(() => {
    return ALL_PLAYERS.filter((p) => activePlayers[p.name])
  }, [activePlayers])

  const activeScores = useMemo(() => {
    const selected = {}
    displayedPlayers.forEach((p) => {
      selected[p.name] = scores[p.name] || 0
    })
    return selected
  }, [scores, displayedPlayers])

  const minScore = useMemo(() => {
    const values = Object.values(activeScores)
    return values.length > 0 ? Math.min(...values) : 0
  }, [activeScores])

  const maxScore = useMemo(() => {
    const values = Object.values(activeScores)
    return values.length > 0 ? Math.max(...values) : 0
  }, [activeScores])

  const handleStartGame = useCallback(async (payload) => {
    const {
      gameId = null,
      gameName = '',
      isPublic = true,
      forceReadOnly = false,
    } = payload || {}

    if (gameId) {
      const exists = await gameExists(gameId)
      if (!exists) throw new Error('Game not found')
      setCurrentGameId(gameId)
      setReadOnlyMode(Boolean(forceReadOnly))
      return
    }

    const newGameId = await createNewGame(ALL_PLAYERS, { name: gameName, isPublic })
    setCurrentGameId(newGameId)
    setReadOnlyMode(false)
    await loadPublicGames()
  }, [loadPublicGames])

  const handleJoinPublicGame = useCallback(async (gameId) => {
    await handleStartGame({ gameId, forceReadOnly: false })
  }, [handleStartGame])

  const handleLeaveGame = useCallback(async () => {
    setCurrentGameId(null)
    setReadOnlyMode(false)
    await loadPublicGames()
  }, [loadPublicGames])

  const handleDeleteGame = useCallback(async () => {
    await deleteGame()
    setCurrentGameId(null)
    setReadOnlyMode(false)
    await loadPublicGames()
  }, [deleteGame, loadPublicGames])

  const spectatorLink = useMemo(() => {
    if (!currentGameId) return ''
    const url = new URL(window.location.href)
    url.searchParams.set('game', currentGameId)
    url.searchParams.set('mode', 'view')
    return url.toString()
  }, [currentGameId])

  if (!currentGameId) {
    return (
      <GameSetup
        onStartGame={handleStartGame}
        publicGames={publicGames}
        publicGamesError={publicGamesError}
        loadingGames={loadingGames}
        onRefreshGames={loadPublicGames}
        onJoinPublicGame={handleJoinPublicGame}
      />
    )
  }

  return (
    <div className="app">
      <Header
        allPlayers={ALL_PLAYERS}
        activePlayers={activePlayers}
        onTogglePlayer={togglePlayer}
        onReset={resetScores}
        onDeleteGame={handleDeleteGame}
        gameId={currentGameId}
        gameName={metadata?.name || 'Untitled game'}
        isPublicGame={metadata?.isPublic !== false}
        isConnected={isConnected}
        onLeaveGame={handleLeaveGame}
        readOnlyMode={readOnlyMode}
        spectatorLink={spectatorLink}
      />

      {error && <div className="app__error">Connection error: {error}</div>}
      {readOnlyMode && (
        <div className="app__readonly-banner">Read-only mode: scores cannot be changed from this link.</div>
      )}

      <div className="scoreboard">
        {displayedPlayers.map((player) => (
          <ScoreColumn
            key={player.name}
            player={player}
            score={scores[player.name] || 0}
            minScore={minScore}
            maxScore={maxScore}
            onIncrement={() => incrementScore(player.name)}
            onDecrement={() => decrementScore(player.name)}
            readOnlyMode={readOnlyMode}
          />
        ))}
      </div>
    </div>
  )
}

export default App
