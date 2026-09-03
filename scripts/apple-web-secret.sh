#!/bin/sh
# Regenerates the Sign in with Apple WEB client secret (ES256 JWT, 6-month max) and PATCHes it into
# the shared spark Supabase project. Rerun before it expires or web Apple sign-in dies silently.
# Team QMM486NPYC, key RYV8DK7S9J, Services ID com.heyitsmejosh.websignin.
set -e
KEY=~/.appstoreconnect/siwa/AuthKey_RYV8DK7S9J.p8
JWT=$(python3 - "$KEY" <<'PY'
import sys, json, time, base64, subprocess, tempfile, os
b64 = lambda b: base64.urlsafe_b64encode(b).rstrip(b"=").decode()
now = int(time.time())
hdr = b64(json.dumps({"alg":"ES256","kid":"RYV8DK7S9J"}).encode())
pay = b64(json.dumps({"iss":"QMM486NPYC","iat":now,"exp":now+15552000,"aud":"https://appleid.apple.com","sub":"com.heyitsmejosh.websignin"}).encode())
msg = f"{hdr}.{pay}".encode()
der = subprocess.run(["openssl","dgst","-sha256","-sign",sys.argv[1]], input=msg, capture_output=True, check=True).stdout
# DER -> raw r||s
i = 2; assert der[i] == 2; l = der[i+1]; r = der[i+2:i+2+l]; i += 2+l; assert der[i] == 2; l = der[i+1]; s = der[i+2:i+2+l]
raw = r[-32:].rjust(32, b"\0") + s[-32:].rjust(32, b"\0")
print(f"{hdr}.{pay}.{b64(raw)}")
PY
)
PAT=$(security find-generic-password -s "Supabase CLI" -w)
CUR=$(curl -s -H "Authorization: Bearer $PAT" https://api.supabase.com/v1/projects/tjsxsqlxjmanwvmywwvw/config/auth | python3 -c 'import json,sys;print(json.load(sys.stdin)["external_apple_client_id"])')
# Services ID must be FIRST: Supabase uses the first entry as client_id for the web OAuth flow.
IDS="com.heyitsmejosh.websignin,$(echo "$CUR" | tr , "\n" | grep -v websignin | paste -sd, -)"
# Only the external_apple_* fields: this project is shared, never send site_url or uri_allow_list here.
curl -s -X PATCH -H "Authorization: Bearer $PAT" -H "Content-Type: application/json" \
  https://api.supabase.com/v1/projects/tjsxsqlxjmanwvmywwvw/config/auth \
  -d "{\"external_apple_enabled\":true,\"external_apple_client_id\":\"$IDS\",\"external_apple_secret\":\"$JWT\"}" >/dev/null
echo "secret set, expires $(date -v+180d +%F)"
curl -s "https://tjsxsqlxjmanwvmywwvw.supabase.co/auth/v1/authorize?provider=apple&redirect_to=https://spark.heyitsmejosh.com/" | grep -o "client_id=[^&]*"
