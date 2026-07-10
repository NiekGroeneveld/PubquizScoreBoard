import { memo, useMemo } from 'react'
import './ScoreColumn.css'

const ScoreColumn = memo(function ScoreColumn({
  player,
  score,
  minScore,
  maxScore,
  onIncrement,
  onDecrement,
  readOnlyMode,
}) {
  const { name, color, img } = player
  const diffFromMin = score - minScore

  const glowStyle = {
    '--glow': color,
    '--glow-dim': color + '33',
    '--glow-mid': color + '88',
  }

  // Build array of individual blocks for points above minimum
  const diffBlocks = useMemo(() => {
    return Array.from({ length: Math.max(0, diffFromMin) }, (_, i) => i)
  }, [diffFromMin])

  // Use flex values so everything scales relative to maxScore
  // Empty space at top = maxScore - score, each diff block = 1, base block = minScore
  const emptyFlex = Math.max(0, maxScore - score)

  return (
    <div className="score-column" style={glowStyle}>
      {/* Blocks area – scaled relative to highest score */}
      <div className="score-column__blocks-area">
        <div className="score-column__blocks-track">
          {/* Spacer pushes blocks down proportionally */}
          {emptyFlex > 0 && (
            <div className="score-column__spacer" style={{ flex: emptyFlex }} />
          )}

          {/* Individual diff blocks (one per point above minimum) */}
          {diffBlocks.map((_, i) => (
            <div
              key={`diff-${i}`}
              className="score-column__block"
              style={{
                flex: 1,
                background: `linear-gradient(to top, ${color}, ${color}bb)`,
                boxShadow: `0 0 6px ${color}55`,
                borderColor: color,
              }}
            />
          ))}

          {/* Base block – represents the score everyone shares */}
          {minScore > 0 && (
            <div
              className="score-column__block score-column__block--base"
              style={{
                flex: minScore,
                background: `linear-gradient(to top, ${color}66, ${color}33)`,
                boxShadow: `0 0 8px ${color}44`,
                borderColor: color + '88',
              }}
            />
          )}
        </div>
      </div>

      {/* Absolute score */}
      <div className="score-column__score" style={{ color }}>
        {score}
      </div>

      {/* Minus button */}
      <button
        className="score-column__minus"
        onClick={onDecrement}
        disabled={readOnlyMode}
        style={{
          color,
          borderColor: color + '66',
        }}
      >
        −
      </button>

      {/* Hexagonal photo button (increment) */}
      <button className="hex-button" onClick={onIncrement} disabled={readOnlyMode}>
        <svg viewBox="0 0 100 100" className="hex-button__svg">
          <defs>
            <clipPath id={`hex-clip-${name}`}>
              <polygon points="26,8 74,8 98,50 74,92 26,92 2,50" />
            </clipPath>
            <filter id={`glow-${name}`}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Outer glow hexagon */}
          <polygon
            points="26,8 74,8 98,50 74,92 26,92 2,50"
            fill="none"
            stroke={color}
            strokeWidth="3"
            filter={`url(#glow-${name})`}
            className="hex-button__border"
          />
          {/* Photo, or a first-letter placeholder when no photo is set */}
          {img ? (
            <image
              href={img}
              x="5"
              y="5"
              width="90"
              height="90"
              clipPath={`url(#hex-clip-${name})`}
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <g clipPath={`url(#hex-clip-${name})`}>
              <rect x="5" y="5" width="90" height="90" fill={color} />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Orbitron', sans-serif"
                fontSize="42"
                fontWeight="900"
                fill="#0a0a0a"
              >
                {name.charAt(0).toUpperCase()}
              </text>
            </g>
          )}
        </svg>
        <span className="hex-button__plus">＋</span>
      </button>

      {/* Player name at the bottom */}
      <div className="score-column__name" style={{ color }}>
        {name}
      </div>
    </div>
  )
})

export default ScoreColumn
