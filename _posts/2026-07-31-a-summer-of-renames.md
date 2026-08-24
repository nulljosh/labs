---
layout: post
title: "Renames"
date: 2026-07-31 12:00:00 -0700
categories: journal quarterly
---

{% include headers/2026-07-03-week.svg %}

Epiphany finally shipped to the App Store, which closed out a long stretch of revisions, and then half the portfolio got renamed behind it. Dose became Healstack, Lingo became Lexly, Books became Spine and then Bookrank once Spine turned out to be taken, Brief became Casewright and then Litigate, Grapher became Curvely, and Echo became Voxprint after Apple decided the name was too generic. Every rename dragged a branding and icon pass along with it, and one of them took twelve alternates before anything cleared.

Most of the real work was bugs that had been quietly wrong for a long time. Epiphany's autopilot did nothing in testing because it was rounding share counts down to whole numbers, so any order under about a hundred and fifty dollars silently became an order for zero shares. Its net worth number ignored uninvested cash sitting in investment accounts, so it showed two hundred and twenty nine dollars when the accounts actually held four hundred and fifteen. Inkpress loaded blank entries because the feed parser choked on wrapped text. Talli's messages tab was empty because the parser dropped any message that did not put its date on its own line. None of these announced themselves. They all just looked like the app being a bit off.

I lost most of a week to Apple's provisioning system. Five apps could not upload because their distribution profiles did not exist, and chasing that down led to a single missing piece of configuration that only exists in Apple's web portal with no way to script it. Linking it and regenerating still came back empty twice. Genuinely stuck rather than nearly done, which is worth writing down honestly. Later I found out only four of eleven apps were showing up in TestFlight, because I had added myself as an email-invited tester instead of as a team member.

Then a sweep of fifteen projects turned up ten real bugs, including Echo handing out paid features to everyone, and three shipped apps with no way to delete your account, which Apple requires. The worst find was Litigate serving live court documents to anyone who asked, hidden behind a page overlay that protected nothing. That went behind a real login gate, and an old personal page that had started ranking on Google came down at the same time. Sparkjar was worse in a quieter way: the key that ships inside every client could read the whole users table, password hashes and reset tokens included. Fixing it meant deploying the code before the database change so existing accounts survived the trip. The reason logins had been failing underneath all of it was one mistyped property name.

Twelve repos and thirteen domains moved off the old host in a single sitting, with the four running live payments or real logins left alone until they get proper rewrites. The journal and Inkpress got untangled into separate repos. I made Lexly free, since the paid gate had never worked and Apple asked a direct question about it, so the courses are open and the paid tier is just perks now. Epiphany's payments turned out to have been broken since an old debugging session mangled the live key, so the webhook had been failing silently for months. Fixed that, swapped the monthly subscription for a one dollar unlock, and stopped short of rolling payments out everywhere else because most of these apps have nothing worth gating.

I also killed the colonist autoplay bug in the Times Square game, which took two attempts because I had assumed one system was the whole cause and two others were also handing out jobs on their own. And I killed a daily annoyance: every morning I re-authenticated the App Store session by hand when the session was usually still alive and the password was already in my keychain. Now one command checks first.

Two records requests came back on the 2021 case. No body-worn camera footage ever existed, and the 911 tape was destroyed under the retention policy. Both filed, follow-up queued.

Personally: I fixed the resume, which claimed I was enrolled at university when I am self-taught and applying, so I cut the false line and led with the eight production apps instead of old retail jobs. Reconnected with Jayda for the first time in about ten years, three days together and a couple of drives out to catch the sunset. Good, and mostly a reminder of how much I like my own quiet now.
