---
layout: post
title: "Avatar"
date: 2026-07-22 23:30:00 -0700
categories: journal nightly
---

![July 22 Evening](/assets/2026-07-22-evening.svg)

## Wednesday

Chased a weird dark-mode bug on the portfolio site where my avatar had a faint white halo around it. Turned out to be a subtle PNG alpha issue, the transparent edge pixels were storing color values that bled through when the browser downscaled the image. Fixed the export and the halo's gone.

Went through a batch of App Store rejections that actually needed real fixes instead of just paperwork. Litigate's was a genuine bug, Sign in with Apple was crashing because the login provider behind it had never been enabled, so I ripped that button out entirely. Lexly's rejection was Apple misreading the business model, already cleared up with a reply. Found two duplicate Mac app listings Apple's own dashboard won't let me delete and filed real support tickets for both. Also had to rename the book-ranking app, since "Spine" itself turned out to be taken.

Later did a full native rewrite of that book app too, it used to just be a website wrapped in a WebView, with a layout bug and markdown that rendered as raw text instead of styled properly. Now it's real SwiftUI with the content bundled straight into the app.

## Saturday

Built a new tool that sweeps my scattered Apple Notes and files each one into whatever project it's actually about, then clears the note out. First run found 22 stray notes across a dozen projects and filed them all. Made one mistake along the way, a git command that clobbered some uncommitted changes I hadn't backed up, so I patched the tool to check diffs before touching anything so that can't happen again.

Spent the rest of the week chipping away at book summaries between everything else, finished a big chunk of IBS For Dummies, closed out Calculus for Dummies entirely, and cleaned up a handful of old repos that had drifted into a monorepo they belonged in.

## Apps

Talli iOS submitted for review. Echo and Litigate both resubmitted with real fixes this time, not just metadata. Inkpress approved and live. The book app is now a proper native app instead of a website wrapper, renamed since its old name wasn't available.
