export const BOARD_STYLES = [
  {
    id: 'hexagonal',
    label: 'Hexagonal',
    description: 'Neon hex photo tiles on black',
  },
  {
    id: 'quiznight',
    label: 'Quiz Night',
    description: 'Warm dark cards, gold & round accents',
  },
]

// Rotating round-accent colors from the Quiz Night design system, applied to
// score columns and figures in the order players are displayed.
export const QUIZNIGHT_ACCENTS = ['#F5B841', '#E4572E', '#E14FA0', '#4FC978', '#5B9BF0']

export function quiznightAccentFor(index) {
  return QUIZNIGHT_ACCENTS[index % QUIZNIGHT_ACCENTS.length]
}
