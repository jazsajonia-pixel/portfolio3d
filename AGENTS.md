# AI agent instructions

This is `portfolio3d`, a separate experiment for an interactive 3D portfolio. Keep the design distinct from the main Portfolio repository.

## Working rules

- Inspect the current source and docs before changing behavior.
- Keep the experience usable on a phone: drag/swipe controls, readable overlays, and 48px touch targets.
- Use React Three Fiber/Drei for 3D interaction and keep the scene lightweight enough for a mid-range phone.
- Motion must explain navigation or selection. Respect `prefers-reduced-motion` for HTML transitions and avoid fake controls.
- Keep project claims tied to the curated data in the source. Distinguish personal work from university/team work.
- Do not add secrets, tokens, or private records.
- Run `npm run lint` and `npm run build` after meaningful changes.
- Work on a branch and open a pull request; do not merge without Jazz's approval.
