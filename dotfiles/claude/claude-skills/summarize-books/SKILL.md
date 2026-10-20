---
name: summarize-books
description: Summarize a library book from Joshua's phone photos in iCloud Books into per-chapter summary.md files. Use for "/summarize-books <Book>", "summarize the book", or any book folder under iCloud Documents/Misc/Books.
---

# Summarize a book

Books live in `~/Library/Mobile Documents/com~apple~CloudDocs/Documents/Misc/Books/<Book>/`, one subfolder per chapter (sometimes nested by part, e.g. `Part 1/3/`). Each chapter folder holds phone photos (HEIC/JPEG) and sometimes an image-only `chapter.pdf` (no text layer, so `pdftotext` gives nothing).

1. List the chapter folders in reading order. Skip any that already have `summary.md` unless asked to redo.
2. One chapter at a time (keeps context small): convert photos with `sips -s format jpeg -Z 1600 IN --out $SCRATCH/book/<chapter>/` and Read each image in page order (sort by filename).
3. Write `summary.md` in that chapter folder: title, 3 to 6 key ideas as short headed sections, a "Takeaways" list, all in your own words, plain English, no em dashes, no long verbatim quotes.
4. After the last chapter: write `<Book>/<book-slug>-summary.md` merging all chapters, and add the book with a chapter/topic table to the Books `CLAUDE.md`.
5. Delete a chapter's raw photos (HEIC/JPEG) only after its summary.md is saved AND every photo in it was actually read (no unread pages). Keep chapter.pdf. Any chapter with unread photos keeps them. (Joshua, 2026-10-12: "Delete once we're done!")

Rules: if a folder is empty or not downloaded from iCloud, note it and move on. Headless only. Report in one line: chapters done, chapters missing.
