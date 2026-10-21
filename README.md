# Portfolio3D

An interactive 3D portfolio for Jazz Sajonia that starts as a closed miniature box. Scrolling turns the box to a corner, opens the lid and front panels, and tours the room inside: a display/shelf wall, a computer workstation, and a central notes table.

## Current status

| Area | Status |
| --- | --- |
| Box-opening room tour (welcome, corner turn, lid/panel opening, three camera stops) | Implemented on PR #6; verified in headless Chromium screenshots |
| Contextual cards shown only at their camera stop | Implemented; verified at 1440 × 900, 1280 × 720, 768 × 1024, 390 × 844 |
| Project arrows beside the 3D monitor, synced monitor and card | Implemented; tap, click and ← → keys verified in headless Chromium |
| GIF previews and project data | Reused from the main Portfolio repo |
| Lint / production build | Pass locally (only the archive's existing `no-img-element` warnings) |
| Real phone scroll feel and frame rate | Not tested |
| Production deployment | Unchanged until PR #6 is approved and merged |

## Stack

Next.js 14 App Router, React 18, JavaScript/JSX, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, and Drei.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The project is configured for static export and uses no server-side secrets.

## Design direction

A warm miniature diorama: cream plaster walls, timber trim and plank floor on a thick base, soft orange backdrop, closely following the supplied reference recording. Room labels (name sign, shelf labels, PROJECTS plaque, notes) are 3D text; HTML is used only for the welcome, contextual cards, navigation and accessible controls. The WebGL pixel ratio is capped at 1.25. See `docs/BOX-OPENING-ROOM-TOUR-PROMPT.md` for the full brief and `docs/STATUS.md` for verification details.
