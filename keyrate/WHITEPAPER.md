# Keyrate Technical Whitepaper

**v2.0.0** | November 2026

Most typing sites bury the test under themes, accounts, and a leaderboard,
when the only thing anyone actually opens the page for is the number.
Keyrate is a typing test in one file. Words appear, you type them, the page tells you how fast. It borrows the idea from Monkeytype and 10fastfingers and drops everything that is not the test, because every one of those extras is a reason to distrust whether the number you get is the same number a stranger's site would give you. Live at [keyrate.jaybulb.com](https://keyrate.jaybulb.com); the test itself is at [/app](https://keyrate.jaybulb.com/app).

## Core Mechanic: Words Per Minute

There is one number that matters and one way to compute it. A "word" is five characters, spaces included. That is the convention every serious typing site uses, so scores here compare with scores there, which is the whole reason to follow convention instead of inventing a cleaner definition.

`score.js` owns the arithmetic, kept in one pure function so it can be tested on its own rather than trusted by eye. It takes the words you typed, the words you were shown, and the seconds elapsed. It walks both lists in step. Every matching character is correct. Every other character is wrong. The space after a word counts as correct only if the whole word was right, which is how a single typo costs you a little more than one character, matching how a real reader would judge the word wrong too.

From those two counts:

- raw is all characters over five over minutes
- wpm is correct characters over five over minutes
- accuracy is correct over total

Nothing else is derived. The function is pure and has a three-case test. Accuracy is judged on the final text, so a typo you fixed does not count against you.

### Accuracy, worked through

Accuracy is counted on the text you end with, not on every key you pressed. Say the words were "the cat" and you finished with "teh cat":

- t matches t: correct
- e against h, h against e: two wrong
- the space after "teh": wrong, because the whole word was wrong
- c, a, t: three correct

That is 4 correct and 3 wrong, so accuracy is 4 out of 7, 57 percent. Had you typed "teh", backspaced twice and fixed it to "the", the final text matches and accuracy is 100 percent: the fixed typo cost you time, which already shows in wpm, but not accuracy. This is the same rule `score.js`, the Kotlin and Swift ports and `vectors.json` all check.

### Pasting

One input event that adds more than 20 characters is a paste, not typing. A run with a paste still shows its numbers, but it cannot set a best: the result says "pasted, not counted". Twenty leaves room for a phone keyboard's word suggestion or an autocorrect, which land a whole word at once. The same rule lives in `session.js` (`PASTE_MAX`) and both native ports.

## Input

A hidden text input catches keystrokes. The page never reads keys directly for letters, so mobile keyboards, dead keys and input methods all work, since a raw keydown listener would have to reinvent everything the OS text field already does correctly. On each input event the current word is updated. A trailing space commits the word and moves on. Backspace at the start of a word steps back into the previous one, but only if that word was wrong, because a correct word should stay committed and not tempt you into re-typing something you already got right. A correct word is closed.

The visible text is rebuilt from the typed and target arrays on every keystroke, not patched in place. At a few hundred spans this is cheap and removes a whole class of state bugs that come from tracking incremental DOM edits by hand.

## Word Stream

Four hundred and sixty common English words, the same pool the reference sites use, picked at random with replacement so no memorized sequence can inflate a score. In timed mode the stream refills itself before the end comes into view. In word mode the list is fixed at the chosen count. Quote mode types one of ten short quotes. The punct toggle capitalizes some words, adds commas, periods and question marks, and swaps in the odd number.

Three lines are visible. The active line is held second from the top by scrolling the container, so the eye never has to chase the text down or up the page.

## Results

When the clock runs out or the last word lands, the test blurs and the numbers appear. The best result per mode is saved in `localStorage`, since a personal best is worth keeping locally without asking anyone to sign up for it. There is no server, no history and no leaderboard.

## Native apps

The same test runs in four more places, and each one has to give the same number for the same typing.

- `kmp/` is Kotlin Multiplatform with Compose: the Android app, and the desktop app for Mac, Windows and Linux (a Dmg, an Msi and a Deb).
- `apple/` is one SwiftUI target for iPhone, iPad and Mac.
- `tui/` is the terminal app. It reuses the Apple app's `Session.swift` and `Words.swift` as symlinks, so its rules and words are not a third copy.

What keeps them honest is `vectors.json`. `vectors.mjs` runs `score.js` over a list of cases (clean runs, typos, short words, empty input, near zero seconds, punctuation) and writes the expected numbers. The Kotlin port checks every case in `VectorsTest`, the Swift port in `VectorsTests` and in `keyrate-tui --check`, and the web in `vectors.test.mjs`. CI runs the web and Kotlin checks on Linux. A port that disagrees with `score.js` fails its tests, so a fix lands in `score.js` first and the vectors carry it everywhere else.

The paste rule, the five character word and final text accuracy are the same in every port. Each app keeps bests on the device only: `localStorage` on the web, SharedPreferences on Android (left out of backups), `java.util.prefs` on the desktop, UserDefaults on Apple devices, and `~/.keyrate` in the terminal.

## Hosting

Cloudflare Workers static assets. `.assetsignore` keeps the docs and tests off the edge. The design tokens come from the shared `tokens.css`, so light and dark follow the rest of the site.

## Out of scope

Custom word lists, themes, accounts and multiplayer. Any of these can be added, but none of them make the number more true, and that number is the only reason the page exists.

MIT. Copyright 2026 Joshua Trommel.
