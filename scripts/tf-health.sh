#!/bin/bash
# TestFlight health check across all apps
python3 << 'PYEOF'
import subprocess, json

APPS = {
    "6779522175": "Epiphany iOS",
    "6782703473": "Epiphany Mac",
    "6782366555": "Talli iOS",
    "6782661988": "Talli Mac",
    "6785162492": "Spark iOS",
    "6782604262": "Echo iOS",
    "6783015101": "Echo Mac",
    "6783501611": "LingoAce iOS",
    "6783501927": "LingoAce Mac",
    "6782618198": "NYC iOS",
}

for app_id, name in APPS.items():
    builds = json.loads(subprocess.run(["asc","builds","list","--app",app_id,"--output","json"], capture_output=True, text=True).stdout or "{}").get("data",[])
    groups = json.loads(subprocess.run(["asc","testflight","groups","list","--app",app_id,"--output","json"], capture_output=True, text=True).stdout or "{}").get("data",[])
    b = builds[0]["attributes"] if builds else {}
    flags = []
    if b.get("usesNonExemptEncryption") is None: flags.append("COMPLIANCE UNSET")
    if not groups: flags.append("NO TF GROUPS")
    if b.get("expired"): flags.append("EXPIRED")
    status = "✅" if not flags else "❌ " + " | ".join(flags)
    print(f"{status}  {name} (build {b.get('version','?')})")
PYEOF
