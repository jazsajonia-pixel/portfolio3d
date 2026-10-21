# Portfolio3D Independent QA Report

## A. Executive Summary

The PR preview is accessible through a temporary Vercel share link and the room renders successfully in the Sandbox browser. The scroll-driven scene, fixed canvas, page overlays, project controls, and basic WebGL output are functional at the tested desktop viewport.

The preview does achieve the requested warm miniature direction at a high level: cream walls, timber trim, wood floor, window, shelves, desk, monitor, plants, and an orange gradient are present. It does not yet match the supplied reference closely enough for approval. The largest gaps are visual fidelity and composition: the preview is a flat, low-detail procedural room with weak shadows and simplified props, while the reference uses close, asset-rich views with strong wood grain, furniture, desk objects, layered wall details, and a clearer focal subject. Several page overlays also lose contrast against the light room at the tested scroll positions.

**Final verdict: NEEDS SIGNIFICANT VISUAL IMPROVEMENT.** No P0 rendering failure was found. The preview should remain unmerged until the room composition, material depth, lighting, and overlay readability are refined and the required responsive/device checks are completed.

## B. Environment and Access

- **Reference URL:** https://shahbaj-sheikh.vercel.app/
- **Preview URL:** https://portfolio3d-git-feat-cozy-reference-room-chrono8.vercel.app/
- **PR:** https://github.com/jazsajonia-pixel/portfolio3d/pull/4
- **Branch:** `feat/cozy-reference-room`
- **Tested commit:** `978862b9f6094261087f6d325f8e1d93b9a23043`
- **Latest PR commit:** `978862b9f6094261087f6d325f8e1d93b9a23043`
- **Are they the same:** Yes. The Vercel PR comment identifies the preview as the deployment for the branch, and the GitHub PR head is the same commit.
- **Access status:** The canonical preview and production alias initially redirected to Vercel login because Deployment Protection/SSO is enabled. A temporary Vercel share URL was created for this QA session; it expired on 2026-10-22 03:17 UTC. The project deployment settings were not changed.
- **Browser environment:** Sandbox browser at 1280 × 1100 CSS pixels, device pixel ratio 1. This is not a physical device.
- **Repository inspection:** Read-only clone checked out at the tested commit. No project files were modified, committed, pushed, merged, or deployed.
- **Limitations:** Exact 1440 × 900, 1280 × 720, 768 × 1024, and 390 × 844 viewport runs were not available in this browser route. Real-phone touch, GPU performance, and device FPS were not tested. WebGL used SwiftShader software rendering in the Sandbox, so the measured runtime does not represent a normal hardware GPU.

## C. Test Results

| Test | Result | Severity | Evidence |
|------|--------|----------|----------|
| Preview access | PASS with limitation | P1 | Canonical preview required Vercel login; temporary share URL loaded the deployment. |
| Commit identity | PASS | P0 | Preview branch and PR head both identify `978862b`. |
| Initial page load | PASS | P0 | Page title `Jazz Sajonia \| Portfolio3D`; HTML overlays and canvas appeared. |
| 3D room renders | PASS | P0 | Canvas rendered the room, floor, walls, furniture, monitor, shelves, window, and gradient. Screenshot: `/home/ubuntu/screenshots/portfolio3d-git-feat_2026-10-21_04-17-29_4984.webp`. |
| Scroll-driven camera | PASS | P1 | Camera changed across intro, skills, projects, and contact checkpoints using native page scrolling. |
| Project carousel | PASS | P1 | Next-project control changed the HTML card from Retext `01 / 05` to Chrono `02 / 05` after React state settled; source uses the same `activeProject` for the monitor. |
| Missing product assets | PASS | P1 | No missing room texture/model request was observed; the room is procedural geometry. |
| Horizontal overflow | PASS | P1 | At 1280 × 1100, `document.documentElement.scrollWidth` did not exceed `innerWidth`. |
| Console/runtime errors | NOT TESTED fully | P2 | Browser console history was not available as a complete capture. The inspected runtime remained usable. |
| Navigation/resource failures | FAIL for non-product Vercel Live assets | P3 | Two `vercel.live` feedback resources had zero transfer; these are deployment feedback tooling, not room assets. |
| Initial timing | MEASURED | P2 | `DOMContentLoaded`: ~1.25 s; `load`: ~7.52 s in this browser session. These are not device benchmarks and include the hosted page environment. |
| WebGL availability | PASS with limitation | P2 | WebGL available; renderer reported `ANGLE ... SwiftShader Device`, which is software rendering. |
| 1440 × 900 desktop | NOT TESTED | P2 | Browser route did not provide an independent viewport-size control. |
| 1280 × 720 laptop | NOT TESTED | P2 | Browser route did not provide an independent viewport-size control. |
| 768 × 1024 tablet | NOT TESTED | P2 | Browser route did not provide an independent viewport-size control. |
| 390 × 844 mobile | NOT TESTED | P1 | Browser route did not provide an independent viewport-size control; no real phone test was performed. |
| Reduced motion | PARTIAL PASS by source inspection | P2 | `CameraPath` checks `prefers-reduced-motion`; global CSS disables most transitions/animations. Runtime preference switching was not exercised. |
| WebGL fallback | NOT TESTED / likely gap | P2 | A loading element exists, but no explicit Canvas error boundary or non-WebGL fallback was found in the inspected component. |
| Touch/drag room controls | NOT TESTED / source gap | P2 | The scene uses page scroll for navigation and the canvas has `pointer-events: none`; no drag/swipe camera control was found in `ScrollRoomPortfolio.jsx`. |

