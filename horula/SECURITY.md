# Security

## Reporting

Found something? Email **trommatic@icloud.com**. Don't open a public issue for anything exploitable.

You'll hear back within a week. This is a solo side project. No bounty, no SLA, just a reply.

## Supported versions

The deployed site and the tip of `main`. Nothing else.

## What keeps you safe

Horula has no account, no server and no analytics. Alarms, timers, cities and sleep settings live in your browser's `localStorage` and never leave the device. Nothing is sent anywhere.

Location is asked for once, only to work out sunrise and sunset, and the math runs on the device. Notifications are asked for only when you set an alarm. Every string drawn from stored data is escaped before it reaches the page.

The only network traffic is loading the page itself from Cloudflare. After that the service worker serves it from cache.
