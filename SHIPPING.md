# Ship an app to the App Store from your terminal

Most people ship their first app by clicking around Xcode and App Store Connect for a week. Every app in this codebase ships with one command. This is the whole method, in the order you need it.

You need a Mac, Xcode, a paid Apple Developer account, and the [`asc` CLI](https://asccli.sh).

```sh
brew install xcodegen asc
```

## 1. Sign in once

Make an API key in App Store Connect under Users and Access, Integrations. Download the `.p8` file. Then:

```sh
asc auth login --name me --key-id KEYID --issuer-id ISSUER --private-key ~/AuthKey_KEYID.p8
asc auth status
```

That key does almost everything. You never open the dashboard to upload a build again.

## 2. Describe the project in a file, not in Xcode

Keep a `project.yml` and let xcodegen build the `.xcodeproj`. Do not commit the generated project. One file, readable diffs, and iPhone plus Mac from the same source with `supportedDestinations`.

```sh
xcodegen generate
```

Two things that will bite you. Set `LSApplicationCategoryType` in your Info.plist or the Mac upload fails with ITMS-90242, which looks like a signing error and is not. Set `ITSAppUsesNonExemptEncryption` to false or the submit step blocks on a missing encryption declaration.

## 3. Create the app record

This is the one step Apple gives no API for. Open App Store Connect, press New App, pick your bundle ID, pick a name. Names are a global namespace and the good ones are taken, so check before you fall in love with one.

Write down the app ID. It is the number in the URL.

## 4. Signing, without the keychain dance

```sh
asc signing fetch --bundle-id com.you.app --profile-type IOS_APP_STORE --create-missing
```

Point an `ExportOptions.plist` at manual signing with the profile it fetched. Use your team ID in it, not the provider ID. They look alike and only one works.

## 5. Metadata lives in the repo

Description, keywords, what's new, and screenshots sit under `./metadata` and get pushed up. You review them in a pull request like everything else.

```sh
asc metadata pull --app APP_ID --version 1.0.0 --dir ./metadata
asc metadata push --app APP_ID --version 1.0.0 --dir ./metadata
asc screenshots upload --version-localization LOCALIZATION_ID --path ./screenshots --device-type IPHONE_65
```

## 6. One file that ships the app

Put this at `.asc/workflow.json`. Swap in your project name and app ID.

```json
{
  "env": { "IOS_APP_ID": "0000000000", "VERSION": "", "SUBMIT": "true" },
  "before_all": "asc auth status",
  "workflows": {
    "ship-ios": { "description": "Bump, archive, upload, submit iOS", "steps": [
      { "name": "bump", "run": "asc xcode version edit --version \"$VERSION\" --build-number \"$(date +%Y%m%d%H%M)\"" },
      { "name": "archive", "run": "asc xcode archive --project App.xcodeproj --scheme App --archive-path .asc/artifacts/App.xcarchive --overwrite --xcodebuild-flag=-allowProvisioningUpdates --output json" },
      { "name": "export", "run": "asc xcode export --archive-path .asc/artifacts/App.xcarchive --export-options ExportOptions.plist --overwrite --ipa-path .asc/artifacts/App.ipa --output json" },
      { "name": "publish", "if": "SUBMIT", "run": "asc publish appstore --app $IOS_APP_ID --ipa .asc/artifacts/App.ipa --version $VERSION --wait --submit --confirm --output json" }
    ] }
  }
}
```

## 7. Check, then ship

```sh
asc validate --app APP_ID --version 1.0.0 --output json
asc workflow run ship-ios VERSION:1.0.0
```

`validate` tells you everything review would bounce you for before you wait two days to find out. Fix what it lists. Then the second line bumps the version, archives, exports, uploads, and submits for review.

`SUBMIT:false` uploads without submitting. `--resume <run-id>` picks a failed run up where it stopped.

After an upload, confirm it landed. The CLI has reported success on builds that never arrived.

```sh
asc builds uploads list --app APP_ID
```

## 8. What review actually rejects

First release needs availability set. List territories, then create availability, or the version sits there unable to go live. If you get a Guideline 2.1 note about a publishing permit, drop China from the territories and resubmit.

App Privacy answers have to be published before you submit, not after.

If you ship several small apps at once, expect Guideline 4.3(a), the spam rule. Do not resubmit the same build. Reply in the Resolution Center and say plainly what the app does that the others do not. Appeals work. We have won them.

Sign in with Apple is required if you offer any other social sign in.

## The loop after that

Every release from then on is one line.

```sh
asc workflow run ship-ios VERSION:1.0.1
```

That's it. That's the whole method.
