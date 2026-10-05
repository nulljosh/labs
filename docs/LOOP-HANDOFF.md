# Hamurapi loop handoff (2026-10-04, evening)

## What the loop is

Ship Hamurapi to the App Store on iPhone and Mac, then make it playable inside Joshua Tree, then work through the rest of the fleet apps queued for the OS.

## Where things stand

The game was Hamurabi until tonight. That name is taken on the App Store, so it is Hamurapi everywhere now: this repo, the folder, the site (hamurapi.heyitsmejosh.com; the old address still serves) and the store listing. The bundle ID stays `com.nulljosh.hamurabi`.

The App Store record is 6819131590. Both versions are at 1.0.0 with build 202610042011 attached, and the listing is complete: text, keywords, screenshots, age rating, category, price (free), territories (all but China mainland), privacy and review notes. `asc validate` shows no errors and no warnings on either platform.

Nothing is submitted yet. Hikko went to review on 2026-10-04, and several submissions on one day is what set off the spam rejections in August.

The Joshua Tree port lives in `nulljosh/joshuatree` PR 407 (draft). The rules and story are in C and match the golden numbers. The title screen opens in the OS. Gameplay is being built.

## Next, in order

1. Morning of 2026-10-05: submit both platforms.
   `asc review submit --app 6819131590 --version-id 5ab08ffd-462c-4311-a3f7-071d703de7a4 --build 5b713251-268d-4b48-97e9-22fb6b7a3cba --confirm`
   `asc review submit --app 6819131590 --version-id 1f23c508-498a-4f4e-b31c-041ab09e8f3a --build 4fcf48d7-4b97-41bc-9b11-db91b6507df9 --confirm`
2. The day Apple approves it: schedule the $0.99 price for seven days later (command in `MONEY.md`).
3. Joshua Tree: finish gameplay in PR 407, run the full local suite, merge on green. Add a screenshot of the game in the OS to this README and the landing page.
4. Joshua Tree is nearly out of room for built-in apps. Fix that before the queued fleet apps.

## Restart prompt

```
/loop until all platforms including Joshua tree are supported. Ship to App Store.
```
