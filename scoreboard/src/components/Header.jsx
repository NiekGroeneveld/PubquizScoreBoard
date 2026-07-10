import { useState, useCallback, useMemo } from 'react'
import './Header.css'

function Header({
  allPlayers,
  activePlayers,
  onTogglePlayer,
  onReset,
  onDeleteGame,
  gameId,
  gameName,
  isPublicGame,
  isConnected,
  onLeaveGame,
  readOnlyMode,
  spectatorLink,
  theme = 'hexagonal',
}) {
  const [resetConfirmStep, setResetConfirmStep] = useState(0)
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0)
  const [showChecklist, setShowChecklist] = useState(false)
  const [showGameInfo, setShowGameInfo] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedSpectator, setCopiedSpectator] = useState(false)

  const titleColor = useMemo(() => {
    const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)]
    return randomPlayer.color
  }, [allPlayers])

  const handleReset = useCallback(() => {
    if (readOnlyMode) return
    if (resetConfirmStep === 0) {
      setResetConfirmStep(1)
      setTimeout(() => setResetConfirmStep(0), 3000)
      return
    }
    if (resetConfirmStep === 1) {
      setResetConfirmStep(2)
      setTimeout(() => setResetConfirmStep(0), 3000)
      return
    }
    onReset()
    setResetConfirmStep(0)
  }, [onReset, readOnlyMode, resetConfirmStep])

  const handleDelete = useCallback(() => {
    if (readOnlyMode) return
    if (deleteConfirmStep === 0) {
      setDeleteConfirmStep(1)
      setTimeout(() => setDeleteConfirmStep(0), 3000)
      return
    }
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2)
      setTimeout(() => setDeleteConfirmStep(0), 3000)
      return
    }
    onDeleteGame()
    setDeleteConfirmStep(0)
  }, [deleteConfirmStep, onDeleteGame, readOnlyMode])

  const handleCopyGameId = useCallback(() => {
    if (!gameId) return
    navigator.clipboard.writeText(gameId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [gameId])

  const handleCopySpectatorLink = useCallback(() => {
    if (!spectatorLink) return
    navigator.clipboard.writeText(spectatorLink)
    setCopiedSpectator(true)
    setTimeout(() => setCopiedSpectator(false), 2000)
  }, [spectatorLink])

  const resetLabel = resetConfirmStep === 0 ? 'Reset' : resetConfirmStep === 1 ? 'Sure?' : 'Really?!'
  const deleteLabel =
    deleteConfirmStep === 0 ? 'Remove game' : deleteConfirmStep === 1 ? 'Sure?' : 'Delete now'

  return (
    <header className={`header header--${theme}`}>
      <h1
        className="header__title"
        style={theme === 'hexagonal' ? { color: titleColor, textShadow: `0 0 20px ${titleColor}` } : undefined}
      >
        Boys Scoreboard
      </h1>
      <div className="header__controls">
        <div className="header__game-info">
          <button className="header__game-toggle" onClick={() => setShowGameInfo(!showGameInfo)}>
            <span className={`header__status ${isConnected ? 'header__status--connected' : ''}`}></span>
            Game
          </button>
          {showGameInfo && (
            <div className="header__game-dropdown">
              <div className="header__game-name-row">
                <span className="header__game-name">{gameName || 'Untitled game'}</span>
                <span className={`header__visibility ${isPublicGame ? '' : 'header__visibility--private'}`}>
                  {isPublicGame ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="header__game-id">
                <label>Game ID:</label>
                <div className="header__game-id-value" onClick={handleCopyGameId}>
                  {gameId}
                  <span className="header__copy-hint">{copied ? 'Copied' : 'Click to copy'}</span>
                </div>
              </div>
              <div className="header__spectator-link" onClick={handleCopySpectatorLink}>
                <label>Read-only link:</label>
                <div className="header__spectator-link-value">
                  {copiedSpectator ? 'Copied read-only link' : 'Click to copy spectator link'}
                </div>
              </div>
              <button className="header__leave-btn" onClick={onLeaveGame}>
                Leave game
              </button>
            </div>
          )}
        </div>

        <div className="header__players">
          <button className="header__players-toggle" onClick={() => setShowChecklist(!showChecklist)}>
            Players ({Object.values(activePlayers).filter(Boolean).length}/{allPlayers.length})
          </button>
          <button
            className={`header__reset ${resetConfirmStep > 0 ? 'header__reset--warn' : ''}`}
            onClick={handleReset}
            disabled={readOnlyMode}
          >
            {resetLabel}
          </button>
          <button
            className={`header__delete ${deleteConfirmStep > 0 ? 'header__delete--warn' : ''}`}
            onClick={handleDelete}
            disabled={readOnlyMode}
          >
            {deleteLabel}
          </button>
          {showChecklist && (
            <div className="header__checklist">
              {allPlayers.map((player) => (
                <label key={player.name} className="header__checklist-item">
                  <input
                    type="checkbox"
                    checked={Boolean(activePlayers[player.name])}
                    onChange={() => onTogglePlayer(player.name)}
                    disabled={readOnlyMode}
                  />
                  <span>{player.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
