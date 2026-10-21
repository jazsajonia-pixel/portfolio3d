# Portfolio3D

An interactive 3D portfolio for Jazz Sajonia, with a scroll-driven miniature studio room. The room-scene refresh in PR #4 moves toward the supplied reference: cream walls, warm wood, small desk details, plants, shelves, and a warm orange gradient backdrop.

## Current status

| Area | Status |
| --- | --- |
| Scroll-driven 3D room and procedural set | Implemented; warm miniature-room refresh in PR #4 pending CI/preview verification |
| Intro, skills, projects, and contact checkpoints | Implemented |
| Project carousel, case-study links, and GitHub/live links | Implemented |
| GIF previews and project data | Reused from the main Portfolio repo |
| Vercel production build | Previous main build is READY; PR #4 CI/preview is pending |
| Real phone performance testing | Not tested |
| Production deployment | Existing main deployment remains READY; this room refresh is not merged or in production |

## Stack

Next.js 14 App Router, React 18, JavaScript/JSX, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, and Drei.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The project is configured for static export and uses no server-side secrets.

## Design direction

This is intentionally separate from the main Portfolio site. The room is being refined as a warm, open-front miniature studio inspired by the supplied reference, with cream plaster walls, timber framing, plank flooring, a desk and monitor, wall art, shelves, books, and plants. The existing HTML overlays, page layout, and global CSS are deliberately untouched in PR #4; this pass is limited to the 3D room scene. The WebGL pixel-ratio ceiling remains capped at 1.25 to help mid-range devices.
