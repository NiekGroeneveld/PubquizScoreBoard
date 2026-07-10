import { useState } from 'react'
import { fileToResizedDataUrl } from '../utils/image'
import './AdminPanel.css'

const COLOR_CHOICES = [
  '#00aaff', '#ffea00', '#d500f9', '#00e5ff',
  '#ff6d00', '#ff3d00', '#00e676', '#ff4081', '#76ff03', '#40c4ff',
]

function randomColor() {
  return COLOR_CHOICES[Math.floor(Math.random() * COLOR_CHOICES.length)]
}

function AdminPanel({ players, loading, onAddPlayer, onDeletePlayer }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(randomColor)
  const [imgPreview, setImgPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImgPreview('')
      return
    }
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      setImgPreview(dataUrl)
    } catch (err) {
      setError(`Failed to read image: ${err.message}`)
    }
  }

  const handleAdd = async () => {
    setError('')
    setSuccess('')
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter a name')
      return
    }
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A figure with that name already exists')
      return
    }

    setBusy(true)
    try {
      await onAddPlayer({ name: trimmed, color, img: imgPreview })
      setSuccess(`Added "${trimmed}"`)
      setName('')
      setColor(randomColor())
      setImgPreview('')
    } catch (err) {
      setError(`Failed to add figure: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id) => {
    setError('')
    setBusy(true)
    try {
      await onDeletePlayer(id)
    } catch (err) {
      setError(`Failed to remove figure: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel__container">
        <h1 className="admin-panel__title">Manage Figures</h1>

        <div className="admin-panel__form">
          <input
            type="text"
            className="admin-panel__input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="admin-panel__row">
            <label className="admin-panel__field-label">
              Color
              <input
                type="color"
                className="admin-panel__color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>
            <label className="admin-panel__field-label">
              Photo (optional)
              <input
                type="file"
                accept="image/*"
                className="admin-panel__file"
                onChange={handleFileChange}
              />
            </label>
            <div className="admin-panel__avatar" style={{ borderColor: color }}>
              {imgPreview ? (
                <img src={imgPreview} alt="Preview" />
              ) : (
                <span style={{ color }}>{name.trim().charAt(0).toUpperCase() || '?'}</span>
              )}
            </div>
          </div>

          <button
            className="admin-panel__btn admin-panel__btn--primary"
            onClick={handleAdd}
            disabled={busy}
          >
            {busy ? 'Adding...' : '+ Add Figure'}
          </button>

          {error && <div className="admin-panel__error">{error}</div>}
          {success && <div className="admin-panel__success">{success}</div>}
        </div>

        <div className="admin-panel__list-section">
          <h2>Current Figures {!loading && `(${players.length})`}</h2>
          {loading ? (
            <p className="admin-panel__empty">Loading...</p>
          ) : players.length === 0 ? (
            <p className="admin-panel__empty">No figures yet.</p>
          ) : (
            <ul className="admin-panel__list">
              {players.map((p) => (
                <li key={p.id} className="admin-panel__list-item">
                  <div className="admin-panel__list-avatar" style={{ borderColor: p.color }}>
                    {p.img ? (
                      <img src={p.img} alt={p.name} />
                    ) : (
                      <span style={{ color: p.color }}>{p.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="admin-panel__list-name">{p.name}</span>
                  <button
                    className="admin-panel__remove-btn"
                    onClick={() => handleDelete(p.id)}
                    disabled={busy}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <a className="admin-panel__back" href={window.location.pathname}>
          ← Back to app
        </a>
      </div>
    </div>
  )
}

export default AdminPanel
