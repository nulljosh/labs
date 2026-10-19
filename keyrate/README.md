<img src="icon.svg" width="80" style="border-radius:18px">

# Keyrate

![version](https://img.shields.io/badge/version-v1.0.0-blue) ![license](https://img.shields.io/badge/license-MIT-green) [![GitHub](https://img.shields.io/badge/GitHub-nulljosh%2Fkeyrate-black?logo=github)](https://github.com/nulljosh/labs/tree/main/keyrate)

How fast do you type? Every site that answers wants an account, a theme picker and forty settings before it shows you a number.

That's the gap.

<img src="progress.svg" width="460">

## What it does

Words appear. You type them. The clock runs out and you get one number.

<img src="screenshots/typing.png" width="600">

Wrong letters go red. Backspace into a bad word to fix it. Tab restarts. Your best per mode stays in the browser and nowhere else.

<img src="screenshots/result.png" width="600">

## Why this and not Monkeytype

Monkeytype is great. It is also a settings page with a typing test attached. This is the test with nothing attached. One page, one script, no build step.

## Run it

```
15 / 30 / 60 seconds, or 25 / 50 words
Tab            restart
Enter          restart after a result
```

```
node --test
npx wrangler deploy
```

Live at [keyrate.jaybulb.com](https://keyrate.jaybulb.com); the test itself is at [/app](https://keyrate.jaybulb.com/app).

**Terminal:** `swift build && ./.build/debug/keyrate-tui "target text" "typed text" 3.2` — see [tui/](tui/)

## Architecture

<img src="architecture.svg" width="600">
