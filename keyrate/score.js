// Pure scoring. Words = every 5 chars typed (incl. spaces), the 10fastfingers/Monkeytype convention.
export function stats(typed, target, seconds) {
  let correct = 0, wrong = 0, correctWords = 0
  typed.forEach((w, i) => {
    const t = target[i] ?? ''
    if (w === t) correctWords++
    for (let c = 0; c < w.length; c++) (w[c] === t[c] ? correct++ : wrong++)
    if (i < typed.length - 1) (w === t ? correct++ : wrong++) // the space after a word counts
  })
  const min = Math.max(seconds, 0.001) / 60
  const total = correct + wrong
  return {
    wpm: Math.round(correct / 5 / min),
    raw: Math.round(total / 5 / min),
    accuracy: total ? Math.round((correct / total) * 100) : 100,
    correct, wrong, correctWords,
  }
}
