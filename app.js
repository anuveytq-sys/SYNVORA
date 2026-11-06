
(()=>{"use strict";
const $=id=>document.getElementById(id);
const S={image:null,model:null,detections:[],text:"",stream:null,video:null,lang:"en-US",recognition:null,ocrWorker:null,accessibilityDetector:null,accessibilityResults:[],accessibilityScanDone:false};
const D={
"en-US":{loading:"AI models loading…",ready:"OBJECT MODEL READY",modelError:"OBJECT MODEL UNAVAILABLE",skip:"Skip to workspace",headline:"See beyond the frame.",intro:"ECHO helps explore an image or camera view with object labels, readable text and voice controls. Results are assistive clues, not navigation instructions.",liveInput:"LIVE INPUT",scanner:"Visual scanner",noInput:"NO INPUT",workspace:"Your visual workspace",startPrompt:"Start the camera or upload an image to begin.",startCamera:"Start camera",stopCamera:"Stop camera",capture:"Capture frame",upload:"Upload image",modelNote:"Object detection runs in this browser. The model does not identify every accessibility feature or hazard.",output:"PERCEPTION OUTPUT",intelligence:"Scene intelligence",analyze:"Analyze scene",analyzing:"Analyzing…",detected:"Detected objects",noAnalysis:"No image analyzed yet.",explanation:"Scene explanation",ocrTitle:"Text in image (OCR)",readAloud:"Read aloud",extract:"Extract visible text",extracting:"Reading…",askTitle:"Ask about this image",imageContext:"IMAGE CONTEXT",askNote:"Ask about detected object labels or extracted text. Answers are limited to this scan.",questionLabel:"Your question about the image",ask:"Ask ECHO",answerPrompt:"Your answer will appear here.",speakQuestion:"🎙 Speak a question",stopAudio:"Stop audio",voiceSupport:"Voice features depend on browser support.",personalAccess:"PERSONAL ACCESS",profileTitle:"Accessibility profile",profile:"Profile",language:"Language",textSize:"Text size",highContrast:"High contrast",privacy:"Preferences stay on this device. Camera frames and selected images are processed in the browser, not sent to a SYNVORA server.",quickSettings:"Quick settings",reduceMotion:"Reduce motion",keyboardFocus:"Strong keyboard focus",keyboardHelp:"Use Tab, Shift+Tab, Enter and Space to navigate. Press Escape to close this panel.",safetyFooter:"Assistive information only. Never rely on this app to confirm that a route is safe.",needImage:"Load an image or start the camera first.",noObjects:"No supported objects detected. This does not mean the area is clear.",scenePrefix:"ECHO detected",objectTypes:"object type(s):",uncertain:"The model may miss objects and does not reliably recognize stairs, ramps, doors, drop-offs, or route clearance. Do not use this result to decide whether a path is safe.",ocrNone:"No readable text found.",ocrFail:"Text extraction failed. Try a sharper, well-lit image.",ocrUnavailable:"OCR library unavailable or no image loaded.",readNone:"No text has been extracted yet.",speechUnsupported:"Speech recognition is not supported in this browser. Type your question instead.",listening:"Listening…",voiceError:"Voice input error: ",cameraError:"Camera unavailable: ",noText:"No text extracted yet. Select Extract visible text first.",textAnswer:"Readable text extracted: ",objectAnswer:"The model detected: ",notEnough:"I cannot determine that from the current scan. Try analyzing the scene or extracting text first.",hazardAnswer:"I cannot reliably confirm stairs, ramps, doors, exits, drop-offs, obstacles, or route safety. Please check the environment directly and use an appropriate trusted mobility aid or person.",profileApplied:"Accessibility profile applied.",accessibilityScanTitle:"Accessibility cues",accessibilityCaution:"Experimental visual suggestions only. This model is not validated for mobility decisions and cannot certify a route as safe.",questionPlaceholder:"What objects can you identify?",profileStandard:"Standard",profileLowVision:"Low vision",profileScreenReader:"Screen reader",profileMotor:"Motor accessibility",profileHearing:"Hearing accessibility",textDefault:"Default",textLarge:"Large",textExtraLarge:"Extra large",textMaximum:"Maximum",accessibilityScan:"Run extended accessibility scan",accessibilityNotRun:"No extended accessibility scan has been run.",loadingAccessibilityModel:"Loading extended visual model (first use can take a while)…",accessibilityModelReady:"Extended visual model ready.",accessibilityModelFailed:"Extended visual scan unavailable:",scanningAccessibility:"Scanning…",accessibilityScanComplete:"Extended scan complete. These are unvalidated visual candidates, not confirmed hazards.",noAccessibilityCandidates:"No accessibility-related candidates were returned. This does not prove the area is clear.",runAccessibilityFirst:"Run the extended accessibility scan first. Its results are experimental clues only.",candidateMatches:"Possible visual matches:",noCandidateNotProof:"No matching candidate was returned. This does not prove the feature or hazard is absent.",upper:"upper",middle:"middle",lower:"lower",left:"left",centre:"centre",right:"right"},
"hi-IN":{loading:"AI मॉडल लोड हो रहे हैं…",ready:"ऑब्जेक्ट मॉडल तैयार है",modelError:"ऑब्जेक्ट मॉडल उपलब्ध नहीं है",skip:"मुख्य कार्यक्षेत्र पर जाएँ",headline:"तस्वीर से आगे देखें।",intro:"ECHO तस्वीर या कैमरा दृश्य में वस्तुओं के नाम, पढ़ने योग्य टेक्स्ट और आवाज़ की सुविधाएँ देता है। परिणाम सहायक संकेत हैं, रास्ता बताने वाले निर्देश नहीं।",liveInput:"लाइव इनपुट",scanner:"दृश्य स्कैनर",noInput:"कोई इनपुट नहीं",workspace:"आपका दृश्य कार्यक्षेत्र",startPrompt:"शुरू करने के लिए कैमरा चालू करें या तस्वीर अपलोड करें।",startCamera:"कैमरा शुरू करें",stopCamera:"कैमरा बंद करें",capture:"फ्रेम कैप्चर करें",upload:"तस्वीर अपलोड करें",modelNote:"वस्तु पहचान इसी ब्राउज़र में होती है। मॉडल हर सुगम्यता सुविधा या खतरे को नहीं पहचान सकता।",output:"विश्लेषण परिणाम",intelligence:"दृश्य जानकारी",analyze:"दृश्य का विश्लेषण करें",analyzing:"विश्लेषण हो रहा है…",detected:"पहचानी गई वस्तुएँ",noAnalysis:"अभी किसी तस्वीर का विश्लेषण नहीं हुआ।",explanation:"दृश्य का विवरण",ocrTitle:"तस्वीर में टेक्स्ट (OCR)",readAloud:"ज़ोर से पढ़ें",extract:"दिखाई देने वाला टेक्स्ट निकालें",extracting:"पढ़ा जा रहा है…",askTitle:"इस तस्वीर के बारे में पूछें",imageContext:"तस्वीर का संदर्भ",askNote:"पहचानी गई वस्तुओं या निकाले गए टेक्स्ट के बारे में पूछें। जवाब इसी स्कैन तक सीमित हैं।",questionLabel:"तस्वीर के बारे में आपका सवाल",ask:"ECHO से पूछें",answerPrompt:"आपका जवाब यहाँ दिखाई देगा।",speakQuestion:"🎙 बोलकर सवाल पूछें",stopAudio:"आवाज़ रोकें",voiceSupport:"आवाज़ की सुविधाएँ ब्राउज़र पर निर्भर करती हैं।",personalAccess:"व्यक्तिगत सुगम्यता",profileTitle:"सुगम्यता प्रोफ़ाइल",profile:"प्रोफ़ाइल",language:"भाषा",textSize:"टेक्स्ट का आकार",highContrast:"हाई कॉन्ट्रास्ट",privacy:"सेटिंग इसी डिवाइस पर रहती हैं। तस्वीरें ब्राउज़र में प्रोसेस होती हैं, SYNVORA सर्वर पर नहीं भेजी जातीं।",quickSettings:"त्वरित सेटिंग",reduceMotion:"एनिमेशन कम करें",keyboardFocus:"कीबोर्ड फ़ोकस स्पष्ट करें",keyboardHelp:"नेविगेट करने के लिए Tab, Shift+Tab, Enter और Space का उपयोग करें। बंद करने के लिए Escape दबाएँ।",safetyFooter:"यह केवल सहायक जानकारी है। रास्ता सुरक्षित है या नहीं, यह तय करने के लिए इस ऐप पर निर्भर न रहें।",needImage:"पहले तस्वीर लोड करें या कैमरा शुरू करें।",noObjects:"कोई समर्थित वस्तु नहीं मिली। इसका अर्थ यह नहीं कि जगह खाली या सुरक्षित है।",scenePrefix:"ECHO ने पहचाना",objectTypes:"वस्तु प्रकार:",uncertain:"मॉडल कुछ वस्तुओं को छोड़ सकता है और सीढ़ियाँ, रैंप, दरवाज़े, खुले गड्ढे या रास्ते की खाली जगह भरोसेमंद ढंग से नहीं पहचानता। रास्ते की सुरक्षा तय करने के लिए इस परिणाम का उपयोग न करें।",ocrNone:"पढ़ने योग्य टेक्स्ट नहीं मिला।",ocrFail:"टेक्स्ट निकालना असफल रहा। साफ़ और अच्छी रोशनी वाली तस्वीर आज़माएँ।",ocrUnavailable:"OCR लाइब्रेरी उपलब्ध नहीं है या तस्वीर लोड नहीं है।",readNone:"अभी कोई टेक्स्ट नहीं निकाला गया है।",speechUnsupported:"इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया सवाल टाइप करें।",listening:"सुन रहा है…",voiceError:"आवाज़ इनपुट त्रुटि: ",cameraError:"कैमरा उपलब्ध नहीं: ",noText:"अभी टेक्स्ट नहीं निकाला गया। पहले टेक्स्ट निकालें।",textAnswer:"निकाला गया टेक्स्ट: ",objectAnswer:"मॉडल ने पहचाना: ",notEnough:"मैं मौजूदा स्कैन से यह निर्धारित नहीं कर सकता। पहले दृश्य का विश्लेषण करें या टेक्स्ट निकालें।",hazardAnswer:"मैं सीढ़ियों, रैंप, दरवाज़ों, निकास, खुले गड्ढों, बाधाओं या रास्ते की सुरक्षा की भरोसेमंद पुष्टि नहीं कर सकता। कृपया आसपास सीधे जाँचें और उपयुक्त विश्वसनीय सहायता लें।",profileApplied:"सुगम्यता प्रोफ़ाइल लागू की गई।",accessibilityScanTitle:"सुगम्यता संकेत",accessibilityCaution:"केवल प्रयोगात्मक दृश्य संकेत। यह मॉडल गतिशीलता संबंधी निर्णयों के लिए प्रमाणित नहीं है और रास्ते को सुरक्षित घोषित नहीं कर सकता।",questionPlaceholder:"आपको कौन-सी वस्तुएँ दिखाई दे रही हैं?",profileStandard:"सामान्य",profileLowVision:"कम दृष्टि",profileScreenReader:"स्क्रीन रीडर",profileMotor:"मोटर सुगम्यता",profileHearing:"श्रवण सुगम्यता",textDefault:"डिफ़ॉल्ट",textLarge:"बड़ा",textExtraLarge:"और बड़ा",textMaximum:"सबसे बड़ा",accessibilityScan:"विस्तृत सुगम्यता स्कैन चलाएँ",accessibilityNotRun:"अभी विस्तृत सुगम्यता स्कैन नहीं चलाया गया।",loadingAccessibilityModel:"विस्तृत दृश्य मॉडल लोड हो रहा है… पहली बार अधिक समय लग सकता है।",accessibilityModelReady:"विस्तृत दृश्य मॉडल तैयार है।",accessibilityModelFailed:"विस्तृत स्कैन उपलब्ध नहीं है:",scanningAccessibility:"स्कैन हो रहा है…",accessibilityScanComplete:"विस्तृत स्कैन पूरा हुआ। ये अप्रमाणित दृश्य संकेत हैं, पुष्ट खतरे नहीं।",noAccessibilityCandidates:"सुगम्यता से जुड़े कोई संकेत नहीं मिले। इसका अर्थ यह नहीं कि जगह खाली या सुरक्षित है।",runAccessibilityFirst:"पहले विस्तृत सुगम्यता स्कैन चलाएँ। इसके परिणाम केवल प्रयोगात्मक संकेत हैं।",candidateMatches:"संभावित दृश्य संकेत:",noCandidateNotProof:"कोई मिलता-जुलता संकेत नहीं मिला। इसका अर्थ यह नहीं कि वह चीज़ मौजूद नहीं है।",upper:"ऊपरी",middle:"मध्य",lower:"निचला",left:"बायाँ",centre:"बीच",right:"दायाँ"}
};
const t=k=>(D[S.lang]||D["en-US"])[k]||D["en-US"][k]||k;
function store(k,v){try{localStorage.setItem("synvora-"+k,String(v))}catch(e){}}
function read(k,d){try{return localStorage.getItem("synvora-"+k)??d}catch(e){return d}}
function applyLanguage(){document.documentElement.lang=S.lang==="hi-IN"?"hi":"en";document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(D[S.lang][k])el.textContent=t(k)});$("camera-start").textContent=S.stream?t("stopCamera"):t("startCamera");$("analyze").textContent=t("analyze");$("run-ocr").textContent=t("extract");$("image-question").placeholder=t("questionPlaceholder")}
function speak(text){if(!("speechSynthesis"in window)){$("voice-status").textContent=t("speechUnsupported");return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=S.lang;const vs=speechSynthesis.getVoices();u.voice=vs.find(v=>v.lang.toLowerCase()===S.lang.toLowerCase())||vs.find(v=>v.lang.toLowerCase().startsWith(S.lang.slice(0,2)))||null;speechSynthesis.speak(u)}
const SCRIPT_CACHE=new Map();
function disposePipeline(p){try{if(p?.dispose)p.dispose();else if(p?.model?.dispose)p.model.dispose()}catch(e){console.warn("Model disposal",e)}}
window.SYNVORA_MODELS?.register("echo-object",async()=>{if(S.model){S.model.dispose?.();S.model=null}if(window.tf?.disposeVariables)try{tf.disposeVariables()}catch(e){}});
window.SYNVORA_MODELS?.register("echo-accessibility",async()=>{if(S.accessibilityDetector){disposePipeline(S.accessibilityDetector);S.accessibilityDetector=null}});
window.SYNVORA_MODELS?.register("ocr",async()=>{if(S.ocrWorker){await S.ocrWorker.terminate();S.ocrWorker=null}});
function loadScript(src,ready){
 if(ready())return Promise.resolve();
 if(SCRIPT_CACHE.has(src))return SCRIPT_CACHE.get(src);
 const task=new Promise((resolve,reject)=>{
  const script=document.createElement("script");script.src=src;script.async=true;
  const timer=setTimeout(()=>{script.remove();reject(Error("Timed out loading "+src))},25000);
  script.onload=()=>{clearTimeout(timer);ready()?resolve():reject(Error("Library did not initialize"))};
  script.onerror=()=>{clearTimeout(timer);script.remove();reject(Error("Could not load "+src))};
  document.head.append(script);
 });
 SCRIPT_CACHE.set(src,task);task.catch(()=>SCRIPT_CACHE.delete(src));return task;
}
async function loadModel(){
 if(S.model)return S.model;
 await window.SYNVORA_MODELS?.activate("echo-object");
 $("model-status").textContent="LOADING OBJECT MODEL…";
 try{
  await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js",()=>!!window.tf);
  await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js",()=>!!window.cocoSsd);
  S.model=await cocoSsd.load({base:"lite_mobilenet_v2"});
  $("model-status").textContent=t("ready");return S.model;
 }catch(e){$("model-status").textContent=t("modelError")+" · "+(e.message||"");throw e}
}
function resetResults(){S.accessibilityResults=[];S.accessibilityScanDone=false;$("accessibility-results").textContent=t("accessibilityNotRun");$("accessibility-scan").disabled=!S.image;$("detections").innerHTML="<li>"+t("noAnalysis")+"</li>";$("scene-summary").textContent=t("summaryPrompt")||"Your scene summary will appear here.";$("ocr-output").textContent="Extracted text will appear here.";S.detections=[];S.text=""}
function stopCamera(){if(S.stream){if(window.SYNVORA_CAMERA)window.SYNVORA_CAMERA.release("echo");else S.stream.getTracks().forEach(x=>x.stop())}S.stream=null;S.video=null;$("capture").disabled=true;$("camera-start").textContent=t("startCamera")}
function showImage(img){stopCamera();S.image=img;window.SYNVORA_ECHO_IMAGE=img;window.dispatchEvent(new CustomEvent("synvora:image-ready",{detail:{image:img}}));img.alt=S.lang==="hi-IN"?"विश्लेषण के लिए चुनी गई तस्वीर":"Selected image for analysis";img.style.maxWidth="100%";img.style.maxHeight="440px";img.style.objectFit="contain";$("viewer").replaceChildren(img);$("input-state").textContent=S.lang==="hi-IN"?"तस्वीर तैयार":"IMAGE READY";$("analyze").disabled=false;resetResults();$("accessibility-scan").disabled=false}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("image-upload").addEventListener("change",e=>{const f=e.target.files?.[0];if(!f||!f.type.startsWith("image/"))return;const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{showImage(im);URL.revokeObjectURL(u)};im.onerror=()=>URL.revokeObjectURL(u);im.src=u});
$("camera-start").addEventListener("click",async()=>{if(S.stream){stopCamera();return}if(!navigator.mediaDevices?.getUserMedia){$("voice-status").textContent=t("cameraError")+"Camera access requires HTTPS and a supported browser.";return}try{$("camera-start").disabled=true;$("voice-status").textContent="Starting camera preview…";S.stream=window.SYNVORA_CAMERA?await window.SYNVORA_CAMERA.acquire("echo",{video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:false}):await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});const v=document.createElement("video");v.autoplay=true;v.playsInline=true;v.setAttribute("playsinline","");v.muted=true;v.srcObject=S.stream;await v.play();S.video=v;$("viewer").replaceChildren(v);$("capture").disabled=false;$("camera-start").textContent=t("stopCamera");$("input-state").textContent="CAMERA LIVE";$("voice-status").textContent="Camera preview active. Capture a frame to analyze it."}catch(e){stopCamera();$("voice-status").textContent=t("cameraError")+(e.message||"permission denied")}finally{$("camera-start").disabled=false}});
$("capture").addEventListener("click",()=>{if(!S.video?.videoWidth)return;const c=document.createElement("canvas");c.width=S.video.videoWidth;c.height=S.video.videoHeight;c.getContext("2d").drawImage(S.video,0,0);const im=new Image();im.onload=()=>showImage(im);im.src=c.toDataURL("image/jpeg",.92)});
$("analyze").addEventListener("click",async()=>{if(!S.image)return;$("analyze").disabled=true;$("analyze").textContent=t("analyzing");try{if(!S.model)await loadModel();if(!S.model)throw Error("Object model unavailable");S.detections=await S.model.detect(S.image,20,.4);const list=$("detections");list.replaceChildren();if(!S.detections.length){list.textContent=t("noObjects");$("scene-summary").textContent=t("noObjects")+" "+t("uncertain");return}S.detections.sort((a,b)=>b.score-a.score).forEach(d=>{const li=document.createElement("li");li.innerHTML="<strong>"+safe(d.class==="bed"?"Large indoor object (tentative bed guess)":d.class)+"</strong> — "+Math.round(d.score*100)+"% model confidence";list.append(li)});$("scene-summary").textContent=t("scenePrefix")+" "+S.detections.length+" "+t("objectTypes")+" "+S.detections.map(d=>d.class==="bed"?"large indoor object (tentative bed guess)":d.class).join(", ")+". "+t("uncertain")}catch(e){$("scene-summary").textContent="Analysis could not complete: "+e.message}finally{$("analyze").disabled=false;$("analyze").textContent=t("analyze")}});