## D. Reference Comparison

The reference was opened and inspected at its initial, skills, and project scroll positions. It shows a warm orange/cream environment with close camera framing, authored or highly detailed furniture and props, strong wood surfaces, layered wall decoration, and a clear focal object at each checkpoint. At the project checkpoint, the desk, monitor, keyboard, PC, headphones, speakers, books, plant, chair, and wall shelf form a dense but coherent studio composition.

| Area | Reference | Current Preview | Difference | Priority |
|---|---|---|---|---|
| Overall composition | Close, object-led camera views; the desk or workstation fills the frame at project content. | Wide open-front room; much of the floor and blank wall is visible, and the focal objects occupy less of the frame. | Preview reads as a room shell rather than a sequence of deliberate close-up diorama shots. | P1 |
| Architecture | Warm wood floor and wall surfaces with layered trim and decorative structure. | Cream box room with timber strips and procedural plank floor. | Direction is correct, but the architecture is simpler and flatter. | P2 |
| Furniture and props | Desk setup contains many readable authored objects and small scale cues. | Desk, monitor, shelf, books, plants, stool, and wall art exist, but most are primitive pastel shapes. | The preview has the inventory of objects but not the reference's visual specificity or density. | P1 |
| Materials | Visible wood grain, varied roughness, soft contact shadows, and nuanced color variation. | Mostly solid-color `meshStandardMaterial` surfaces with high roughness; no visible authored textures and no configured shadow-casting lights. | Preview looks more like a clean low-poly blockout than a finished miniature room. | P1 |
| Lighting | Warm, soft lighting with strong depth and object separation. | Warm hemisphere/directional/point lights are present, but the scene appears washed out in places and has weak grounding shadows. | Light direction is plausible; depth and separation need more work. | P2 |
| Visual hierarchy | The current interactive subject is obvious in each view. | White HTML headings and pale 3D labels compete with or disappear against the cream wall; the project card and 3D monitor compete at the project checkpoint. | Readability and focal hierarchy are inconsistent. | P1 |
| Background | Orange gradient supports the warm room without overwhelming the detailed subject. | Orange gradient is present and consistent, but the large visible ceiling/floor areas make it feel more like a backdrop around a simple set. | Background direction is correct; composition needs tighter framing. | P2 |
| Controls | Reference uses visible directional arrows around the interactive project area. | Preview has accessible HTML previous/next buttons and scroll navigation, but no scene drag/swipe behavior was found. | Basic control exists, but mobile interaction parity is incomplete. | P2 |

### Three most important similarities

1. Both sites use an orange/cream visual environment and a scroll-driven 3D presentation.
2. Both establish a workstation/portfolio subject with a monitor, desk-related objects, and project content.
3. Both use a miniature or staged studio metaphor with shelves, books/props, plants, and directional project navigation.

### Five most noticeable differences

1. The reference uses detailed, textured, asset-rich furniture; the preview uses simple procedural primitives with mostly flat colors.
2. The reference frames a close workstation subject; the preview often shows a broad room shell with substantial empty wall and floor.
3. The reference has strong contact shadows, occlusion, and depth cues; the preview has weak grounding and flatter lighting.
4. The reference's project subject is visually dominant; the preview's HTML copy, 3D monitor, and project card compete for attention.
5. The reference supports a tactile studio feel through many intentionally placed small props; the preview includes the right categories of props but at a much lower level of specificity.

