#!/usr/bin/env python3
"""Reading tracker using OpenLibrary API"""

import requests
import json
from pathlib import Path

DATA_FILE = Path.home() / ".reading-tracker.json"

def load_data():
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text())
    return {"reading": [], "finished": []}

def save_data(data):
    DATA_FILE.write_text(json.dumps(data, indent=2))

def search_book(title):
    """Search OpenLibrary for book"""
    r = requests.get(f"https://openlibrary.org/search.json?q={title}&limit=5")
    results = r.json()["docs"]
    for i, book in enumerate(results[:5]):
        print(f"{i+1}. {book.get('title')} by {', '.join(book.get('author_name', ['Unknown']))}")
    return results[:5]

def add_book(title, page=0):
    """Add book to reading list"""
    books = search_book(title)
    choice = int(input("Pick book (1-5): ")) - 1
    book = books[choice]
    
    data = load_data()
    data["reading"].append({
        "title": book["title"],
        "author": book.get("author_name", ["Unknown"])[0],
        "page": page,
        "total_pages": book.get("number_of_pages_median", 0)
    })
    save_data(data)
    print(f"Added: {book['title']}")

def update_page(title, page):
    """Update current page"""
    data = load_data()
    for book in data["reading"]:
        if title.lower() in book["title"].lower():
            book["page"] = page
            save_data(data)
            print(f"{book['title']}: page {page}")
            return
    print("Book not found in reading list")

def status():
    """Show current reading"""
    data = load_data()
    if not data["reading"]:
        print("No books in progress")
        return
    
    for book in data["reading"]:
        total = book.get("total_pages", "?")
        pct = f"{int(book['page']/total*100)}%" if total else ""
        print(f"{book['title']} - Page {book['page']}/{total} {pct}")

if __name__ == "__main__":
    import sys
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    
    if cmd == "add":
        add_book(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 0)
    elif cmd == "update":
        update_page(sys.argv[2], int(sys.argv[3]))
    elif cmd == "status":
        status()
    else:
        print("Usage: reading-tracker.py [add|update|status] <title> [page]")