async function loadAccessibilityDetector(){
 if(S.accessibilityDetector)return S.accessibilityDetector;
 await window.SYNVORA_MODELS?.activate("echo-accessibility");
 $("accessibility-scan-status").textContent=t("loadingAccessibilityModel");
 try{
  await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js",()=>!!window.tf);
  await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js",()=>!!window.cocoSsd);
  try{await tf.setBackend("webgl")}catch(e){}
  await tf.ready();
  S.accessibilityDetector=await cocoSsd.load({base:"lite_mobilenet_v2"});
  $("accessibility-scan-status").textContent="Lightweight object detector ready. It reports common objects, not accessibility features.";
  return S.accessibilityDetector;
 }catch(e){$("accessibility-scan-status").textContent=t("accessibilityModelFailed")+" "+(e.message||"");throw e}
}
$("accessibility-scan").addEventListener("click",async()=>{
 if(!S.image){$("accessibility-results").textContent=t("needImage");return}
 const b=$("accessibility-scan");b.disabled=true;b.textContent=t("scanningAccessibility");
 try{
  const detector=await loadAccessibilityDetector();
  const output=await detector.detect(S.image,20,.25);
  S.accessibilityResults=(output||[]).sort((a,b)=>b.score-a.score);
  S.accessibilityScanDone=true;
  const list=$("accessibility-results");list.replaceChildren();
  if(!S.accessibilityResults.length){list.textContent="No common objects were detected. This does not prove that an accessibility feature or barrier is absent."}
  else S.accessibilityResults.forEach(item=>{
   const li=document.createElement("li"),[x,y,w,h]=item.bbox||[0,0,0,0];
   const cx=(x+w/2)/(S.image.naturalWidth||S.image.width||1),cy=(y+h/2)/(S.image.naturalHeight||S.image.height||1);
   const pos=(cy<.34?t("upper"):cy>.66?t("lower"):t("middle"))+" "+(cx<.34?t("left"):cx>.66?t("right"):t("centre"));
   li.textContent=item.class+" — "+Math.round(item.score*100)+"% model confidence · "+pos;list.append(li);
  });
  $("accessibility-scan-status").textContent="Scan complete. Common-object labels only; not an accessibility or safety assessment.";
 }catch(e){$("accessibility-results").textContent=t("accessibilityModelFailed")+" "+(e.message||"")}
 finally{b.disabled=!S.image;b.textContent=t("accessibilityScan")}
});
async function worker(){
 if(S.ocrWorker)return S.ocrWorker;
 await window.SYNVORA_MODELS?.activate("ocr");
 await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js",()=>!!window.Tesseract);
 S.ocrWorker=await Tesseract.createWorker("eng+hin",1,{langPath:"https://tessdata.projectnaptha.com/4.0.0",logger:m=>{if(m.status==="recognizing text")$("ocr-output").textContent="OCR "+Math.round((m.progress||0)*100)+"%"}});
 try{await S.ocrWorker.setParameters({tessedit_pageseg_mode:"6",preserve_interword_spaces:"1"})}catch(e){}
 return S.ocrWorker;
}
function prepareOcrImage(source){
 const w=source.naturalWidth||source.videoWidth||source.width,h=source.naturalHeight||source.videoHeight||source.height;if(!w||!h)throw Error("Image dimensions are unavailable.");
 const scale=Math.min(1,1800/Math.max(w,h),Math.sqrt(3000000/(w*h))),c=document.createElement("canvas");c.width=Math.max(1,Math.round(w*scale));c.height=Math.max(1,Math.round(h*scale));
 const x=c.getContext("2d",{willReadFrequently:true});x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.filter="grayscale(1) contrast(1.18)";x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.drawImage(source,0,0,c.width,c.height);x.filter="none";return c;
}
$("run-ocr").addEventListener("click",async()=>{
 if(!S.image){$("ocr-output").textContent=t("ocrUnavailable");return}const b=$("run-ocr");b.disabled=true;b.textContent=t("extracting");$("ocr-output").textContent="Preparing image · English + Hindi OCR…";
 try{const w=await worker(),r=await w.recognize(prepareOcrImage(S.image));S.text=(r.data.text||"").replace(/[\\t ]+\\n/g,"\\n").trim();$("ocr-output").textContent=S.text?S.text+"\\n\\nConfidence: "+Math.round(r.data.confidence||0)+"%":"No text detected. Try a closer, sharper, well-lit image."}
 catch(e){if(S.ocrWorker){try{await S.ocrWorker.terminate()}catch{}S.ocrWorker=null}const m=String(e?.message||e);$("ocr-output").textContent=/memory|alloc|abort|wasm/i.test(m)?"OCR ran out of browser memory. Stop other AI scans, reload the page and try a smaller image.":"OCR failed: "+m.slice(0,220)}
 finally{b.disabled=false;b.textContent=t("extract")}
});
$("read-text").addEventListener("click",()=>speak(S.text||t("readNone")));
$("question-form").addEventListener("submit",e=>{e.preventDefault();const q=$("image-question").value.trim().toLowerCase();if(!S.image){$("answer").textContent=t("needImage");return}if(/text|read|written|sign|word|लिख|पढ़|शब्द|बोर्ड/.test(q))$("answer").textContent=S.text?t("textAnswer")+S.text:t("noText");else if(/stairs|steps|ramp|door|exit|obstacle|safe|danger|path|route|सीढ़|रैंप|दरवाज़|दरवाज|रास्त|बाधा|निकास/.test(q)){if(!S.accessibilityScanDone){$("answer").textContent=t("runAccessibilityFirst")}else{const hits=S.accessibilityResults.filter(d=>q.split(/[^a-z]+/).some(w=>w.length>2&&d.label.toLowerCase().includes(w))||(/stairs|steps|सीढ़/.test(q)&&/stairs|staircase|steps/.test(d.label))||(/ramp|रैंप/.test(q)&&/ramp/.test(d.label))||(/door|दरवाज़|दरवाज/.test(q)&&/door/.test(d.label))||(/obstacle|बाधा/.test(q)&&/obstacle|barrier|pothole|curb/.test(d.label)));$("answer").textContent=hits.length?t("candidateMatches")+" "+hits.map(d=>d.label+" ("+Math.round(d.score*100)+"%)").join(", ")+". "+t("uncertain"):t("noCandidateNotProof")}}else if(S.detections.length)$("answer").textContent=t("objectAnswer")+S.detections.map(d=>d.class).join(", ")+". "+t("uncertain");else $("answer").textContent=t("notEnough")});
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
$("listen").addEventListener("click",()=>{if(!SR){$("voice-status").textContent=t("speechUnsupported");return}try{if(S.recognition)S.recognition.abort();const r=new SR();S.recognition=r;r.lang=S.lang;r.interimResults=false;r.maxAlternatives=1;r.onstart=()=>$("voice-status").textContent=t("listening");r.onresult=e=>{$("image-question").value=e.results[0][0].transcript;$("question-form").requestSubmit()};r.onerror=e=>$("voice-status").textContent=t("voiceError")+e.error;r.onend=()=>S.recognition=null;r.start()}catch(e){$("voice-status").textContent=t("speechUnsupported")}});
$("stop-speaking").addEventListener("click",()=>{if(window.speechSynthesis)speechSynthesis.cancel();if(S.recognition)S.recognition.abort();$("voice-status").textContent="Audio stopped"});
function applyProfile(p){document.body.classList.remove("profile-low-vision","profile-screen-reader","profile-motor","profile-hearing","large-targets","visual-status");document.body.classList.add("profile-"+p);if(p==="low-vision"){$("contrast").checked=true;document.body.classList.add("high-contrast");store("contrast",true);$("text-size").value="1.3";document.documentElement.style.fontSize="20.8px";store("text-size","1.3")}if(p==="screen-reader"){$("keyboard-mode").checked=true;document.body.classList.add("keyboard-mode")}if(p==="motor")document.body.classList.add("large-targets");if(p==="hearing")document.body.classList.add("visual-status");if(p==="screen-reader"){$("answer").setAttribute("aria-live","assertive");$("answer").setAttribute("aria-atomic","true")}else{$("answer").setAttribute("aria-live","polite")}store("profile",p)}
$("profile").addEventListener("change",e=>{applyProfile(e.target.value);$("voice-status").textContent=t("profileApplied")});
$("language").addEventListener("change",e=>{S.lang=e.target.value;store("language",S.lang);applyLanguage();if(S.ocrWorker){S.ocrWorker.terminate();S.ocrWorker=null}if(S.recognition)S.recognition.abort()});
$("text-size").addEventListener("change",e=>{document.documentElement.style.fontSize=(16*Number(e.target.value))+"px";store("text-size",e.target.value)});
$("contrast").addEventListener("change",e=>{document.body.classList.toggle("high-contrast",e.target.checked);store("contrast",e.target.checked)});
$("reduce-motion").addEventListener("change",e=>{document.body.classList.toggle("reduce-motion",e.target.checked);store("reduce-motion",e.target.checked)});
$("keyboard-mode").addEventListener("change",e=>{document.body.classList.toggle("keyboard-mode",e.target.checked);store("keyboard-mode",e.target.checked)});
$("settings-toggle").addEventListener("click",()=>{const p=$("settings-panel");p.hidden=!p.hidden;$("settings-toggle").setAttribute("aria-expanded",String(!p.hidden));if(!p.hidden)$("settings-close").focus()});
$("settings-close").addEventListener("click",()=>{$("settings-panel").hidden=true;$("settings-toggle").setAttribute("aria-expanded","false");$("settings-toggle").focus()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("settings-panel").hidden)$("settings-close").click()});
window.addEventListener("pagehide",()=>{stopCamera();if(S.ocrWorker)S.ocrWorker.terminate();if(window.speechSynthesis)speechSynthesis.cancel()});
function restore(){S.lang=read("language","en-US");if(!D[S.lang])S.lang="en-US";$("language").value=S.lang;$("profile").value=read("profile","standard");$("text-size").value=read("text-size","1");document.documentElement.style.fontSize=(16*Number($("text-size").value))+"px";$("contrast").checked=read("contrast","false")==="true";document.body.classList.toggle("high-contrast",$("contrast").checked);$("reduce-motion").checked=read("reduce-motion","false")==="true";document.body.classList.toggle("reduce-motion",$("reduce-motion").checked);$("keyboard-mode").checked=read("keyboard-mode","false")==="true";document.body.classList.toggle("keyboard-mode",$("keyboard-mode").checked);applyProfile($("profile").value);applyLanguage()}
restore();
function setupReveal(){
 const revealables=[...document.querySelectorAll(".intro,.work-grid > .card,.assistant-card,.profile-card")];
 revealables.forEach((el,i)=>{el.classList.add("reveal-panel");el.style.setProperty("--reveal-delay",Math.min(i,5)*90+"ms")});
 if(!("IntersectionObserver"in window)){revealables.forEach(el=>el.classList.add("is-visible"));return}
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}});
 },{threshold:.12,rootMargin:"0px 0px -5% 0px"});
 revealables.forEach(el=>observer.observe(el));

}
setupReveal();
window.addEventListener("error",e=>{
 const msg=e.message||"Unexpected application error";
 const status=$("model-status");if(status)status.textContent="APP ERROR · "+msg.slice(0,90);
});
window.addEventListener("unhandledrejection",e=>{
 const status=$("voice-status");if(status)status.textContent="A feature could not finish: "+String(e.reason?.message||e.reason||"unknown error");
});
})();