#!/usr/bin/env python3
import sys, time, argparse, csv
from concurrent.futures import ThreadPoolExecutor
import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0"}

class LetterboxdError(Exception):
    pass

def get_watchlist(username):
    films = []
    page = 1
    while True:
        url = f"https://letterboxd.com/{username}/watchlist/page/{page}/"
        try:
            r = requests.get(url, headers=HEADERS, timeout=10)
        except requests.RequestException as e:
            raise LetterboxdError(f"network error fetching {url}: {e}")
        if r.status_code == 404:
            raise LetterboxdError(f"user '{username}' not found (404)")
        if r.status_code != 200:
            raise LetterboxdError(f"unexpected status {r.status_code} fetching {url}")
        soup = parse_watchlist_page(r.text)
        if not soup:
            break
        films.extend(soup)
        page += 1
        time.sleep(1)
    return films

def parse_watchlist_page(html):
    soup = BeautifulSoup(html, "html.parser")
    posters = soup.select("div.react-component[data-item-slug]")
    return [
        {"slug": p["data-item-slug"], "title": p.get("data-item-full-display-name", p["data-item-slug"])}
        for p in posters
    ]

def get_rating(slug):
    url = f"https://letterboxd.com/film/{slug}/"
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        r.raise_for_status()
    except requests.RequestException:
        return None
    return parse_rating(r.text)

def parse_rating(html):
    soup = BeautifulSoup(html, "html.parser")
    tag = soup.find("meta", attrs={"name": "twitter:data2"})
    if tag and "out of 5" in tag.get("content", ""):
        try:
            return float(tag["content"].split(" out of")[0])
        except ValueError:
            return None
    return None

def justwatch_providers(title, region):
    try:
        r = requests.get(
            "https://apis.justwatch.com/content/titles/en_US/popular",
            params={"body": f'{{"query":"{title}"}}'},
            headers=HEADERS,
        )
        # Fallback: simple search endpoint
        r = requests.post(
            f"https://apis.justwatch.com/content/titles/{region}/popular",
            json={"query": title},
            headers=HEADERS,
        )
        data = r.json()
        items = data.get("items", [])
        if not items:
            return []
        offers = items[0].get("offers", [])
        return sorted({o.get("provider_id") for o in offers if o.get("monetization_type") == "flatrate"})
    except Exception:
        return []

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("username")
    ap.add_argument("--region", default="US")
    ap.add_argument("--csv", help="optional path to write CSV output")
    ap.add_argument("--streaming", action="store_true", help="also look up streaming providers (slow, one request per title)")
    args = ap.parse_args()

    try:
        films = get_watchlist(args.username)
    except LetterboxdError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    if not films:
        print("No films found (empty watchlist or profile is private).", file=sys.stderr)
        sys.exit(0)

    print(f"Found {len(films)} films in watchlist. Fetching ratings...", file=sys.stderr)

    with ThreadPoolExecutor(max_workers=10) as pool:
        ratings = pool.map(lambda f: get_rating(f["slug"]), films)
    for f, rating in zip(films, ratings):
        f["rating"] = rating

    films.sort(key=lambda f: (f["rating"] is None, -(f["rating"] or 0)))

    if args.streaming:
        print("Looking up streaming providers...", file=sys.stderr)
        for f in films:
            f["providers"] = justwatch_providers(f["title"], args.region)
            time.sleep(0.5)
    else:
        for f in films:
            f["providers"] = []

    rows = [
        (
            f["title"],
            f["rating"] if f["rating"] is not None else "?",
            ", ".join(map(str, f["providers"])) or ("none found" if args.streaming else "(use --streaming)"),
        )
        for f in films
    ]

    for title, rating, providers in rows:
        print(f"{rating:>4}  {title:<40}  {providers}")

    if args.csv:
        with open(args.csv, "w", newline="") as fh:
            w = csv.writer(fh)
            w.writerow(["title", "rating", "providers"])
            w.writerows(rows)
        print(f"Wrote {args.csv}", file=sys.stderr)

if __name__ == "__main__":
    main()
