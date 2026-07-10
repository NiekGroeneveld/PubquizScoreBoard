import { useState, useCallback, useMemo, useEffect } from 'react'
import ScoreColumn from './components/ScoreColumn'
import ScoreColumnQuizNight from './components/ScoreColumnQuizNight'
import Header from './components/Header'
import GameSetup from './components/GameSetup'
import AdminPanel from './components/AdminPanel'
import {
  useGameSession,
  createNewGame,
  gameExists,
  listPublicGames,
} from './firebase/useGameSession'
import { usePlayers, addPlayer, deletePlayer, ensureDefaultPlayersSeeded } from './firebase/players'
import { DEFAULT_PLAYERS } from './data/defaultPlayers'
import { quiznightAccentFor } from './data/themes'
import { ADMIN_TOKEN } from './config/admin'
import './App.css'

function App() {
  const { players, loading: playersLoading } = usePlayers()

  const isAdminMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('admin') === ADMIN_TOKEN
  }, [])

  useEffect(() => {
    ensureDefaultPlayersSeeded(DEFAULT_PLAYERS)
  }, [])

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

      players.forEach((p) => {
        initialScores[p.name] = 0
        initialActivePlayers[p.name] = true
      })

      updateScores(initialScores)
      updateActivePlayers(initialActivePlayers)
    }
  }, [currentGameId, isConnected, scores, players, updateScores, updateActivePlayers])

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
    return players.filter((p) => activePlayers[p.name])
  }, [players, activePlayers])

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
      style = 'hexagonal',
      forceReadOnly = false,
    } = payload || {}

    if (gameId) {
      const exists = await gameExists(gameId)
      if (!exists) throw new Error('Game not found')
      setCurrentGameId(gameId)
      setReadOnlyMode(Boolean(forceReadOnly))
      return
    }

    const newGameId = await createNewGame(players, { name: gameName, isPublic, style })
    setCurrentGameId(newGameId)
    setReadOnlyMode(false)
    await loadPublicGames()
  }, [loadPublicGames, players])

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

  if (isAdminMode) {
    return (
      <AdminPanel
        players={players}
        loading={playersLoading}
        onAddPlayer={addPlayer}
        onDeletePlayer={deletePlayer}
      />
    )
  }

  if (!currentGameId) {
    if (playersLoading) {
      return <div className="app__loading">Loading...</div>
    }

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

  const boardStyle = metadata?.style || 'hexagonal'
  const isQuizNight = boardStyle === 'quiznight'
  const ScoreColumnComponent = isQuizNight ? ScoreColumnQuizNight : ScoreColumn

  return (
    <div className={`app app--${boardStyle}`}>
      <Header
        allPlayers={players}
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
        theme={boardStyle}
      />

      {error && <div className="app__error">Connection error: {error}</div>}
      {readOnlyMode && (
        <div className="app__readonly-banner">Read-only mode: scores cannot be changed from this link.</div>
      )}

      <div className="scoreboard">
        {displayedPlayers.map((player, index) => (
          <ScoreColumnComponent
            key={player.name}
            player={player}
            score={scores[player.name] || 0}
            minScore={minScore}
            maxScore={maxScore}
            accentColor={isQuizNight ? quiznightAccentFor(index) : undefined}
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
