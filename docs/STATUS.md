# Portfolio3D status

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
