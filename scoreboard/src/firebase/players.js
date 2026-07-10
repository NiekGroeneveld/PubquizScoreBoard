import { useState, useEffect } from 'react'
import { ref, onValue, push, set, get, remove } from 'firebase/database'
import { database } from './config'
import { urlToDataUrl } from '../utils/image'

const PLAYERS_PATH = 'players'
const SEEDED_FLAG_PATH = 'meta/playersSeeded'

export function usePlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const playersRef = ref(database, PLAYERS_PATH)

    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val() || {}
      const list = Object.entries(data)
        .map(([id, p]) => ({ id, name: p.name, color: p.color, img: p.img || '' }))
        .sort((a, b) => (a.id < b.id ? -1 : 1))

      setPlayers(list)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { players, loading }
}

export async function addPlayer({ name, color, img }) {
  const playersRef = ref(database, PLAYERS_PATH)
  const newPlayerRef = push(playersRef)
  await set(newPlayerRef, { name: name.trim(), color, img: img || '' })
  return newPlayerRef.key
}

export async function deletePlayer(id) {
  await remove(ref(database, `${PLAYERS_PATH}/${id}`))
}

// One-time migration: on the very first run ever, populate the database with
// the original hardcoded figures so existing games keep working unchanged.
export async function ensureDefaultPlayersSeeded(defaults) {
  const seededSnapshot = await get(ref(database, SEEDED_FLAG_PATH))
  if (seededSnapshot.exists() && seededSnapshot.val()) return

  const playersRef = ref(database, PLAYERS_PATH)
  const existingSnapshot = await get(playersRef)
  if (existingSnapshot.exists()) {
    await set(ref(database, SEEDED_FLAG_PATH), true)
    return
  }

  for (const player of defaults) {
    const imgDataUrl = await urlToDataUrl(player.img)
    const newPlayerRef = push(playersRef)
    await set(newPlayerRef, { name: player.name, color: player.color, img: imgDataUrl })
  }

  await set(ref(database, SEEDED_FLAG_PATH), true)
}
