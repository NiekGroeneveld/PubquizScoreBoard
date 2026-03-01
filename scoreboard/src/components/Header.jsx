import { useState, useCallback } from 'react'
import './Header.css'

function Header({ showNiek, setShowNiek, onReset }) {
  const [confirmStep, setConfirmStep] = useState(0)

  const handleReset = useCallback(() => {
    if (confirmStep === 0) {
      setConfirmStep(1)
      setTimeout(() => setConfirmStep(0), 3000)
    } else if (confirmStep === 1) {
      setConfirmStep(2)
      setTimeout(() => setConfirmStep(0), 3000)
    } else {
      onReset()
      setConfirmStep(0)
    }
  }, [confirmStep, onReset])

  const resetLabel = confirmStep === 0
    ? 'Reset'
    : confirmStep === 1
      ? 'Sure?'
      : 'Really?!'

  return (
    <header className="header">
      <h1 className="header__title">Pubquiz 2026</h1>
      <div className="header__controls">
        <button
          className={`header__reset ${confirmStep > 0 ? 'header__reset--warn' : ''}`}
          onClick={handleReset}
        >
          {resetLabel}
        </button>
        <label className="header__toggle">
          <span className="header__toggle-label">Quizmaster</span>
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={showNiek}
              onChange={(e) => setShowNiek(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </div>
        </label>
      </div>
    </header>
  )
}

export default Header
