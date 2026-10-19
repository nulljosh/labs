# Keyrate Technical Whitepaper

**v1.0.0** | September 2026

Most typing sites bury the test under themes, accounts, and a leaderboard,
when the only thing anyone actually opens the page for is the number.
Keyrate is a typing test in one file. Words appear, you type them, the page tells you how fast. It borrows the idea from Monkeytype and 10fastfingers and drops everything that is not the test, because every one of those extras is a reason to distrust whether the number you get is the same number a stranger's site would give you. Live at [keyrate.heyitsmejosh.com](https://keyrate.heyitsmejosh.com); the test itself is at [/app](https://keyrate.heyitsmejosh.com/app).

## Core Mechanic: Words Per Minute

There is one number that matters and one way to compute it. A "word" is five characters, spaces included. That is the convention every serious typing site uses, so scores here compare with scores there, which is the whole reason to follow convention instead of inventing a cleaner definition.

`score.js` owns the arithmetic, kept in one pure function so it can be tested on its own rather than trusted by eye. It takes the words you typed, the words you were shown, and the seconds elapsed. It walks both lists in step. Every matching character is correct. Every other character is wrong. The space after a word counts as correct only if the whole word was right, which is how a single typo costs you a little more than one character, matching how a real reader would judge the word wrong too.

From those two counts:

- raw is all characters over five over minutes
- wpm is correct characters over five over minutes
- accuracy is correct over total

Nothing else is derived. The function is pure and has a three-case test.

## Input

A hidden text input catches keystrokes. The page never reads keys directly for letters, so mobile keyboards, dead keys and input methods all work, since a raw keydown listener would have to reinvent everything the OS text field already does correctly. On each input event the current word is updated. A trailing space commits the word and moves on. Backspace at the start of a word steps back into the previous one, but only if that word was wrong, because a correct word should stay committed and not tempt you into re-typing something you already got right. A correct word is closed.

The visible text is rebuilt from the typed and target arrays on every keystroke, not patched in place. At a few hundred spans this is cheap and removes a whole class of state bugs that come from tracking incremental DOM edits by hand.

## Word Stream

Two hundred common English words, the same pool the reference sites use, picked at random with replacement so no memorized sequence can inflate a score. In timed mode the stream refills itself before the end comes into view. In word mode the list is fixed at the chosen count.

Three lines are visible. The active line is held second from the top by scrolling the container, so the eye never has to chase the text down or up the page.

## Results

When the clock runs out or the last word lands, the test blurs and the numbers appear. The best result per mode is saved in `localStorage`, since a personal best is worth keeping locally without asking anyone to sign up for it. There is no server, no history and no leaderboard.

## Hosting

Cloudflare Workers static assets. `.assetsignore` keeps the docs and tests off the edge. The design tokens come from the shared `tokens.css` so it matches the rest of the site.

## Out of scope

Custom word lists, punctuation, quotes, themes, accounts and multiplayer. Any of these can be added, but none of them make the number more true, and that number is the only reason the page exists.

MIT. Copyright 2026 Joshua Trommel.
