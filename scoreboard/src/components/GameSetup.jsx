import { useState } from 'react'
import './GameSetup.css'

function formatTimestamp(ts) {
  if (!ts) return 'unknown'
  return new Date(ts).toLocaleString()
}

function GameSetup({
  onStartGame,
  publicGames,
  publicGamesError,
  loadingGames,
  onRefreshGames,
  onJoinPublicGame,
}) {
  const [gameId, setGameId] = useState('')
  const [gameName, setGameName] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleCreateGame = async () => {
    setBusy(true)
    setError('')
    try {
      await onStartGame({
        gameName: gameName.trim(),
        isPublic,
      })
    } catch (err) {
      setError(`Failed to create game: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  const handleJoinById = async () => {
    if (!gameId.trim()) {
      setError('Please enter a game ID')
      return
    }

    setBusy(true)
    setError('')
    try {
      await onStartGame({ gameId: gameId.trim() })
    } catch (err) {
      setError(`Failed to join game: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  const handleJoinPublic = async (id) => {
    setBusy(true)
    setError('')
    try {
      await onJoinPublicGame(id)
    } catch (err) {
      setError(`Failed to join game: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="game-setup">
      <div className="game-setup__container">
        <h1 className="game-setup__title">Boys Scoreboard</h1>

        <div className="game-setup__section">
          <input
            type="text"
            className="game-setup__input"
            placeholder="Game name (optional)"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
          />
          <label className="game-setup__checkbox-row">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span>Public game (shown on start page)</span>
          </label>
          <button
            className="game-setup__btn game-setup__btn--primary"
            onClick={handleCreateGame}
            disabled={busy}
          >
            {busy ? 'Creating...' : '+ Start New Game'}
          </button>
        </div>

        <div className="game-setup__divider">
          <span>OR</span>
        </div>

        <div className="game-setup__section">
          <input
            type="text"
            className="game-setup__input"
            placeholder="Enter private game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinById()}
          />
          <button
            className="game-setup__btn game-setup__btn--secondary"
            onClick={handleJoinById}
            disabled={busy || !gameId.trim()}
          >
            Join By ID
          </button>
        </div>

        <div className="game-setup__public">
          <div className="game-setup__public-header">
            <h2>Available Public Games</h2>
            <button className="game-setup__refresh" onClick={onRefreshGames} disabled={loadingGames || busy}>
              {loadingGames ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {publicGames.length === 0 ? (
            <p className="game-setup__empty">No public games right now.</p>
          ) : (
            <ul className="game-setup__list">
              {publicGames.map((game) => (
                <li key={game.id} className="game-setup__list-item">
                  <div className="game-setup__list-meta">
                    <div className="game-setup__list-name">{game.name}</div>
                    <div className="game-setup__list-time">Updated: {formatTimestamp(game.lastUpdated)}</div>
                  </div>
                  <button
                    className="game-setup__join-btn"
                    onClick={() => handleJoinPublic(game.id)}
                    disabled={busy}
                  >
                    Join
                  </button>
                </li>
              ))}
            </ul>
          )}
          {publicGamesError && <p className="game-setup__public-error">{publicGamesError}</p>}
        </div>

        {error && <div className="game-setup__error">{error}</div>}
      </div>
    </div>
  )
}

export default GameSetup
