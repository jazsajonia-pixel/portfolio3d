# Portfolio3D

An interactive 3D portfolio for Jazz Sajonia that starts as a closed miniature box. Scrolling turns the box to a corner, opens the lid and front panels, and tours the room inside: a display/shelf wall, a computer workstation, and a central notes table.

## Current status (last verified 2026-10-31)
| Area | Status |
| --- | --- |
| Box-opening room tour and six-step navigation | Implemented on `main`; headless Chromium checks are documented in `docs/STATUS.md` |
| Contextual cards, project controls and responsive layout | Implemented; headless checks include 1440 × 900, 1280 × 720, 768 × 1024 and 390 × 844 |
| Portfolio content | Refreshed from the current resume; the room monitor cycles 12 projects |
| Lint / production build | Passed locally in the 2026-10-31 verification (`npm run lint`, `npm run build`; existing `no-img-element` warnings) |
| GitHub Actions | The latest CI runs for `main` (`bb2260d`, run #41178160277) failed to start because of the account billing/spending-limit block; see the [run](https://github.com/jazsajonia-pixel/portfolio3d/actions/runs/41178160277) |
| Production deployment | The 2026-10-31 handoff reports the `bb2260d` deployment live at [jaz-space.vercel.app](https://jaz-space.vercel.app) |
| Real phone scroll feel and frame rate | Not tested on a physical phone |

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
