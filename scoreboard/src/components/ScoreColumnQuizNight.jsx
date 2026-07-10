import { memo, useMemo } from 'react'
import './ScoreColumnQuizNight.css'

const ScoreColumnQuizNight = memo(function ScoreColumnQuizNight({
  player,
  score,
  minScore,
  maxScore,
  accentColor,
  onIncrement,
  onDecrement,
  readOnlyMode,
}) {
  const { name, img } = player
  const accent = accentColor || player.color
  const diffFromMin = score - minScore

  const accentStyle = {
    '--accent': accent,
    '--accent-18': accent + '2e',
    '--accent-33': accent + '55',
    '--accent-44': accent + '70',
  }

  const diffBlocks = useMemo(() => {
    return Array.from({ length: Math.max(0, diffFromMin) }, (_, i) => i)
  }, [diffFromMin])

  const emptyFlex = Math.max(0, maxScore - score)

  return (
    <div className="qn-column" style={accentStyle}>
      <div className="qn-column__blocks-area">
        <div className="qn-column__blocks-track">
          {emptyFlex > 0 && <div className="qn-column__spacer" style={{ flex: emptyFlex }} />}

          {diffBlocks.map((_, i) => (
            <div key={`diff-${i}`} className="qn-column__block" style={{ flex: 1 }} />
          ))}

          {minScore > 0 && (
            <div
              className="qn-column__block qn-column__block--base"
              style={{ flex: minScore }}
            />
          )}
        </div>
      </div>

      <div className="qn-column__score">{score}</div>

      <button
        className="qn-column__minus"
        onClick={onDecrement}
        disabled={readOnlyMode}
      >
        −
      </button>

      <button className="qn-column__photo" onClick={onIncrement} disabled={readOnlyMode}>
        {img ? (
          <img className="qn-column__photo-img" src={img} alt={name} />
        ) : (
          <span className="qn-column__photo-letter">{name.charAt(0).toUpperCase()}</span>
        )}
        <span className="qn-column__plus">＋</span>
      </button>

      <div className="qn-column__name">{name}</div>
    </div>
  )
})

export default ScoreColumnQuizNight
