# SYNVORA — Universal Accessibility Intelligence Platform

SYNVORA brings together ECHO, CIVICLENS, FORMGENIUS, and TERRAIN AI under a shared CORE. This repository begins with Stage 1: ECHO perception.

## Stage 1 — ECHO: Perception

- Camera input and image upload.
- In-browser object detection using COCO-SSD, with confidence scores.
- Scene summaries grounded in detected labels.
- OCR text extraction using Tesseract.js.
- English/Hindi speech synthesis and browser speech recognition where supported.
- Image questions answered from current detections and OCR context, with explicit uncertainty.
- Accessibility profiles: standard, low vision, screen reader, motor, and hearing.
- High contrast, scalable text, keyboard focus emphasis, reduced motion, and semantic controls.

### Important capability limits

This is an early assistive perception tool, not a certified navigation system. COCO-SSD does not reliably identify stairs, ramps, doors, drop-offs, path clearance, or all obstacles. Never treat it as proof that a route is safe. Scene explanations and image answers are limited to model detections and OCR; they are not a general visual-language model. Camera and uploaded image processing runs in the browser. External model libraries load from public CDNs.

## Run locally

No build step is required. Serve this folder with any static web server, for example:

```bash
python -m http.server 8000
```

Open http://localhost:8000. Camera access generally requires HTTPS or localhost. Allow camera permission when prompted. A modern browser is required; speech recognition support varies by browser.

## Validation

Run `npm test` to check JavaScript syntax. GitHub Actions validates syntax and required files on pushes and pull requests. Each workflow run has a unique concurrency group with `cancel-in-progress: false`, so newer commits do not cancel older validation runs. Successful runs upload a commit-specific source artifact.

## Five-stage roadmap

1. **ECHO — Perception:** camera/image understanding, OCR, voice interaction, and personal accessibility settings.
2. **CIVICLENS — Civic accessibility:** map and report public accessibility barriers and accessible infrastructure.
3. **FORMGENIUS — Documents and services:** explain forms, extract fields, and guide users through service workflows.
4. **TERRAIN AI — Environment awareness:** terrain context, hazard awareness, and accessible route intelligence.
5. **CORE — Unified ecosystem:** connect the modules through a coordinated, privacy-conscious multi-agent platform.

## Privacy and safety

The app does not upload camera frames or selected images to a SYNVORA backend. Browser APIs and third-party CDN libraries are used. Do not rely on ECHO for emergency decisions or independent navigation.

## License

MIT — see LICENSE.
