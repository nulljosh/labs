# Prompts

All from the planning chat. Fill in anything in [brackets]. Run in order: setup, then posts, then Google, then ads.

## Setup

**Project instructions** (paste into a Claude Project)
You are the marketing assistant for Best Choice Garage Doors (Langley, BC). Write social posts, Google Business Profile posts, review replies, SEO copy, ad copy, and video prompts for them. Always follow the brand brief in project knowledge. Tone: trustworthy, local, practical, family-run. Repair-first, never pushy. Keep captions under 80 words, lead with a hook, end with a CTA and the phone number. Never invent reviews, prices, or promotions. Ask me if a fact is missing.

**Brand brief** (once)
Read https://www.bcgaragedoors.ca and its service pages. Summarize services, customers, selling points, process, and tone as a reusable brand brief.

**Test**
Write 5 Facebook and Instagram posts for next week. Mix: 1 tip, 1 emergency, 1 family story, 1 seasonal (fall), 1 review.

## Social posts

**Sample batch**
Using the brief, write 10 social posts for [platforms]. Mix of: job showcases, tips, testimonials, behind-the-scenes, one promo. Each: hook, caption under 80 words, CTA, 5 local hashtags. Tell me which photo type to pair with each.

**Service-page posts**
Using the brief, write one Facebook and Instagram post for each of these services: [emergency, spring, cable, rollers, track, panel, hinges, keypads and clickers, weather strips, maintenance]. Each: hook, caption under 80 words, CTA with the phone number, 5 local hashtags, and the photo to pair with it.

**5-step carousel**
Turn our 5-step service process into an Instagram carousel: one slide per step, headline under 6 words, one plain sentence each, plus a cover slide and a call-to-action slide. Add a caption under 80 words.

**City posts**
Write 5 short local posts, one each for [Surrey, Burnaby, Maple Ridge, Abbotsford, Richmond]. Mention the city naturally, one common problem, and our same-day and emergency service. No invented reviews or prices.

## Google and website

**Google Business Profile**
Write 4 Google Business Profile posts (300 words max, with a CTA button suggestion) based on our service pages, and a reply template for 5-star, 3-star, and 1-star reviews.

**Website SEO check**
The site already has service-area pages, meta tags and an FAQ. For each page of https://www.bcgaragedoors.ca, flag any title over 60 characters, meta description over 155, or missing image alt text, and suggest fixes. Also confirm LocalBusiness schema exists.

## Instagram ads

**Ad copy**
Using the brand brief, write 5 Instagram ad variations for Best Choice Garage Doors. Each: headline under 40 characters, primary text under 125 characters, CTA button suggestion, and which photo or video to pair it with. Angles: 1 emergency, 1 broken spring, 1 repair-first/no upsell, 1 family story, 1 seasonal (fall). Never invent reviews, prices, or promotions.

**Video script generator**
Write 3 Higgsfield prompts for 5-10s vertical ads for [business]. Each: subject, camera move, lighting, mood, style. Plus a caption and on-screen text for each.

## Higgsfield (image to video, 5s, 9:16)

**Three generations**
Image-to-video from [old family photo]. Slow push-in on a faded 1990s photo of a father and son beside a work van. Gentle warm light, dust in air, documentary feel. 5s, vertical 9:16. Then a second clip from [current team photo], same framing, crisp modern daylight. Cut old to new. On-screen text: "Three generations. Same phone number."

**Spring bang**
Image-to-video from [photo of garage interior]. Static shot, suburban garage, door closed. Sudden metallic snap, door shudders, light flickers. Handheld realism, muted colours. 5s, 9:16. No people. On-screen text: "Heard a BANG? That's your spring." then "Don't lift it. Call us."

**Fixed first**
Image-to-video from [photo of tech at a door]. Close-up of gloved hands tightening a hinge, then pull back as the door glides up smoothly and quietly. Clean natural daylight, satisfying motion. 5s, 9:16. On-screen text: "Most doors don't need replacing." then "They need the right repair."

## Image generation (Gemini is free, check hardware closely)

**Emergency**
Suburban house at night, garage door half open with warm light spilling out, work van parked in the driveway, realistic photo, vertical 4:5, no text, no logos

**Broken spring**
Close-up of a broken garage door torsion spring with a visible gap, garage interior, natural light, realistic photo, vertical 4:5, no text

**Repair first**
Garage door technician in work gloves checking a hinge on a closed garage door, homeowner standing nearby, daylight, realistic photo, vertical 4:5, no faces in close-up, no text

**Weather strip**
Close-up of a cracked rubber weather strip along the bottom of a garage door, daylight, shallow depth of field, realistic photo, vertical 4:5, no text

## Variants from the first chat
The first chat's wording for the core prompts. Same jobs, different shape. Use the SEO writer one to produce tags, the audit one above to check them.

**Brand brief (paste version)**
Here is the website text for Best Choice Garage Doors (bcgaragedoors.ca): [paste pages]. Write a 1-page brand brief: services, service area, ideal customer (homeowner vs commercial), tone of voice, top 5 selling points, and 10 phrases he already uses. Only use facts from the text. Flag anything missing.

**Sample posts (photo version)**
Using this brief and these photos, write 10 social posts for Best Choice Garage Doors. For each: platform (FB/IG), hook, caption under 80 words, 5 hashtags, and which photo it uses. Mix: 3 repair showcases, 2 tips (spring safety, opener maintenance, winter care), 2 trust (family, local, fast response), 2 seasonal, 1 offer. Friendly local tone. Only use facts from the brief.

**Higgsfield, generic photo clip**
Slow push-in on this finished garage door repair, golden hour light, clean and realistic, door and house do not warp or change shape, no text, 5 seconds, vertical 9:16.

**Higgsfield, talking clip (new)**
See `video/README.md`.

**SEO writer**
Here is the text for the [page] page on bcgaragedoors.ca. Write a title tag (under 60 characters), a meta description (under 155), LocalBusiness schema JSON-LD, and alt text for these images. Target keyword: "[service] in [city]".

**Google Business Profile (short)**
Write 4 weekly Google Business Profile posts for a garage door company, plus reply templates for 5-star, 3-star and 1-star reviews.
