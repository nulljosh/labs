# Hamurabi loop handoff (2026-10-04, 22:15 PT)

## What the loop is

App Store submission loop for Hamurabi 1.0.0 (a 1968 kingdom game reimagined as visual city-building). Web, Mac, iPhone, and CLI all live. App Store only: free for one week, then $0.99. Loop exits once the app is live on all platforms and Joshua Tree port starts.

## Where things stand

Web game live at hamurabi.heyitsmejosh.com. Mac and iPhone apps ready to submit. Signed builds in `.asc/artifacts/`. Metadata, screenshots, and privacy policy prepared. App Store bundle ID `com.nulljosh.hamurabi` registered but app record not yet created. Apple's sign-in requirement was blocking record creation; waits until 2026-10-05 morning to avoid same-day app spam wave.

Code review found and fixed a real bug: selling all your land could trap the player on a story card. Now prevented by blocking land sale if it would leave inventory negative.

## Next in order

1. asc-login (one retry only, Joshua clicks Allow button when prompted for 2FA)
2. Create app record: `asc web apps create --name "Hamurabi" --bundle-id com.nulljosh.hamurabi --sku HAMURABI001`
3. Put the returned app ID in `.asc/workflow.json` under `app_id`
4. Upload everything: signed IPA and Mac build from `.asc/artifacts/`, metadata from `metadata/`, screenshots from `screenshots/iphone` and `screenshots/mac`, set age rating, confirm privacy (nothing collected), select all territories except China mainland, set pricing to free
5. Hold the submit until 2026-10-05 morning unless Joshua says submit tonight
6. After approval, schedule $0.99 via `asc web in-app-purchases create` (details in MONEY.md) for the approval day plus 7 days
7. Then Joshua Tree port (not started yet)

## How to work

Use `asc` CLI commands, not the web dashboard. All work on the hamurabi branch. Commit changes and push to open a PR on GitHub (main is protected, needs tests/docs/app checks to pass). Merge once CI is green. Restart prompt below ready to paste.

## Restart prompt

```
/loop until all platforms including Joshua Tree port are supported, then ship to App Store.

Hamurabi 1.0.0 waiting for App Store submission. Web live, Mac and iPhone ready. Signed builds, metadata, screenshots all prepared. Apple's sign-in was blocking app record creation; waits until 2026-10-05 morning. Plan: asc-login (Joshua clicks Allow), create app record with asc web apps create, put app ID in workflow.json, upload builds and metadata via asc, hold submit until morning, then schedule $0.99 for approval day plus 7. Joshua Tree port after approval. Commit and push work to main via PR.
```
