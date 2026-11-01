---
name: summarize-books
description: Turn Joshua's phone photos of a book in iCloud Books into chapter summaries for Kernel. Use for "/summarize-books <Book>", "import the book", "summarize the book", or any book folder under iCloud Documents/Misc/Books.
---

# Import a book

Books live in `~/Library/Mobile Documents/com~apple~CloudDocs/Documents/Misc/Books/<Book>/`. Usually there is one subfolder per chapter (sometimes nested by part, e.g. `Part 1/3/`). Sometimes the photos sit flat in the book folder. Each folder holds phone photos (HEIC/JPEG) and sometimes an image-only `chapter.pdf` (no text layer).

## Output is always a summary

Every book gets a summary in Claude's own words, owned or borrowed. No word-for-word transcription, and no rebuilding text a photo cut off. A summary is useful for any book and safe to keep anywhere.

## Find the work

From the Books folder, count photos per folder and skip anything that already has `summary.md` (or a merged `<book-slug>-summary.md` covering those pages):

```sh
find . -type f \( -iname '*.heic' -o -iname '*.jpg' -o -iname '*.jpeg' \) | sed 's|/[^/]*$||' | sort | uniq -c
```

Use `find -iname`, never shell globs like `*.heic *.HEIC`: in zsh an unmatched glob aborts the whole loop.

## Per chapter (or per flat batch)

1. **OCR in the background.** One shell, `run_in_background: true`, wait for the notification (no sleep polling):
   ```sh
   find "<folder>" -maxdepth 1 -type f \( -iname '*.heic' -o -iname '*.jpg' -o -iname '*.jpeg' \) | sort | while read -r f; do b=$(basename "$f"); sh ~/.claude/skills/summarize-books/ocr.sh "$f" "<scratch>/${b%.*}.txt"; done
   ```
   `ocr.sh` picks the right rotation.
2. **Read every page.** Read the OCR text in filename order. A page whose OCR is word salad gets its photo viewed directly with Read when it matters to the chapter; otherwise infer from the pages around it. If the HEIC is too big, convert it with `sips -Z 1400 -s format jpeg -s formatOptions 60` (700px is too small for spreads). Track which photos were actually viewed or cleanly OCR'd.
3. **Write `summary.md`** in that folder: `# <Chapter title>`, then 3 to 6 key ideas as short headed sections, then a "Takeaways" list. Use your own words and plain English: no em dashes, no long quotes. Figures become one bracketed line, e.g. `[Figure 4.2: request flow through the cache]`. If a page is cut off or blurry, fill the gap with your best read of the idea from context and keep going. Never stop to ask for a reshoot. Summaries only, so this is the gist, never rebuilt wording.

## After the last chapter

- Merge every `summary.md` in reading order into `<Book>/<book-slug>-summary.md` (the file name the Kernel import expects).
- Add or refresh the book's section in the Books `CLAUDE.md`: a chapter table, what is photographed, and what is still missing.
- Into Kernel: from `~/Documents/Code/kernel`, run `python3 scripts/import-summaries.py --service <book-slug>`. Run `sync-summaries.sh` only if Joshua wants the book public on the site.

## Deleting raw photos

Delete a folder's HEIC/JPEG photos as soon as its summary is saved. Keep `chapter.pdf`. A cut-off or partly read page is not a reason to keep photos. (Joshua, 2026-10-12: "Delete once we're done!"; 2026-10-30: "you should have deleted the images once done and guessed on whatever was cut off. I'm not gonna spend forever taking pictures of books.")

## Report

Headless only. If a folder is empty or not downloaded from iCloud, note it and move on. Report in one line: chapters done, chapters missing, photos deleted.
