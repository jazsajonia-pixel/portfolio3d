# Portfolio3D — Box-Opening Room Tour Development Prompt

## Goal

Build a polished, interactive 3D portfolio that behaves like a physical miniature room inside a box. It must follow the supplied reference video/site closely in composition, camera movement, material warmth, and interaction—not look like a conventional website with a 3D background.

The experience begins with a closed box, opens as the user scrolls, then guides the visitor through the room. Information appears only when the camera is facing the relevant part of the room.

## Core interaction

### 1. Welcome state

- On first load, display a welcoming animation.
- Show a short prompt telling the visitor to scroll.
- The miniature box should be closed at this stage.
- Keep the welcome overlay temporary; it must fade out once the user begins scrolling.

### 2. Box opening

- As the user scrolls, rotate the closed box until one corner faces the audience.
- Animate the top lid and both front panels outward.
- The opening should feel physical and smooth, not like a CSS page transition.
- Preserve the room inside the box while the panels open.

### 3. Room tour

- After the box opens, continue scrolling to reveal the entire room.
- Move the camera slowly through the room.
- Visit, in order:
  1. A display/shelf wall.
  2. The computer/workstation wall.
  3. The central table with notes.
- Each camera stop should have one clear focal subject.
- Avoid empty walls, excessive floor space, or objects that are not relevant to the current stop.

### 4. Contextual information

- After the welcome phase, do not show persistent scrolling website text.
- Show a contextual information container only while the camera is facing the relevant part of the room.
- Containers should fade or scale into place; they must not behave like normal scrolling page sections.
- Each container should describe only what the camera is currently showcasing.
- Keep containers readable, compact, and non-blocking.

### 5. Computer interaction

- When the camera faces the computer, show left and right project-navigation controls.
- The selected project must appear on the computer monitor inside the 3D room.
- The HTML project card and the 3D monitor must stay synchronized.
- Controls must be real buttons, keyboard accessible, and have at least 48 px touch targets.

## Visual direction

- Warm miniature diorama: cream plaster, warm timber, soft orange ambient light.
- The box must clearly read as a contained physical object: visible floor thickness, walls, corner posts, top rails, and an open front after the opening sequence.
- The room should contain a coherent workstation: desk, monitor, keyboard, mouse, speakers, lamp, plant, books, shelves, chair/stool, and notes.
- Use restrained detail. Objects must have believable scale, contact with surfaces, and clear visual hierarchy.
- Avoid flat plastic-looking materials, random clutter, and large empty areas.
- Text that belongs to the room should be 3D/world-space text: wall signs, monitor text, desk plaques, and shelf labels.
- HTML is appropriate only for temporary onboarding, contextual information cards, navigation, accessible controls, and links.

## Technical requirements

- Use the existing Next.js App Router, React Three Fiber, Drei, Framer Motion, and Tailwind setup.
- Keep the implementation lightweight enough for a mid-range Android phone.
- Keep the WebGL pixel-ratio ceiling conservative, such as `dpr={[1, 1.25]}`.
- Use scroll progress as the source of truth for the box-opening and camera-tour state machine.
- Respect `prefers-reduced-motion`: reduce or remove nonessential animation while preserving navigation and content access.
- Do not add secrets, tokens, private records, or unnecessary dependencies.
- Preserve existing project data, routes, project links, and accessibility behavior.

## Responsive requirements

Test and document the experience at:

- 1440 × 900
- 1280 × 720
- 768 × 1024
- 390 × 844

At each size, verify:

- The box and room remain appropriately framed.
- Important objects and labels are visible.
- Contextual containers do not cover the focal subject.
- There is no accidental horizontal overflow.
- Scrolling advances the intended box/camera states.
- Project controls remain usable.
- Text remains readable.
- The canvas maintains correct proportions.

Also perform a real-phone check for scroll feel, touch targets, rendering smoothness, and usability. Do not claim device readiness without an actual device test.

## Verification gates

Before merge:

1. Run `npm ci`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Confirm GitHub Actions passes.
5. Confirm the Vercel preview deployment succeeds.
6. Inspect the actual rendered WebGL experience where browser access is available.
7. Capture or inspect the four required viewport sizes.
8. Perform a real-phone review where possible.

A successful build does not prove visual correctness. Do not claim rendering, animation, camera composition, or mobile behavior works without evidence.

## Git and deployment rules

- Work on a feature branch.
- Open a pull request before merging.
- Do not merge without Jazz’s explicit approval.
- Do not force-push or discard existing work without a verified reason.
- After an approved merge to `main`, verify that Vercel starts and completes the production deployment.
- Do not claim production is updated unless the deployment and production target are verified.

## Acceptance criteria

- [ ] Welcome animation and scroll prompt appear on load.
- [ ] The closed box rotates until a corner faces the viewer.
- [ ] The top lid and both front panels open outward.
- [ ] The room is revealed and reads as a contained miniature diorama.
- [ ] The camera tours the display wall, computer wall, and central notes table.
- [ ] Contextual containers appear only when their area is in view.
- [ ] Persistent scrolling text is removed after the welcome phase.
- [ ] The computer screen shows the selected project.
- [ ] Left/right controls change the selected project.
- [ ] HTML controls remain accessible and usable.
- [ ] The room has coherent proportions, materials, lighting, and shadows.
- [ ] Lint and production build pass.
- [ ] Required viewport sizes are tested and documented.
- [ ] Real-phone behavior is tested where possible.
- [ ] PR status, CI results, deployment status, and remaining limitations are recorded accurately.
