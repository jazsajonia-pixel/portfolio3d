# Portfolio3D status

Updated 2026-10-21 (second pass: Portfolio content, PC tower, interactions, intro order) for PR #6 (`feat/box-opening-room-tour`), following `docs/BOX-OPENING-ROOM-TOUR-PROMPT.md`.

| Area | Status |
| --- | --- |
| Welcome animation and scroll prompt | Implemented: the greeting is in the static HTML (`src/components/WelcomeIntro.jsx`) and plays first; the closed box pops in about 1.35 s after the 3D scene starts (or immediately once the visitor scrolls). Hidden after the first ~3.5% of scroll. |
| Box turn and opening | Implemented: box grows and turns until the open corner faces the viewer; lid swings back on its rear hinge; both front panels fold outward and fade. |
| Room tour | Implemented: overview (with an interaction tip) → display/shelf wall → computer wall → central notes table → closing overview with contact card. |
| Contextual cards | Implemented: About (bio, stats, grouped tools), Projects (8 personal builds), How I build (process + areas of practice), Contact (email, phone, location, contact page, GitHub, LinkedIn). Content comes from the main Portfolio repo (`0190c80`). Shown only during their camera hold; one card at a time. |
| PC tower | Implemented beside the desk: cream case, smoked glass side, two spinning side fans, RGB in the room palette (Wave / Sunset / Off). |
| Room interactions | Hover label + pointer cursor; click the name sign (About), monitor (next project / go to projects), notebook (How I build), PC (cycle RGB), desk lamp (on/off), record (play/pause), floor plant (wiggle). Wall clock shows the visitor's local time. Gentle mouse parallax on fine-pointer devices. PC lighting and lamp also have accessible buttons in the Projects card. |
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

## Known limitations

- Real-phone scroll feel, touch, and frame rate are not tested.
- Screenshots come from software WebGL; colours and shadows on a real GPU may differ slightly.
- The monitor shows a drawn project screen (title, type, stack, accent), not the project GIF, to keep phone memory low.
- The archive routes still contain the copied `no-img-element` lint warnings.
- Fonts for 3D text are bundled locally (`public/fonts/`, Space Grotesk, SIL Open Font License 1.1).
