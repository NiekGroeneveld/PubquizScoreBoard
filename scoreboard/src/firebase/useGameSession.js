import { useState, useEffect, useCallback } from 'react'
import { ref, set, onValue, push, get, remove, update } from 'firebase/database'
import { database } from './config'

export function useGameSession(gameId) {
  const [scores, setScores] = useState({})
  const [activePlayers, setActivePlayers] = useState({})
  const [metadata, setMetadata] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!gameId) {
      setIsConnected(false)
      setMetadata(null)
      return
    }

    const gameRef = ref(database, `games/${gameId}`)

    const unsubscribe = onValue(
      gameRef,
      (snapshot) => {
        const data = snapshot.val()
        if (!data) {
          setError('Game not found')
          setIsConnected(false)
          return
        }

        setScores(data.scores || {})
        setActivePlayers(data.activePlayers || {})
        setMetadata({
          name: data.name || 'Untitled game',
          isPublic: data.isPublic !== false,
          style: data.style || 'hexagonal',
          createdAt: data.createdAt || 0,
          lastUpdated: data.lastUpdated || 0,
        })
        setIsConnected(true)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setIsConnected(false)
      }
    )

    return () => unsubscribe()
  }, [gameId])

  const touchGame = useCallback(async () => {
    if (!gameId) return
    await update(ref(database, `games/${gameId}`), { lastUpdated: Date.now() })
  }, [gameId])

  const updateScores = useCallback(
    async (newScores) => {
      if (!gameId) return
      await set(ref(database, `games/${gameId}/scores`), newScores)
      await touchGame()
    },
    [gameId, touchGame]
  )

  const updateActivePlayers = useCallback(
    async (newActivePlayers) => {
      if (!gameId) return
      await set(ref(database, `games/${gameId}/activePlayers`), newActivePlayers)
      await touchGame()
    },
    [gameId, touchGame]
  )

  const incrementScore = useCallback(
    async (playerName) => {
      if (!gameId) return
      const newScores = { ...scores, [playerName]: (scores[playerName] || 0) + 1 }
      await updateScores(newScores)
    },
    [gameId, scores, updateScores]
  )

  const decrementScore = useCallback(
    async (playerName) => {
      if (!gameId) return
      const newScores = { ...scores, [playerName]: (scores[playerName] || 0) - 1 }
      await updateScores(newScores)
    },
    [gameId, scores, updateScores]
  )

  const togglePlayer = useCallback(
    async (playerName) => {
      if (!gameId) return
      const newActivePlayers = {
        ...activePlayers,
        [playerName]: !activePlayers[playerName],
      }
      await updateActivePlayers(newActivePlayers)
    },
    [gameId, activePlayers, updateActivePlayers]
  )

  const resetScores = useCallback(async () => {
    if (!gameId) return
    const cleared = {}
    Object.keys(scores).forEach((name) => {
      cleared[name] = 0
    })
    await updateScores(cleared)
  }, [gameId, scores, updateScores])

  const deleteGame = useCallback(async () => {
    if (!gameId) return
    await remove(ref(database, `games/${gameId}`))
  }, [gameId])

  return {
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
  }
}

export async function createNewGame(players, options = {}) {
  const { name = 'Untitled game', isPublic = true, style = 'hexagonal' } = options

  const gamesRef = ref(database, 'games')
  const newGameRef = push(gamesRef)

  const initialScores = {}
  const initialActivePlayers = {}

  players.forEach((player) => {
    initialScores[player.name] = 0
    initialActivePlayers[player.name] = true
  })

  await set(newGameRef, {
    name: name.trim() || 'Untitled game',
    isPublic: Boolean(isPublic),
    style,
    scores: initialScores,
    activePlayers: initialActivePlayers,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  })

  return newGameRef.key
}

export async function gameExists(gameId) {
  const gameRef = ref(database, `games/${gameId}`)
  const snapshot = await get(gameRef)
  return snapshot.exists()
}

export async function listPublicGames() {
  try {
    const gamesRef = ref(database, 'games')
    const snapshot = await get(gamesRef)

    if (!snapshot.exists()) return []

    const data = snapshot.val()
    return Object.entries(data)
      .map(([id, game]) => ({
        id,
        name: game.name || 'Untitled game',
        isPublic: game.isPublic !== false,
        createdAt: game.createdAt || 0,
        lastUpdated: game.lastUpdated || 0,
      }))
      .filter((game) => game.isPublic)
      .sort((a, b) => b.lastUpdated - a.lastUpdated)
  } catch (err) {
    console.error('Failed to list public games. Check Firebase rules for /games read access.', err)
    throw err
  }
}
