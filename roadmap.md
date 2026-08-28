# journal roadmap

## WebMCP + REST API rollout -- assessed and closed 2026-08-27

Not doing this here. Jekyll blog. The only interactivity is a dark-mode toggle. An agent reads a post by reading the page.

A tool on a page like this would be `get_page_content`, which spends an
agent's context restating text it can already read. That is noise, not
coverage, and it makes the honest tools in the other repos harder to find.

Shipped instead in: epiphany, healstack, roost, curvely, wiretext, litigate,
cadence, sparkjar, lexly, talli, quotable, wordroot, newsline, nyc, notes,
bookrank, homeward.

## Portfolio sync 2026-08-27
- [ ] `scripts/sync-portfolio.sh` dies in `splice()` on
      `mv ../nulljosh.github.io/index.html.tmp ... : No such file or directory`,
      so `deploy.sh`'s last step is failing while the Pages deploy itself
      succeeds. The repo and the file and the `journal-sync:start` marker all
      exist, and the portfolio's last commit is not a sync commit, so the
      Writing list may have been drifting. Worth checking whether the `.tmp`
      write is being blocked because it lands outside the journal repo rather
      than the script being wrong: run `./scripts/deploy.sh` by hand and see if
      it reproduces.
