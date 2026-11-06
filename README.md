# SYNVORA — Universal Accessibility Intelligence Platform

SYNVORA brings together ECHO, CIVICLENS and FORMGENIUS under a shared accessibility workspace. The platform includes ECHO, CIVICLENS, FORMGENIUS, an image-only TERRAIN AI visual-analysis lab, and a separate optional live object-detection camera.

## Stage 1 — ECHO

- Camera capture and image upload, with permission handling and camera cleanup.
- In-browser COCO-SSD object detection with confidence percentages.
- Scene summaries based on detected labels, with uncertainty statements.
- Lightweight on-demand common-object detection; it is not an accessibility-feature classifier.
- OCR in English and Hindi using Tesseract.js language data.
- English/Hindi speech synthesis and speech recognition where supported by the browser.
- Image questions grounded in detected labels and OCR, with clear unsupported-question responses.
- Accessibility profiles: standard, low vision, screen reader, motor and hearing.
- High contrast, scalable text, larger motor targets, keyboard focus emphasis, reduced motion, semantic labels, skip navigation and live status announcements.
- Local preference persistence; image processing remains in the browser and is not sent to a SYNVORA server.
- Responsive mobile and desktop layout.

## Important model limitations

The shipped COCO-SSD model is a general object detector. It may miss or mislabel objects, including confusing floor textures or furniture. Confidence scores are not calibrated safety probabilities. It cannot determine whether a path is safe, whether a ramp is usable, or whether an obstacle blocks a route. A negative result never proves that a hazard is absent. Do not use ECHO as a mobility or emergency navigation system. Image questions are grounded only in object labels and OCR; this is not a general visual-language model.

## Browser and network requirements

- Camera access requires HTTPS (GitHub Pages provides HTTPS) or localhost, plus user permission.
- TensorFlow.js, COCO-SSD, Tesseract.js and the optional Transformers.js runtime/model load from public CDNs/model hosting.
- Hindi OCR downloads the English and Hindi trained-data files on first use and may take longer.
- Speech recognition and Hindi voices vary by browser and device.
- First model load requires internet. The optional OWL-ViT model is large and may be slow or unavailable on lower-memory phones. Offline model bundles are not included yet.

## Stage 2 — CIVICLENS

- Interactive OpenStreetMap explorer with explicit, user-initiated geolocation or place search.
- Nearby community-mapped accessibility records for wheelchair tags, crossings, tactile paving, ramps/lowered kerbs, toilets, lifts, rest points and parking, with category filters and map/list synchronization.
- Search-radius controls, refresh, map popups, source attribution and uncertainty labels.
- Private barrier observations with category, impact, notes and map-selected/current location; local persistence, deletion and JSON export.
- Reports are explicitly unverified, stored on the current device and never automatically published. OpenStreetMap records are community contributions, not verified access guarantees.
- Uses public OpenStreetMap/Nominatim/Overpass services, retries backup Overpass instances when the primary is unavailable, and can show a clearly labelled cached snapshot for the same nearby search. Availability, rate limits and coverage still depend on those services and network access.

## Live camera awareness (ECHO extension)

- Starts only after an explicit camera action and browser permission; continuously analyzes the live video stream with a general COCO-SSD model in the browser.
- Draws transient object boxes and labels, optionally announces observations, and releases camera tracks on stop, page hide or tab backgrounding.
- Frames are not captured as files, persisted or uploaded by this feature. The general detector does not identify ground stability, route clearance, holes, drop-offs, slope, water depth or safe footholds. It is not a route planner or a certified mobility/navigation system; do not use it to choose a path.

## FORMGENIUS — Documents and services

- Reads text-based PDFs with PDF.js and scanned PDFs/images with Tesseract.js English/Hindi OCR, in the browser.
- Extracts likely application fields (name, date of birth, contact, address, identity/reference labels and related values) into editable review cards.
- Lets users correct extracted text, edit field values, mark values as reviewed, track review completion, copy data, export JSON, and print a review sheet.
- Includes generic preparation checklists for education, identity/address, healthcare, accessibility and public-service workflows. Checklists are guidance only; current requirements must be confirmed with the issuing authority.
- No API key, account, backend, or paid service is required. Document bytes and extracted fields are not uploaded or persisted by FORMGENIUS; processing is local to the browser. Public CDN/model downloads require internet access.



## Stage 4 — TERRAIN AI (image-only visual analysis)

- Accepts a user-selected JPG, PNG or WEBP image, or the latest image/frame captured in ECHO; no always-on terrain camera is included.
- Builds a translucent 12×8 region overlay using browser-side luminance texture and local contrast sampling.
- Classifies sampled regions as lower, moderate or higher visual variation, with separate uncertainty regions for weak, extreme-brightness or insufficient visual signal.
- Displays a visual variation summary, sampled-region counts, uncertainty counts, optional local-contrast analysis, overlay toggle, spoken summary and JSON export.
- All analysis is performed in the browser; no API key, account, backend or upload service is required.
- This is deterministic image processing, not a trained terrain/material/depth model. Colours are visual-variation cues only—not safety, walkability, slope, traction, stability, load-bearing, route or foot-placement predictions. A single image cannot establish those properties.

## Separate live object camera

- Restores the third, independent live camera using the lightweight COCO-SSD MobileNet detector, with transient boxes, object labels, confidence percentages, optional spoken observations, explicit start/stop and camera cleanup.
- It is separate from TERRAIN AI; the removed live footstep/terrain-awareness camera is not restored.

## GitHub Pages deployment

The repository includes .github/workflows/deploy-pages.yml. On each push to main, it validates the static app, uploads the repository root as a Pages artifact and deploys it using the official Pages actions. Every run has a unique concurrency group and cancel-in-progress is false, so newer commits do not cancel earlier deployments.

If Pages has never been enabled, GitHub may require the repository owner to set Settings → Pages → Build and deployment → Source: GitHub Actions once. After that, the workflow deploys automatically. The live address appears in the successful workflow's github-pages environment and Actions run summary.

## Run locally

Run python -m http.server 8000 and open http://localhost:8000. Do not open the HTML file directly if you need camera access.

## Test

Run npm test. The test checks JavaScript syntax and verifies ECHO, CIVICLENS, FORMGENIUS, TERRAIN AI, live object camera, map/report integrations, explicit file-picker wiring and accessibility-motion styles.

## Roadmap

1. **ECHO — Perception:** camera/image understanding, OCR, voice interaction and accessibility settings.
2. **CIVICLENS — Civic accessibility:** map and report public accessibility barriers and accessible infrastructure. (Implemented; private reports are local-only and exportable)
3. **FORMGENIUS — Documents and services:** explain forms, extract fields and guide users through service workflows.
4. **TERRAIN AI — Environment awareness:** experimental relative-depth visual awareness and uncertainty cues only; not route or foothold guidance.
5. **CORE — Unified ecosystem:** connect the modules through a coordinated, privacy-conscious platform.

## License

MIT. See LICENSE.

### CIVICLENS Stage 2 completion notes

CIVICLENS includes category-based barrier reporting, optional GPS, local verification status, duplicate suppression (same category within 30 metres and 24 hours), OpenStreetMap discovery, report dashboard, hotspot/missing-infrastructure summaries, an accessibility-debt indicator, and rule-based inspection-priority estimates. Community report synchronization is intentionally not included. Reports remain private on the current device and can be exported as JSON; no account, cloud database, API key or paid service is required.

The debt index and inspection-priority ranking are transparent heuristics, not validated public accessibility ratings or trained predictions. Automated camera-based barrier classification is not included because the available general-object model produced unreliable labels.