The first three differences are essential for the room approval. Additional prop variety is optional until composition, materials, and lighting are corrected.

## E. Defects and Findings

### F-001 — Preview is visually much flatter and less faithful than the reference

- **Severity:** P1
- **Category:** Visual fidelity / materials / props
- **Observation:** The room renders, but the visible set is dominated by solid-color boxes, cylinders, rounded boxes, and low-detail plant shapes. The reference's workstation has textured wood, a detailed chair, desk accessories, computer hardware, books, wall panels, and layered small objects.
- **Expected result:** A warm miniature studio that preserves the reference's object richness and tactile depth without expanding into an unrelated site redesign.
- **Actual result:** A correct high-level inventory of room elements, but a blockout-like procedural appearance.
- **Evidence:** Preview screenshots at `/home/ubuntu/screenshots/portfolio3d-git-feat_2026-10-21_04-17-29_4984.webp` and `/home/ubuntu/screenshots/portfolio3d-git-feat_2026-10-21_04-19-06_2912.webp`; reference screenshots at `/home/ubuntu/screenshots/shahbaj-sheikh_verce_2026-10-21_04-23-06_2419.webp` and `/home/ubuntu/screenshots/shahbaj-sheikh_verce_2026-10-21_04-23-49_6103.webp`.
- **Likely root cause:** The current implementation intentionally uses procedural geometry and solid `meshStandardMaterial` colors in `src/components/ScrollRoomPortfolio.jsx`; no authored room textures or GLTF assets are used.
- **Recommended fix:** Improve only the highest-impact room elements first: desk/workstation silhouette, monitor and peripherals, chair/stool, shelf props, and wall treatment. Use a small number of coherent authored or more detailed procedural assets rather than adding many random objects.
- **Relevant file:** `src/components/ScrollRoomPortfolio.jsx`, especially `RoomShell`, `DeskAndSkills`, `Monitor`, and `ContactShelf`.
- **Verification steps:** At the same scroll checkpoints, confirm the desk/workstation is the focal subject; confirm props have distinct silhouettes, contact with surfaces, and readable scale; compare screenshots with the reference without changing overlays/layout.

### F-002 — Camera framing leaves too much empty room and weakens the focal hierarchy

- **Severity:** P1
- **Category:** Composition / camera
- **Observation:** At the skills checkpoint, the room is shown as a wide wall-and-floor view. At the project checkpoint, the monitor and desk are visible, but the large HTML heading and card compete with the 3D monitor. The reference moves into close views where the current subject fills most of the frame.
- **Expected result:** Each checkpoint should have one clear focal object and a camera distance/angle that supports it.
- **Actual result:** The preview communicates the room but not a strong sequence of close-up portfolio scenes.
- **Evidence:** Preview skills screenshot `/home/ubuntu/screenshots/portfolio3d-git-feat_2026-10-21_04-19-06_2912.webp`; preview project/contact transition screenshot `/home/ubuntu/screenshots/portfolio3d-git-feat_2026-10-21_04-19-30_5597.webp`; source camera targets at `CameraPath` in `src/components/ScrollRoomPortfolio.jsx`.
- **Likely root cause:** The four camera targets use relatively distant positions and broad look-at points; the scene and HTML section progress are not tuned as a single focal-composition system.
- **Recommended fix:** Tune camera positions and look-at targets before adding more props. Bring the skills view toward the workbench and the project view toward the monitor/desk, while keeping the open-front room readable. Check the handoff between the project and contact ranges so the room camera and HTML section do not feel out of phase.
- **Relevant file:** `src/components/ScrollRoomPortfolio.jsx`, `CameraPath` targets and `sceneIndex` mapping.
- **Verification steps:** Capture intro, skills, projects, and contact screenshots at equal scroll fractions. In each, name the first visual focal point; it should be the intended room object, not an empty wall, floor, or competing overlay.

### F-003 — Scene lighting and materials do not provide enough depth

