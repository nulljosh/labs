---
name: summarize-books
description: Turn Joshua's phone photos of a book in iCloud Books into text for Kernel. Books he owns are transcribed word for word; library books are summarized. Use for "/summarize-books <Book>", "import the book", "summarize the book", or any book folder under iCloud Documents/Misc/Books.
---

# Import a book

Books live in `~/Library/Mobile Documents/com~apple~CloudDocs/Documents/Misc/Books/<Book>/`, one subfolder per chapter (sometimes nested by part, e.g. `Part 1/3/`). Each chapter folder holds phone photos (HEIC/JPEG) and sometimes an image-only `chapter.pdf` (no text layer).

## Owned or borrowed? (decides everything)

Joshua owns most of his books (2026-10-28: "most of the books I own already"). **Owned is the default: transcribe the text word for word.** Summarize instead only when the book is a library loan: he says so, the folder holds a file named `library`, or the Books `CLAUDE.md` calls it a library book. When unsure, ask in one line.

Why: Canada's private-copying exception (Copyright Act s. 29.22) lets you copy a book you legally own for your own private use. It does not cover borrowed or rented copies, and it ends the moment the copy is shared. A summary in your own words is fine for any book. So a raw-text book stays private: never make a share link for it, never ship it in the app bundle or the repo's public `summaries/`.

## Owned: transcribe

1. List the chapter folders in reading order. Skip any that already have `text.md` unless asked to redo.
2. One chapter at a time: OCR each photo in filename order with `sh ~/.claude/skills/summarize-books/ocr.sh <photo> <scratch>/<n>.txt` (it picks the right rotation). Then Read each page photo next to its OCR text and fix what OCR got wrong: running heads, page numbers and hyphenated line breaks out, paragraphs joined, headings as `#`/`##`, lists and tables kept. Any page the OCR mangled, transcribe from the image directly.
3. Write `text.md` in that chapter folder: `# <Chapter title>` then the chapter's text exactly as printed. No summarizing, no rewording, no skipped pages. Figures and photos become one line in brackets, e.g. `[Figure 4.2: request flow through the cache]`.
4. After the last chapter: merge every `text.md` in order into `<Book>/<book-slug>-summary.md` (the file name the Kernel import expects), and add the book to the Books `CLAUDE.md` marked **owned, full text**.

## Borrowed: summarize

Same walk, but write `summary.md`: title, 3 to 6 key ideas as short headed sections, a "Takeaways" list, all in your own words, plain English, no em dashes, no long verbatim quotes. Merge into `<book-slug>-summary.md` and mark it **library, summary** in the Books `CLAUDE.md`.

## Both

- Delete a chapter's raw photos (HEIC/JPEG) only after its `text.md` or `summary.md` is saved AND every photo in it was actually read (no unread pages). Keep `chapter.pdf`. A chapter with unread photos keeps them. (Joshua, 2026-10-12: "Delete once we're done!")
- Into Kernel: from `~/Documents/Code/bookrank`, `python3 scripts/import-summaries.py --service <book-slug>` puts it on his account only. For an owned full-text book do NOT run `sync-summaries.sh` (that copies into the public repo and the app bundle).
- If a folder is empty or not downloaded from iCloud, note it and move on. Headless only. Report in one line: chapters done, chapters missing.
