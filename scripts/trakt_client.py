#!/usr/bin/env python3
"""Trakt API client — auth, search, watchlist, history, ratings.

Setup:
  1. Create an app at https://trakt.tv/oauth/applications (redirect: urn:ietf:wg:oauth:2.0:oob)
  2. export TRAKT_CLIENT_ID=... TRAKT_CLIENT_SECRET=...
  3. trakt_client.py auth        # one-time device login

Usage:
  trakt_client.py search <query> [--type movie|show]
  trakt_client.py watchlist [add|remove <type> <trakt_id>]
  trakt_client.py history [--type movie|show] [--limit N]
  trakt_client.py ratings [--type movie|show]
  trakt_client.py watched <type> <trakt_id>   # mark as watched now
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

API = "https://api.trakt.tv"
TOKEN_PATH = os.path.expanduser("~/.trakt/token.json")


def _client():
    cid = os.environ.get("TRAKT_CLIENT_ID")
    secret = os.environ.get("TRAKT_CLIENT_SECRET")
    if not cid or not secret:
        sys.exit("Set TRAKT_CLIENT_ID and TRAKT_CLIENT_SECRET (create an app at https://trakt.tv/oauth/applications)")
    return cid, secret


def _load_token():
    if not os.path.exists(TOKEN_PATH):
        return None
    with open(TOKEN_PATH) as f:
        return json.load(f)


def _save_token(tok):
    os.makedirs(os.path.dirname(TOKEN_PATH), exist_ok=True)
    with open(TOKEN_PATH, "w") as f:
        json.dump(tok, f)
    os.chmod(TOKEN_PATH, 0o600)


def _request(method, path, body=None, auth=True, params=None):
    cid, _ = _client()
    url = f"{API}{path}"
    if params:
        url += "?" + "&".join(f"{k}={urllib.request.quote(str(v))}" for k, v in params.items())
    headers = {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": cid,
    }
    if auth:
        tok = _load_token()
        if not tok:
            sys.exit("Not authenticated. Run: trakt_client.py auth")
        headers["Authorization"] = f"Bearer {tok['access_token']}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        sys.exit(f"Trakt API error {e.code}: {e.read().decode()}")


def auth():
    cid, secret = _client()
    body = json.dumps({"client_id": cid}).encode()
    req = urllib.request.Request(f"{API}/oauth/device/code", data=body,
                                  headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        d = json.loads(resp.read())

    print(f"Go to {d['verification_url']} and enter code: {d['user_code']}")
    deadline = time.time() + d["expires_in"]
    while time.time() < deadline:
        time.sleep(d["interval"])
        body = json.dumps({
            "code": d["device_code"], "client_id": cid, "client_secret": secret,
        }).encode()
        req = urllib.request.Request(f"{API}/oauth/device/token", data=body,
                                      headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req) as resp:
                tok = json.loads(resp.read())
                _save_token(tok)
                print("Authenticated.")
                return
        except urllib.error.HTTPError as e:
            if e.code == 400:
                continue  # still pending
            sys.exit(f"Auth failed: {e.code} {e.read().decode()}")
    sys.exit("Device code expired, try again.")


def search(query, type_=None):
    path = f"/search/{type_}" if type_ else "/search/movie,show"
    return _request("GET", path, auth=False, params={"query": query})


def watchlist(action=None, type_=None, trakt_id=None):
    if action in ("add", "remove"):
        body = {f"{type_}s": [{"ids": {"trakt": int(trakt_id)}}]}
        return _request("POST", f"/sync/watchlist{'/remove' if action == 'remove' else ''}", body=body)
    return _request("GET", "/sync/watchlist")


def history(type_=None, limit=20):
    path = f"/sync/history/{type_}" if type_ else "/sync/history"
    return _request("GET", path, params={"limit": limit})


def ratings(type_=None):
    path = f"/sync/ratings/{type_}" if type_ else "/sync/ratings"
    return _request("GET", path)


def mark_watched(type_, trakt_id):
    body = {f"{type_}s": [{"ids": {"trakt": int(trakt_id)}, "watched_at": "now"}]}
    return _request("POST", "/sync/history", body=body)


def _demo():
    """Self-check: exercises request URL/body building without hitting the network."""
    global _request
    calls = []
    orig = _request
    def fake(method, path, body=None, auth=True, params=None):
        calls.append((method, path, body, params))
        return {}
    _request = fake
    try:
        watchlist("add", "movie", "12345")
        assert calls[-1] == ("POST", "/sync/watchlist", {"movies": [{"ids": {"trakt": 12345}}]}, None)
        mark_watched("show", "999")
        assert calls[-1][2] == {"shows": [{"ids": {"trakt": 999}, "watched_at": "now"}]}
        history("movie", 5)
        assert calls[-1] == ("GET", "/sync/history/movie", None, {"limit": 5})
    finally:
        _request = orig
    print("demo ok")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0] == "--demo":
        if args and args[0] == "--demo":
            _demo()
            sys.exit(0)
        sys.exit(__doc__)

    cmd = args[0]
    if cmd == "auth":
        auth()
    elif cmd == "search":
        type_ = None
        rest = args[1:]
        if "--type" in rest:
            i = rest.index("--type")
            type_ = rest[i + 1]
            del rest[i:i + 2]
        print(json.dumps(search(" ".join(rest), type_), indent=2))
    elif cmd == "watchlist":
        if len(args) >= 4 and args[1] in ("add", "remove"):
            print(json.dumps(watchlist(args[1], args[2], args[3]), indent=2))
        else:
            print(json.dumps(watchlist(), indent=2))
    elif cmd == "history":
        type_ = args[args.index("--type") + 1] if "--type" in args else None
        limit = int(args[args.index("--limit") + 1]) if "--limit" in args else 20
        print(json.dumps(history(type_, limit), indent=2))
    elif cmd == "ratings":
        type_ = args[args.index("--type") + 1] if "--type" in args else None
        print(json.dumps(ratings(type_), indent=2))
    elif cmd == "watched":
        print(json.dumps(mark_watched(args[1], args[2]), indent=2))
    else:
        sys.exit(__doc__)