- **Severity:** P1
- **Category:** Lighting / materials
- **Observation:** The preview is warm, but the wall, floor, shelves, desk, and props are visually close in value and have little visible contact shadowing. The reference has clearer grounding, wood variation, and object separation.
- **Expected result:** Soft warm light with enough ambient occlusion/contact shadow to anchor furniture and props, plus restrained material variation.
- **Actual result:** The room is readable but looks washed out and flatter than the reference in the screenshots.
- **Evidence:** Preview screenshots; source uses hemisphere, directional, and point lights in `RoomShell`, but the `Canvas` and lights do not configure visible shadow maps or a contact-shadow/AO helper.
- **Likely root cause:** Solid-color high-roughness materials and lighting without an explicit low-cost shadow/occlusion treatment.
- **Recommended fix:** Add restrained contact shadows or an appropriate lightweight AO approach, enable shadows only for the most important lights/objects if performance allows, and introduce two or three controlled wood/plaster value variations. Avoid making the room glossy or overly dark.
- **Relevant file:** `src/components/ScrollRoomPortfolio.jsx`, `RoomShell` lights/materials, `RoomScene` Canvas settings.
- **Verification steps:** Confirm the desk, stool, monitor, shelves, and plants visibly contact their surfaces; confirm the room remains bright and warm; compare mobile performance separately before enabling expensive shadows globally.

### F-004 — HTML overlays and 3D labels lose contrast against the light room

- **Severity:** P1
- **Category:** Readability / visual hierarchy
- **Observation:** At the skills checkpoint, the large white heading and pale 3D labels sit over a cream wall and are difficult to read. At the project/contact transition, white copy crosses light wall and orange/cream surfaces. The project card is readable, but it competes with the monitor and other text.
- **Expected result:** Existing portfolio copy remains clearly readable while the room stays warm and light.
- **Actual result:** Some text is visible only because of size or position; smaller labels such as `MAKE · LEARN · BUILD` and `WORKBENCH` are low contrast.
- **Evidence:** Preview screenshots `/home/ubuntu/screenshots/portfolio3d-git-feat_2026-10-21_04-19-06_2912.webp` and `/home/ubuntu/screenshots/portfolio3d-git-feat_2026-10-21_04-19-30_5597.webp`.
- **Likely root cause:** The room color/light values changed substantially while the existing overlay palette was intentionally left unchanged; several 3D text labels use pale colors directly on pale materials.
- **Recommended fix:** Prefer room-only fixes first: tune camera placement so copy sits over darker/less detailed areas, add a restrained local shadow/backplate behind only the 3D labels, and adjust room light balance. If a minimal overlay contrast adjustment is ultimately required, keep it isolated and confirm it is within the approved room-related scope before implementation.
- **Relevant file:** `src/components/ScrollRoomPortfolio.jsx` for 3D labels; `src/app/globals.css` for overlay colors.
- **Verification steps:** Check intro, skills, projects, and contact at the tested desktop size and at a real phone size. Read every heading, paragraph, button label, and in-room label without relying on browser zoom.

### F-005 — No drag/swipe camera interaction was found

- **Severity:** P2
- **Category:** Mobile interaction / controls
- **Observation:** Native vertical page scrolling works and the project carousel buttons work. The scene Canvas has `pointer-events: none`, and the inspected room component contains no pointer, touch, drag, swipe, or orbit-control handler.
- **Expected result:** The project instructions and repo agent rules call for a phone-usable experience with drag/swipe controls where appropriate, or an explicitly documented scroll-only interaction model.
- **Actual result:** The room is navigated by page scroll only; direct scene touch interaction is not available.
- **Evidence:** `src/components/ScrollRoomPortfolio.jsx` and `src/app/globals.css`; `.scroll-room-stage` and `.scroll-room-canvas` use `pointer-events: none`.
- **Likely root cause:** The current iteration retained scroll-driven navigation and did not add a touch-control layer.
- **Recommended fix:** Decide whether scroll-only is intentional for this pass. If touch interaction is required, add a lightweight, accessible swipe/drag mechanism without letting it block the HTML links and buttons. Do not add fake controls that do not change scene state.
- **Relevant file:** `src/components/ScrollRoomPortfolio.jsx`, `src/app/globals.css`.
- **Verification steps:** Test vertical swipe scrolling, horizontal project navigation, keyboard focus, and touch target behavior on a real phone. Confirm the canvas does not intercept links or project buttons.

### F-006 — WebGL fallback is not demonstrated

