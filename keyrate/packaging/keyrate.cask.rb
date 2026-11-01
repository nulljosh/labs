# Draft Homebrew cask for the desktop app (roadmap v44). Not submitted: it waits on a notarized Dmg (v43) published as
# a labs release; then fill sha256 from `shasum -a 256 Keyrate-2.0.0.dmg` and move it to homebrew-tap/Casks/.
cask "keyrate" do
  version "2.0.0"
  sha256 "REPLACE_WITH_THE_DMG_SHA256"

  url "https://github.com/nulljosh/labs/releases/download/keyrate-desktop-v#{version}/Keyrate-#{version}.dmg"
  name "Keyrate"
  desc "Typing test with nothing attached"
  homepage "https://keyrate.jaybulb.com"

  depends_on macos: ">= :sonoma"

  app "Keyrate.app"

  zap trash: "~/Library/Preferences/com.nulljosh.keyrate.plist"
end
