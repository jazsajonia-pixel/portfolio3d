# Portfolio3D status

## 2026-11-22: living room, robot and lo-fi (`feat/living-room-robot`)

| Area | Status |
| --- | --- |
| Photo | The framed photo is now a painted version of Jazz's graduation photo (`public/room/profile.jpg`, 640 × 800), so it matches the illustrated room. |
| Desk | Mouse moved to the sitter's right on a longer felt mat; the mug sits on the left with steam. Both are driven by the person at the desk. |
| Person | A procedural figure (hoodie, jeans, sneakers, curly hair) with two-bone IK arms and legs. At the desk he types, uses the mouse, drinks coffee and stretches; the chair rolls back when he stands. He walks to the couch to pet the cat while it naps (hearts appear), and steps to the window with his coffee on the Projects stop so the screen is free. Click him to wave and get a speech bubble. |
| Robot | A hovering assistant flies a loop around the room, visits the desk and projects a small hologram while it helps, and on the new AI lab stop docks and projects a rotating knowledge graph (nodes, links, labels, beam). Click it for a chirp, a spin, and the AI lab stop. |
| Tour | Eight stops: Welcome, The room, About and tools, Experience (gallery wall + timeline), Projects, AI lab, How I build, Contact. |
| Look around | At any stop, drag to orbit a little (±25° sideways, ±12° up/down on mouse; sideways only on touch). The view springs back when the tour moves, a drag never counts as a click, and a one-time hint explains it. |
| House | The lid is now a gable roof (shingles, fascia, barge boards, ridge cap, brick chimney, round attic vents). The front panel has a smaller name sign, a front door with brass knob and step, and a porch lamp. |
| Lo-fi | Clicking the record plays a lo-fi loop generated live in the browser with Web Audio (`src/lib/lofi.js`: electric-piano chords, bass, swung drums, vinyl crackle, tape wobble). A "Now playing" pill has a stop button; M toggles it; it stops when the tab is hidden or the page is left. No audio files are shipped. |
| Extras | Linen curtains on the window, a brass floor lamp and side table by the couch, floating music notes while the record plays. The room size is unchanged (it already fits the new actors and a bigger room would push the desk and wall out of the stop framings). |
| More info | Project buttons and the monitor link to the matching project on the main portfolio (https://jazz-portfolio1.vercel.app/projects#slug). |
| Lint / build | `npm run lint` (only the existing `no-img-element` warnings) and `npm run build` pass. Screenshots: `docs/review/house-closed.png`, `ai-lab.png`, `couch-petting.png`, `living-room-tour.jpg`. Mobile (390 × 844) checked for all eight stops. |
| Not verified | Audio was not listened to (headless browser); actor motion was only observed at about 1.5 fps in software rendering; not tested on a physical phone. |

## 2026-11-22: professional room refresh and new projects (`refine/pro-room-and-projects`)

| Area | Status |
| --- | --- |
| Palette and materials | Saturated orange and pastel toy colours replaced with a studio palette: sand backdrop (`#e9dccb`), warm plaster walls with a subtle canvas texture, walnut and oak wood grain, sage fabric, black steel, brass, terracotta accent (`#c4572e`). Night is deep navy (`#121828`). A soft Lightformer environment adds reflections (dimmed at night); shadow maps are 2048. |
| Objects | Display wall: brass-trimmed name lettering, turntable with tonearm on a slatted walnut credenza, labelled shelves (books with spine titles, mini server with LEDs, phone on a stand showing Qline, graduation cap, controller), wall clock, tall plant. Workstation: walnut desk on a steel frame, slim black monitor on an aluminium stand, aluminium keyboard, studio speaker, charcoal PC with muted RGB, ceramic mug, ergonomic chair with armrests and five-star base, linen "Now shipping" pinboard with project cards. Notes table: oak/walnut top, leather notebook ("BUILD NOTES"), muted sticky notes, charcoal pencil cup, poufs. Black metal wall sconce, sage couch, sage window shutters, "JAZZ SAJONIA" plaque on the closed box. |
| Photo | Jazz's graduation photo (`public/room/profile.jpg`, from `profile.jpg` in Drive) hangs in a walnut frame on the display wall next to the BS IT diploma. |
| Projects | One data file (`src/data/projects.js`) now feeds both the room monitor (14 projects) and the archive (23). New: Qline (featured; public repo and project site), Unified Connector (live site, private repo), TaskFlow (GitHub only; its live demo returned 500 when checked), EdgeFlow, Vyntra, Spatial Workspace. OmniDesk is left out because its API was unhealthy. |
| Monitor | Browser-style dark UI with stack pills, a progress row, and the real Qline icon for Qline. |
| `/projects`, `/about`, `/services`, `/contact` | Shared `SiteShell` (header, back-to-room link, footer) on light sand. Archive has a featured Qline hero, sticky group chips, muted accent panels, and "Private repository · demo on request" for private work. |
| Cards and UI | Rounded cards with a soft shadow (no offset orange shadow, rotated tag or paperclip), pill eyebrows, dark-on-sand welcome text with a small eyebrow, SVG favicon. |
| Lint / build | `npm run lint` (only the existing `no-img-element` warnings) and `npm run build` pass. Screenshots in `docs/review/pro-room-*.jpg` and `pro-projects-page.jpg`. |
| Performance | Headless software rendering runs at about 1.5 fps, so cards appear late in those screenshots; frame rate on real GPUs and phones has not been measured. |
| Real phone review | Not tested on a physical phone. |

## 2026-10-31: content refresh from Jazz's current resume (`feat/resume-automation-refresh`)

| Area | Status |
| --- | --- |
| Positioning | Title, greeting, About card and page metadata now say "Full-stack developer & AI automation specialist" and describe Jazz as a BS IT graduate (SEAIT, 2022–2026) instead of "started 2024, learning by building". |
| Projects (room monitor) | 12 projects. Added AI Lead Intake & Support Triage Automation (from the resume, no repo or demo), AI Job Hunting Agent (Make.com, tested with synthetic data), Cortex and Sapphire. FlowPilot, Chrauto AI, Chrono and MarketHub text now matches the resume. Retext's GitHub link was dropped because that repository is private. Long titles shrink to fit the monitor. |
| Project archive `/projects` | Grouped into AI automation, AI agents, web apps, Android apps and games, and university projects; adds Chron Launcher and Heartline (private repos, marked "Private repository · demo on request"). Projects without a GIF show a "How it works" step flow. Shared with the main Portfolio repo. |
| About / Services / Contact | Resume skill groups (including AI & Automation and Admin & Operations), work experience (Encoder at HPG Apopong; Farm Accounting Staff at Abdeo Farm; HR Office Intern at SEAIT), education, automation-first services, and GitHub and LinkedIn links on the contact page. |
| Lint / build | `npm run lint` (only the existing `no-img-element` warnings) and `npm run build` pass. Headless screenshots checked for the About and Projects tour stops and the `/projects` and `/about` pages. |
| Real phone review | Not tested on a physical phone. |

## 2026-10-23: step-based tour and redesigned closed box (`fix/step-tour-and-box`)

Tester feedback: scrolling did not reliably stop on the info cards, transitions were not smooth, it was unclear when the next card would appear, and scrolling a bit too far skipped past a card (both directions). The first (closed) box looked plain.

| Area | Status |
| --- | --- |
| Navigation model | The page no longer free-scrolls through a 1000svh timeline. The tour has six stops (Welcome, The room, About and tools, Projects, How I build, Contact). One wheel gesture, swipe, or ↓/↑ / PageDown/PageUp / Space key moves exactly one stop; Home/End jump to the first/last stop. Implemented in `ScrollRoomPortfolio.jsx` (`STEPS`, `progressAt`, `goToStep`). |
| Overshoot protection | Trackpad momentum after a step is ignored until the gesture pauses (or a clearly stronger new push starts), and every stop holds for 650 ms after arrival even if the wheel keeps turning. A long card scrolls first; the tour only moves on once the card is at its edge and the gesture has paused. Verified with simulated trackpad flicks (90 decaying wheel events per flick → one stop each, forward and back) and with touch swipes at 390 × 844. |
| Transitions | Time-based travel between stops (2.6 s for the box opening, 1.5 s per room stop, faster per stop for multi-stop dot jumps). Camera easing comes from the keyframe segments, so motion starts and ends softly; the previous extra scroll-smoothing layer was removed. Cards leave as soon as travel starts and appear only after arrival. |
| "What's next" indicator | New bottom progress bar: stop counter (`03 / 06`), "Scroll for Projects" / "Swipe up for Projects" (touch), a six-segment track that fills during travel, and explicit previous / next buttons (44 px). Step dots in the top bar now show their label on hover/focus and include "The room". |
| Closed box | Timber frame and plank seams on the front and side panels, a JAZZ · PORTFOLIO · OPEN ME plaque with a brass latch, the missing front-right corner post, a glowing porthole on the side, a ribbon and bow on the lid with a darker overhanging rim, and an outside window with shutters and a flower box on the left wall. Everything on the opening panels folds and fades with them. The box also starts larger (0.36 scale on landscape, 0.52 on portrait). |
| Layout | Cards sit between the top bar and the progress bar on landscape; on portrait they sit above the progress bar (max 38svh) and the camera framing reserves a little more space for them. |
| Reduced motion | Travel is instant; no bouncing hints or segment fill animation. |
| Lint / build | `npm run lint` (only the existing `no-img-element` warnings) and `npm run build` pass. |
| Real phone review | **Not tested on a physical phone.** Headless software rendering was used for the screenshots in `docs/review/step-tour-*.jpg`. |

Updated 2026-10-21 (second pass: Portfolio content, PC tower, interactions, intro order) for PR #6 (`feat/box-opening-room-tour`), following `docs/BOX-OPENING-ROOM-TOUR-PROMPT.md`.

| Area | Status |
| --- | --- |
| Welcome animation and scroll prompt | Implemented: the greeting is in the static HTML (`src/components/WelcomeIntro.jsx`) and plays first; the closed box pops in about 1.35 s after the 3D scene starts (or immediately once the visitor scrolls). Hidden after the first ~3.5% of scroll. |
| Box turn and opening | Implemented: box grows and turns until the open corner faces the viewer; lid swings back on its rear hinge; both front panels fold outward and fade. |
| Room tour | Implemented: overview (with an interaction tip) → display/shelf wall → computer wall → central notes table → closing overview with contact card. |
| Contextual cards | Implemented: About (bio, stats, grouped tools), Projects (8 personal builds), How I build (process + areas of practice), Contact (email, phone, location, contact page, GitHub, LinkedIn). Content comes from the main Portfolio repo (`0190c80`). Shown only during their camera hold; one card at a time. |
| Desk PC | Front-facing case on the desk where the desk lamp was; two spinning front fans and RGB in the room palette (Wave / Sunset / Off). The floor tower and desk lamp were removed. |
| Day / night | Sun in the top-left of the overview (placed per viewport by un-projecting the overview camera). Clicking it turns the sky wheel half a turn: the sun sets, the moon rises into the same spot, stars fade in, and the lighting, window glass, window beam, page background and cards switch to night. Clicking the moon, or the moon/sun button in the top bar, switches back. The choice is saved in `localStorage` (`box-tour-theme`). |
| Window light | Additive light beam from the window to the floor, a window-shaped floor patch, drifting dust, and a shadowless spot light. In day mode it's warm; at night it's faint moonlight. |
| Wall lamp | Pink bell shade with a globe bulb on the back wall. Clicking it (or the bulb button in the top bar) switches the room light: interior fill, bounce light and the lamp's own glow. |
| Firefly | Night only: one firefly flies a looping path with a fading trail (drei `Trail` anchored at the scene root). Click it to make it dart around. No trail with reduced motion. |
| Couch and cat | A small couch facing the notes table. The cat walks two loops around the room, hops onto the couch, curls up and sleeps (floating "z"s), then stretches and walks again. Clicking it while it walks makes it sit and say "meow ♥"; clicking it while it sleeps wakes it ("mrrp? ♥"). Its eyes glow at night with the light off. With reduced motion it just sleeps. |
| Transitions | The camera reaches each stop before its card appears and leaves after the card has gone. Cards only fade and drift a few pixels, with no scaling. Changing cards no longer re-renders the whole 3D room. |
| Room interactions | Hover label + pointer cursor; click the sun/moon (day/night), wall lamp (room light), cat (pet), firefly, name sign (About), monitor (next project / go to projects), notebook (How I build), PC (cycle RGB), record (play/pause), floor plant (wiggle). Wall clock shows the visitor's local time. Gentle mouse parallax on fine-pointer devices. PC lighting and lamp also have accessible buttons in the Projects card. |
| Computer interaction | Implemented: real HTML arrow buttons anchored beside the 3D monitor (48–52 px), ← → keys, or clicking the screen; the monitor (canvas texture) and card stay in sync. |
| Reduced motion | Implemented: camera and box snap to the scroll state, no idle bob or text stagger. |
| Framing | Camera distance is computed from viewport aspect and the free screen area next to the card; the image is shifted with a view offset so the subject is not covered. |
| Lint / build | `npm ci`, `npm run lint`, `npm run build` pass locally (only the archive's existing `no-img-element` warnings). |
| GitHub Actions / Vercel preview | See PR #6 checks. |
| Real phone review | **Not tested.** |
| Production | Unchanged until PR #6 is approved and merged. |

## Verification evidence (headless Chromium, software WebGL)

Captured from the static export (`npm run build` → `out/`) with Playwright and SwiftShader, using reduced motion so each screenshot shows the exact scroll state. Contact sheets are in `docs/review/`.

| Viewport | Box framed | Stops framed | Cards clear of subject | Horizontal overflow | Controls usable |
| --- | --- | --- | --- | --- | --- |
| 1440 × 900 | Yes | Yes | Yes (card left/right) | None | Yes |
| 1280 × 720 | Yes | Yes | Yes | None | Yes |
| 768 × 1024 | Yes | Yes | Yes (card at bottom) | None | Yes |
| 390 × 844 | Yes | Yes | Yes (card at bottom) | None | Yes; tap Next → Chrono, → → Petalbound, ← ×3 wraps to MarketHub |

Other measurements: ~180–260 draw calls and ~32–43k triangles per frame (Three.js renderer info). Software rendering on the 2-CPU test machine ran at ~3–4 fps, so frame rate and scroll feel say nothing about real devices.

Second-pass checks (headless): greeting visible before the box at 0.7 s and 1.6 s, box present by 3 s; hovering the PC shows its label and pointer cursor; two clicks cycle RGB Wave → Sunset → Off; clicking the monitor advances Retext → Petalbound; the lamp button switches the lamp off; fan pixels change between frames; 390 × 844 project cycling wraps through all 8 projects; no horizontal overflow at 1440 × 900 or 390 × 844. Desktop is the design priority; mobile is kept responsive.

Third-pass checks (headless Chromium, software WebGL):
- Clicking the sun at about 12% / 13% of the screen switched the page to `data-theme="night"`. The room-light button switched to `data-room-light="off"`.
- The cat went walk → hopUp → curl → sleep. Clicking it showed "mrrp? ♥" and it went on to stretch → hopDown.
- Scrolling from the overview into About with the mouse wheel, the camera moved 0.015 between samples when the card became visible, and 0 afterwards.
- No horizontal overflow at 390 × 844. On portrait screens, the project arrows move into the card.
- The overview has about 370 draw calls and about 61k triangles, up from about 200 because of the new objects and lights. This hasn't been tested on a real GPU or phone.

## Known limitations

- Real-phone scroll feel, touch, and frame rate are not tested.
- Screenshots come from software WebGL; colours and shadows on a real GPU may differ slightly.
- The monitor shows a drawn project screen (title, type, stack, accent), not the project GIF, to keep phone memory low.
- The archive routes still contain the copied `no-img-element` lint warnings.
- Fonts for 3D text are bundled locally (`public/fonts/`, Space Grotesk, SIL Open Font License 1.1).
