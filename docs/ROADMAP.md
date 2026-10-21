# Portfolio3D roadmap

## Current experiment

Build a scroll-driven room-style interactive portfolio inspired by the reference showcase at `https://shahbaj-sheikh.vercel.app/`. The current experience uses procedural geometry rather than a downloaded model so the project remains small, editable, and easier to test on a phone. Scroll progress moves the camera through four story checkpoints: intro cube, skills workbench, project monitor, and contact shelf.

## Next increments

1. Validate camera feel and frame rate on Jazz's phone.
2. Add authored low-poly GLTF props only if they improve the room without hurting load time.
3. Add a focused project preview image inside the monitor card while keeping the complete archive accessible.
4. Merge the CI branch/feature PRs only after checks are green, then deploy the scroll version to Vercel.
