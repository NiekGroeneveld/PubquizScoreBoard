import bartImg from '../assets/Bart.png'
import folkerImg from '../assets/Folker.png'
import ivanImg from '../assets/Ivan.png'
import leviImg from '../assets/Levi.png'
import mattiImg from '../assets/Matti.png'
import thijsImg from '../assets/Thijs.png'
import niekImg from '../assets/Niek.png'

// Seed data for the one-time migration into Firebase (see firebase/players.js).
// Images are bundled asset URLs here; they get converted to stable base64 data
// URLs before being written to the database.
export const DEFAULT_PLAYERS = [
  { name: 'Bart', color: '#00aaff', img: bartImg },
  { name: 'Folker', color: '#ffea00', img: folkerImg },
  { name: 'Ivan', color: '#d500f9', img: ivanImg },
  { name: 'Levi', color: '#00e5ff', img: leviImg },
  { name: 'Matti', color: '#ff6d00', img: mattiImg },
  { name: 'Niek', color: '#ff3d00', img: niekImg },
  { name: 'Thijs', color: '#00e676', img: thijsImg },
]