- **Severity:** P2
- **Category:** Resilience / accessibility
- **Observation:** A loading overlay exists, but the inspected component does not show an explicit Canvas error boundary, WebGL-unavailable message, or static room fallback.
- **Expected result:** Users without usable WebGL should receive a clear fallback rather than an empty or permanently loading experience.
- **Actual result:** Not tested with WebGL disabled; therefore this is a risk, not a confirmed runtime failure.
- **Evidence:** `src/components/ScrollRoomPortfolio.jsx` contains `Canvas` and a loading element but no visible error fallback in the inspected file.
- **Likely root cause:** The current implementation assumes WebGL support.
- **Recommended fix:** Add a small non-WebGL fallback or error boundary only if it can be done without redesigning the page. At minimum, ensure the HTML portfolio content remains usable when the Canvas fails.
- **Relevant file:** `src/components/ScrollRoomPortfolio.jsx` and the page-level composition.
- **Verification steps:** Run with WebGL disabled or use a browser/device without WebGL; confirm the page still exposes headings, project links, and contact links.

### F-007 — Required responsive and real-device evidence is missing

- **Severity:** P1
- **Category:** QA coverage / responsive behavior
- **Observation:** Only the Sandbox browser at 1280 × 1100 was tested. The four requested viewport sizes and a real phone were not tested.
- **Expected result:** Desktop, laptop, tablet, and mobile behavior should be evidenced before approval, especially for a fixed WebGL canvas and scroll-driven camera.
- **Actual result:** CSS includes mobile media queries and 48px controls, but source inspection is not a substitute for rendered viewport testing.
- **Evidence:** `src/app/globals.css` contains `@media (max-width: 700px)` rules; no browser/device screenshots were collected for the requested smaller sizes.
- **Likely root cause:** The current QA environment did not expose viewport emulation for the external preview.
- **Recommended fix:** Run the exact four viewport sizes in a browser/device tool or locally against the same commit, then perform a real-phone pass for scroll, touch, text readability, and WebGL smoothness.
- **Relevant file:** `src/app/globals.css`, `src/components/ScrollRoomPortfolio.jsx`.
- **Verification steps:** Record screenshots and pass/fail notes for 1440 × 900, 1280 × 720, 768 × 1024, and 390 × 844; separately label browser emulation versus physical-device testing.

## F. Responsive Testing

| Viewport | Rendering | Layout | Usability | Result |
|----------|-----------|--------|-----------|--------|
| 1440 × 900 | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| 1280 × 720 | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| 768 × 1024 | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| 390 × 844 | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| Sandbox browser 1280 × 1100 | PASS: canvas and overlays rendered | PASS: no horizontal overflow observed | PARTIAL: scrolling and carousel worked; real touch not tested | PASS with limitations |

Source inspection indicates mobile-specific rules exist at `max-width: 700px`, including reduced header spacing, smaller heading sizes, a 350px project card cap, safe-area padding, and 48px controls. These rules still require rendered verification.

## G. Performance

Collected measurements from the live preview in the Sandbox browser:

- `DOMContentLoaded`: approximately 1.25 seconds.
- `load`: approximately 7.52 seconds.
- Resources observed: 21.
- Two zero-transfer requests: `https://vercel.live/_next-live/feedback/feedback.js` and its feedback HTML endpoint. These appear to be Vercel preview feedback tooling rather than application room assets.
- WebGL was available, but the browser renderer was `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`, indicating software rendering in this environment.
- No FPS, frame-time, GPU-memory, or real-device thermal measurements were collected.

The room uses a pixel-ratio ceiling of 1.25 in the Canvas, which is a sensible baseline for mid-range devices. The scene is procedural and avoids a large model download. The main performance risk is not proven frame rate but the combination of a full-screen fixed Canvas, multiple lights, Drei text geometry, and potentially future shadow/AO additions. Any visual improvement should be rechecked on a real phone before approval.

## H. Recommended Fix Order

### P0/P1 — Fix before approval

1. Retune `CameraPath` composition so each checkpoint has a clear focal subject and the HTML sections do not compete with the room's key object.
2. Improve the workstation/desk scene with a small number of higher-specificity props and more convincing scale/contact relationships.
3. Add material variation and restrained contact shadowing/AO so furniture and props sit in the room instead of reading as floating pastel primitives.
4. Restore readable contrast for headings and in-room labels through room/camera/light adjustments first; only make minimal overlay changes if room-only changes cannot solve it.
5. Complete exact responsive viewport tests and a real-phone pass before merging.

