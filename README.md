# Portfolio3D

An interactive 3D portfolio for Jazz Sajonia that starts as a closed miniature box. Scrolling turns the box to a corner, opens the lid and front panels, and tours the room inside: a display/shelf wall, a gallery wall, a computer workstation, an AI lab with a helper robot, and a central notes table. A person works at the desk, takes coffee breaks and pets the cat.

## Current status

| Area | Status |
| --- | --- |
| Box-opening room tour (welcome, corner turn, lid/panel opening, three camera stops) | Implemented on PR #6; verified in headless Chromium screenshots |
| Step-based tour: one scroll/swipe/key press = one stop, with a progress bar showing the next stop | Implemented on `fix/step-tour-and-box`; see `docs/STATUS.md` |
| Contextual cards shown only at their camera stop | Implemented; verified at 1440 × 900, 1280 × 720, 768 × 1024, 390 × 844 |
| Project arrows beside the 3D monitor, synced monitor and card | Implemented; tap, click and ← → keys verified in headless Chromium |
| GIF previews and project data | Reused from the main Portfolio repo |
| Lint / production build | Pass locally (only the archive's existing `no-img-element` warnings) |
| Real phone scroll feel and frame rate | Not tested |
| Professional palette, new objects, profile photo, Qline and five other new projects, themed `/projects` page | Implemented on `refine/pro-room-and-projects`; see `docs/STATUS.md` |
| Living room: person at the desk, helper robot with a knowledge-graph hologram, gable roof, Experience and AI lab stops, drag-to-look, generated lo-fi on the record, More info → main portfolio | Implemented on `feat/living-room-robot`; see `docs/STATUS.md` |
| Bedroom layout with posters and a Claude plush, VS Code + live-preview monitor, rigged human and kitten models, Rapier physics toys, Leva debug panel (`?debug`), "Classic portfolio" button | Implemented on `feat/bedroom-vscode-realism`; see `docs/STATUS.md` |
| Production deployment | https://jaz-space.vercel.app (auto-deploys from `main`) |

## Stack

Next.js 14 App Router, React 18, JavaScript/JSX, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, Drei, @react-three/rapier (physics toys, lazy-loaded once the room opens) and Leva (debug panel, only loaded with `?debug`).

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The project is configured for static export and uses no server-side secrets.

## Design direction

A miniature designer studio: textured plaster walls, walnut and oak wood grain, sage fabrics, black steel and brass on a sand backdrop (deep navy at night), with a terracotta accent. Project content lives in `src/data/projects.js` and feeds both the room monitor and `/projects`. Room labels (name sign, shelf labels, PROJECTS plaque, notes) are 3D text; HTML is used only for the welcome, contextual cards, navigation and accessible controls. The WebGL pixel ratio is capped at 1.25. See `docs/BOX-OPENING-ROOM-TOUR-PROMPT.md` for the full brief and `docs/STATUS.md` for verification details.

## Debug and QA

Open `/?debug` for a Leva panel (exposure, pixel ratio, shadows, physics collider wireframes, a menu to force the person into an activity, FPS stats, day/night). `window.__tourDebug` exposes the camera, draw calls and actor states for headless checks.

## Credits

- Furniture, props and PBR textures: [Poly Haven](https://polyhaven.com) (CC0).
- Person model: [Grab3D "Man"](https://grab3d.com/models/characters/man/) (CC0). Kitten: [Grab3D "Kitten"](https://grab3d.com/models/animals/kitten/) (CC0), rigged in code (`src/components/room/catRig.js`).
- Posters: AI-generated for this project.
