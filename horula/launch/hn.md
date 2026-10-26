Show HN: Horula, the iPhone Clock app as one static web page

URL: https://horula.jaybulb.com/?ref=hn

Text:
I wanted the iPhone Clock app on my Mac and on a Windows laptop, so I rebuilt it as a web page: world clocks, alarms, a bedtime schedule, a stopwatch and timers, plus a nightstand mode.

It is plain HTML, CSS and JavaScript with no build step and no dependencies. State lives in localStorage, a service worker makes it work offline, and sound is drawn with the Web Audio API, so there are no audio files. One requestAnimationFrame loop drives everything: the second hand redraws every frame so it glides, everything else redraws once a second, and a plain setInterval keeps alarms firing when the tab is in the background.

Two parts were fun. The world map has no coastline data: it is the roughly 450 cities from the IANA zone table drawn as dots, with night shaded by the real terminator from the NOAA solar position formulas. And the clock embeds in any page as an iframe, so a host page needs no script.

A web page cannot wake a sleeping phone, so there is also a native SwiftUI app for iPhone and Mac. On iPhone it uses AlarmKit, so alarms ring with the app closed. It reads the same backup file as the web version.

Twelve languages, Arabic right to left. Source: https://github.com/nulljosh/labs/tree/main/horula
