---
layout: post
title: "Renames"
date: 2026-07-31 12:00:00 -0700
description: "July: Epiphany reached the App Store, half my apps got new names, and I fixed bugs and leaks nobody had noticed."
categories: journal quarterly
---

{% include headers/2026-07-03-week.svg %}

{% include graphs/2026-07-31-a-summer-of-renames.svg %}

## July

Epiphany finally reached the App Store. After that I renamed half my apps. Dose is now Healstack, Lingo is Lexly, Books is Bookrank, Brief is Litigate, Grapher is Curvely, and Echo is Voxprint, because Apple said Echo was too generic. Each rename meant new icons and branding, and one name took twelve tries before it was accepted.

## Quiet bugs

Most of my real work was fixing things that had been wrong for a long time without anyone noticing. Epiphany's auto-trader never traded because it rounded small orders down to zero shares. Its net worth number left out cash sitting in investment accounts and showed $229 instead of $415. Talli's messages tab was empty because of how it read dates, and Inkpress loaded blank entries.

## Security

I checked fifteen projects and found ten real bugs. Voxprint gave paid features to everyone, and three apps had no way to delete your account, which Apple requires. Litigate was showing live court documents to anyone who asked, so I put it behind a real login. Sparkjar let any visitor read other users' passwords and reset keys, so I locked that down.

## Money and moving

I made Lexly free, because the paywall never worked. Epiphany's payments had been silently broken for months, so I fixed them and swapped the monthly plan for a $1 unlock. I also moved twelve projects and thirteen web addresses off my old host in one sitting.

## Stuck and personal

I lost most of a week to Apple's signing system. Five apps could not upload and I could not fix it, so I am writing that down honestly. Two records requests on the 2021 case came back: the body camera footage never existed and the 911 recording was destroyed on schedule. I also fixed my resume, which wrongly said I was in university. I am self-taught, so now it leads with my eight apps. I saw Jayda for the first time in about ten years, and we spent three days together.
