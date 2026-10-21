# Portfolio3D

An interactive room-style portfolio experiment for Jazz Sajonia. It takes the spatial idea from Three.js portfolio showcases and turns the project archive into a scroll-driven studio: the camera travels from an intro cube to a skills workbench, a project monitor, and a contact shelf.

## Current status

| Area | Status |
| --- | --- |
| Scroll-driven 3D room and procedural set | Implemented |
| Intro, skills, projects, and contact checkpoints | Implemented |
| Project carousel, case-study links, and GitHub/live links | Implemented |
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

This is intentionally not a copy of the main Portfolio site. The visual direction is a warm low-poly workspace with orange/yellow room lighting, a blue skills workbench, a monitor-centered project card, and a shelf of contact objects. The camera follows the scroll position instead of relying on a free-orbit poster gallery.
