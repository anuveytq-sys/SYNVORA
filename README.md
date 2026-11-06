# SYNVORA — Universal Accessibility Intelligence Platform

SYNVORA brings together ECHO, CIVICLENS, FORMGENIUS and TERRAIN AI under a shared CORE. This repository currently ships the Stage 1 ECHO static web app.

## Stage 1 — ECHO

- Camera capture and image upload, with permission handling and camera cleanup.
- In-browser COCO-SSD object detection with confidence percentages.
- Scene summaries based on detected labels, with uncertainty statements.
- OCR in English and Hindi using Tesseract.js language data.
- English/Hindi speech synthesis and speech recognition where supported by the browser.
- Image questions grounded in detected labels and OCR, with clear unsupported-question responses.
- Accessibility profiles: standard, low vision, screen reader, motor and hearing.
- High contrast, scalable text, larger motor targets, keyboard focus emphasis, reduced motion, semantic labels, skip navigation and live status announcements.
- Local preference persistence; image processing remains in the browser and is not sent to a SYNVORA server.
- Responsive mobile and desktop layout.

## Important model limitations

The shipped COCO-SSD model is a general object detector. It is **not** trained or validated to reliably detect stairs, ramps, doors, drop-offs, pavement hazards or route clearance. It cannot determine whether a path is safe. Image questions are grounded only in object labels and OCR; this is not a general visual-language model. Do not use ECHO as a mobility or emergency navigation system. A specialist accessibility perception model with validated weights and evaluation data is still required before hazard-recognition claims can be marked complete.

## Browser and network requirements

- Camera access requires HTTPS (GitHub Pages provides HTTPS) or localhost, plus user permission.
- TensorFlow.js, COCO-SSD and Tesseract.js load from public CDNs.
- Hindi OCR downloads the English and Hindi trained-data files on first use and may take longer.
- Speech recognition and Hindi voices vary by browser and device.
- First model load requires internet. Offline model bundles are not included yet.

## GitHub Pages deployment

The repository includes .github/workflows/deploy-pages.yml. On each push to main, it validates the static app, uploads the repository root as a Pages artifact and deploys it using the official Pages actions. Every run has a unique concurrency group and cancel-in-progress is false, so newer commits do not cancel earlier deployments.

If Pages has never been enabled, GitHub may require the repository owner to set Settings → Pages → Build and deployment → Source: GitHub Actions once. After that, the workflow deploys automatically. The live address appears in the successful workflow's github-pages environment and Actions run summary.

## Run locally

Run python -m http.server 8000 and open http://localhost:8000. Do not open the HTML file directly if you need camera access.

## Test

Run npm test. The test checks JavaScript syntax and verifies that required Stage 1 controls and browser integrations are present.

## Roadmap

1. **ECHO — Perception:** camera/image understanding, OCR, voice interaction and accessibility settings.
2. **CIVICLENS — Civic accessibility:** map and report public accessibility barriers and accessible infrastructure.
3. **FORMGENIUS — Documents and services:** explain forms, extract fields and guide users through service workflows.
4. **TERRAIN AI — Environment awareness:** terrain context, hazard awareness and accessible route intelligence.
5. **CORE — Unified ecosystem:** connect the modules through a coordinated, privacy-conscious platform.

## License

MIT. See LICENSE.