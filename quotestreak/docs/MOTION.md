# Coda motion and sound

Motion and sound in Coda say one thing each: you got it, you didn't, keep going. They never decorate a timed question. This is the system; `brand/tokens.css` and `sound.js` hold the values.

## Motion

Three speeds and one curve. Things arrive fast and settle, like a marquee bulb coming on.

| Token | Value | Used for |
|---|---|---|
| `--motion-fast` | 150 ms | Presses, small state changes |
| `--motion` | 250 ms | A question sliding in |
| `--motion-slow` | 400 ms | The right answer's pulse, the wrong answer's shake, the score bump |
| `--ease-out` | cubic-bezier(.2, .8, .2, 1) | Everything above |

What moves, and why:

- A new question slides in, so the eye knows the board changed.
- The right answer pulses green and throws confetti from the button; every fifth in a row throws more. The wrong answer shakes once, red. Colour carries the meaning, motion only points at it.
- The score and streak bump when they change.
- The art flashes behind the board for under a second after a right answer.
- Quip bobs on the menu and end screens. In the round a small live Quip (v95) only blinks and reacts to answers; he never moves across the board.
- The landing page's poster wall drifts. The game's wall is still, because a moving wall behind a ten-second clock fights the clock.
- Album and poster reveals unblur over seven seconds. That is the game, not decoration, so it stays even with reduced motion.

Reduced motion: if the system asks, nothing moves (`features.css` sets every animation and transition to 1 ms, except the reveal). Confetti is not drawn at all.

## Sound

Every sound is synthesized with Web Audio, a few notes on one voice, and follows the Sound effects switch and Volume in Settings. Nothing plays without a tap first, since browsers start audio only after one.

| Cue | Notes | When |
|---|---|---|
| right | 660 then 880 Hz | A right answer: up a fifth |
| streak | 660, 880, 1100 Hz | Every fifth right in a row, instead of right |
| wrong | 196 Hz, 0.22 s | A wrong answer or a timeout: one low note, not a buzzer |
| tick | 1000 Hz, 40 ms | Each of a speed round's last three seconds |
| badge | 1320 then 1760 Hz | A badge is earned |
| over | 523, 392, 330 Hz | The game ends: down to rest |

The apps play the same cues from `Sound.swift` (right, streak and wrong so far) and add haptics at the same moments.
