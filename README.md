# Portfolio3D

An interactive room-style portfolio experiment for Jazz Sajonia. It takes the spatial idea from Three.js portfolio showcases and turns the project archive into a small navigable studio: drag the room, tap a poster, and inspect the selected project.

## Current status

| Area | Status |
| --- | --- |
| 3D studio room and procedural set | Implemented |
| Clickable project posters and camera easing | Implemented |
| Project archive modal and links | Implemented |
| GIF previews and project data | Reused from the main Portfolio repo |
| Build/lint verification | Pending |
| Real phone performance testing | Not tested |
| Production deployment | Not configured |

## Stack

Next.js 14 App Router, React 18, JavaScript/JSX, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, and Drei.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The project is configured for static export and uses no server-side secrets.

## Design direction

This is intentionally not a copy of the main Portfolio site. The visual direction is a dark blue neon studio with warm amber UI accents, procedural room geometry, floating project posters, smooth camera easing, and a glass project card that stays readable over the scene.
