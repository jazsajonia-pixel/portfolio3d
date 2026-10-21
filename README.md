# Portfolio3D

An interactive 3D portfolio for Jazz Sajonia, reworked as a dark neon studio with cyan/violet lighting, scroll-driven camera movement, a skills workbench, project monitor, and contact shelf.

## Current status

| Area | Status |
| --- | --- |
| Scroll-driven 3D room and procedural set | Implemented |
| Intro, skills, projects, and contact checkpoints | Implemented |
| Project carousel, case-study links, and GitHub/live links | Implemented |
| GIF previews and project data | Reused from the main Portfolio repo |
| Build/lint verification | Awaiting current PR checks |
| Real phone performance testing | Not tested |
| Vercel preview | Triggered for `feat/reference-neon-studio`; status pending |

## Stack

Next.js 14 App Router, React 18, JavaScript/JSX, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, and Drei.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The project is configured for static export and uses no server-side secrets.

## Design direction

This is intentionally not a copy of the main Portfolio site. The visual direction is a deep-ink neon studio with cyan and violet accent lighting, dark glass-like project cards, high-contrast overlay text, and a camera path that follows scroll instead of relying on a free-orbit poster gallery. The WebGL pixel-ratio ceiling is capped at 1.25 to help mid-range devices.
