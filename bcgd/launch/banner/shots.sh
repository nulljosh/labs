#!/bin/zsh
# Takes fresh Doorstock iPhone screenshots on the simulator with demo data, into img/.
# Usage: ./shots.sh /path/to/BCGD.app   (a Debug simulator build)
set -e
cd "${0:A:h}"
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
APP=$1; BID=com.joshuatrommel.bcgd
# Uses the booted simulator if there is one (booting from a shell fails on this Mac with "launchd_sim ... bind to session").
DEV=${DEV:-$(xcrun simctl list devices booted | grep iPhone | grep -oE '[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}' | head -1)}
[[ -n $DEV ]] || { echo "boot an iPhone simulator in Simulator.app first"; exit 1; }
( xcrun simctl status_bar $DEV override --time 9:41 --dataNetwork wifi --wifiBars 3 --cellularBars 4 --batteryState charged --batteryLevel 100 &) ; sleep 5; pkill -f "simctl status_bar" || true   # hangs on a just-booted sim
xcrun simctl install $DEV "$APP"
HEX=$(python3 demo/demo-store.py | xxd -p | tr -d '\n')
xcrun simctl terminate $DEV $BID 2>/dev/null || true
xcrun simctl spawn $DEV defaults write $BID bcgd.store -data $HEX
for pair in 0:today 1:dashboard 2:inventory 3:jobs; do
  n=${pair%%:*}; name=${pair#*:}
  xcrun simctl terminate $DEV $BID 2>/dev/null || true
  xcrun simctl launch $DEV $BID -skipLock YES -qaTab $n >/dev/null
  sleep 3
  xcrun simctl io $DEV screenshot --type=png img/4-$name.png >/dev/null 2>&1
  echo "img/4-$name.png"
done