### P2 — Important improvements

6. Decide and document whether direct drag/swipe navigation is required; if yes, add it without blocking page controls.
7. Add and test a lightweight WebGL fallback so HTML portfolio content remains usable without a working Canvas.
8. Recheck the project/contact camera transition so the scene label, 3D monitor, project card, and contact copy align at the same scroll state.

### P3 — Optional polish

9. Replace the remaining placeholder-like shelf and wall-art shapes with a few intentional signature props.
10. Investigate the Vercel Live feedback request failures only if they affect the hosted preview workflow; they are not current product-room defects.

## I. Implementation Handoff

Implement only the 3D-room refinement in `src/components/ScrollRoomPortfolio.jsx`; preserve the existing HTML overlays, route structure, project data, and global layout unless a narrowly scoped contrast fix is proven necessary.

1. Start with the `CameraPath` targets. Produce four screenshots at the intro, skills, projects, and contact scroll checkpoints. The workbench/monitor should be the focal subject at skills/projects, with less empty floor and wall.
2. Refine the room shell and workstation in place. Keep the cream walls, timber trim, wood floor, window, shelves, books, plants, monitor, and warm orange backdrop, but improve silhouette, scale, surface variation, and contact with the floor/desk.
3. Add only lightweight depth cues. Prefer selective contact shadows, controlled ambient occlusion, and a few material variations over many new objects or expensive global effects. Keep the existing `dpr={[1, 1.25]}` ceiling unless measurement proves a change is needed.
4. Check the HTML/3D hierarchy at every checkpoint. Do not allow pale 3D labels or white overlay text to disappear on the cream wall. Use room composition and local contrast treatments before changing the page-wide palette.
5. Preserve the existing project carousel behavior. When the selected project changes, both the HTML card and monitor content must update, and the controls must remain keyboard accessible.
6. Decide explicitly whether scroll-only navigation is acceptable. If direct touch interaction is required, implement a real swipe/drag interaction with no fake controls and no event interception over important links.
7. Add a WebGL fallback or error boundary if practical, keeping the HTML portfolio usable when the Canvas cannot initialize.

**Acceptance criteria:**

- The preview still renders at the PR head and the room remains within the warm miniature scope.
- Each scroll checkpoint has one obvious room focal subject and less empty composition than the current preview.
- Desk, monitor, shelf, plant, stool/chair, wall art, and floor visibly contact their surfaces and do not float or clip.
- The room has visible but restrained depth from shadows/occlusion and does not become too dark, glossy, or noisy.
- Headings, paragraphs, buttons, project card text, and 3D labels are readable at all checkpoints.
- The project carousel updates both HTML and 3D monitor content.
- `npm run lint` and `npm run build` pass on the implementation branch.
- Exact viewport screenshots exist for 1440 × 900, 1280 × 720, 768 × 1024, and 390 × 844.
- A real-phone check records scroll/touch behavior and does not claim FPS or device readiness without measurement.
- No unrelated page redesign, merge, release, or deployment occurs without Jazz's approval.

The implementation still requires visual judgment for camera distance, prop density, shadow strength, and the exact balance between reference fidelity and the existing portfolio's identity.

## J. Final Verdict

**NEEDS SIGNIFICANT VISUAL IMPROVEMENT**

The PR is not blocked by rendering: the preview loads through the temporary access URL, the room renders, native scroll changes the camera, and the project carousel works. It is not ready for approval because the room is materially less detailed and less compositionally focused than the reference, overlay readability is inconsistent on the new light scene, and the required responsive/real-device evidence is missing. Keep the room-only scope, refine composition before adding complexity, then repeat the exact viewport and phone checks.

## References

[1]: https://github.com/jazsajonia-pixel/portfolio3d/pull/4 "Portfolio3D pull request #4"
[2]: https://portfolio3d-git-feat-cozy-reference-room-chrono8.vercel.app/ "Portfolio3D PR preview deployment"
[3]: https://shahbaj-sheikh.vercel.app/ "Shahbaj Sheikh reference website"
[4]: https://github.com/jazsajonia-pixel/portfolio3d/blob/978862b9f6094261087f6d325f8e1d93b9a23043/src/components/ScrollRoomPortfolio.jsx "Portfolio3D room component at tested commit"
