const fs=require("node:fs");const assert=require("node:assert/strict");const html=fs.readFileSync("index.html","utf8");const js=fs.readFileSync("app.js","utf8");const css=fs.readFileSync("styles.css","utf8");for(const id of ["viewer","camera-start","capture","image-upload","analyze","detections","scene-summary","run-ocr","read-text","question-form","image-question","answer","listen","stop-speaking","profile","language","text-size","contrast","reduce-motion","keyboard-mode","settings-panel","settings-toggle","settings-close","accessibility-scan","accessibility-results","accessibility-scan-status"])assert.match(html,new RegExp('id="'+id+'"'),"Missing UI element: "+id);for(const marker of ["getUserMedia","cocoSsd.load","Tesseract.createWorker","eng+hin","SpeechRecognition","speechSynthesis","localStorage","Escape","large-targets","zero-shot-object-detection","Xenova/owlvit-base-patch32","accessibilityScanDone","profile-hearing"])assert.ok(js.includes(marker),"Missing Stage 1 feature: "+marker);assert.ok(css.includes(":focus-visible"));assert.ok(css.includes("prefers-reduced-motion"));console.log("SYNVORA ECHO smoke checks passed.");
assert.ok(!html.includes("tf.min.js"),"Vendor scripts must not block the application bootstrap");
assert.ok(js.includes("function loadScript"),"Feature libraries should load on demand");
assert.ok(js.includes("setupReveal"),"Scroll reveal animation must initialize");
assert.ok(css.includes(".topbar{position:sticky;top:0;z-index:100"),"Header must remain visible while scrolling");
assert.ok(css.includes(".reveal-panel.is-visible"),"Scroll reveal styles must exist");

assert.ok(js.includes('if(!S.image){$("ocr-output").textContent=t("ocrUnavailable")'),"OCR must lazy-load Tesseract after image selection");

for(const id of ["live-route","route-video","route-start","route-stop","route-observations","civiclens","civic-map","civic-location","civic-search","civic-results","civic-report-notes","civic-save-report","civic-export"])assert.match(html,new RegExp('id="'+id+'"'),"Missing Stage 2/live camera UI element: "+id);
const civic=fs.readFileSync("civiclens.js","utf8");const route=fs.readFileSync("live-route.js","utf8");
for(const marker of ["overpass-api.de","nominatim.openstreetmap.org","wheelchair","tactile_paving","civic-report","localStorage","exportReports","geolocation"])assert.ok(civic.includes(marker),"Missing CivicLens feature: "+marker);
for(const marker of ["getUserMedia","cocoSsd.load","setInterval","speechSynthesis","pagehide","visibilitychange"])assert.ok(route.includes(marker),"Missing live camera feature: "+marker);
assert.ok(css.includes(".civic-map")&&css.includes(".route-viewer"),"Stage 2 and live camera styles must exist");
console.log("SYNVORA Stage 1 + Stage 2 + live camera smoke checks passed.");


const civicAI=fs.readFileSync("civic-ai.js","utf8");
const civicCloud=fs.readFileSync("civic-cloud.js","utf8");
for(const id of ["civic-ai-video","civic-ai-start","civic-ai-stop","civic-ai-report","civic-dashboard","civic-metric-total","civic-hotspot-list","civic-backend-signin","civic-cloud-sync"])assert.ok(html.includes('id="'+id+'"'),"Missing CIVICLENS Stage 2 UI: "+id);
for(const marker of ["zero-shot-object-detection","Xenova/owlvit-base-patch32","getUserMedia","setInterval","pagehide"])assert.ok(civicAI.includes(marker),"Missing live civic AI scanner feature: "+marker);
for(const marker of ["/auth/v1/signup","/auth/v1/token?grant_type=password","/rest/v1/civic_reports","created_by","civiclens:cloud-updated"])assert.ok(civicCloud.includes(marker),"Missing community backend feature: "+marker);
for(const marker of ["renderDashboard","verified","duplicate","30 m","24 hours"])assert.ok(civic.includes(marker),"Missing civic reporting/analytics feature: "+marker);
assert.ok(css.includes(".civic-ai-view")&&css.includes(".civic-dashboard-grid"),"CIVICLENS animated panel styling missing");
