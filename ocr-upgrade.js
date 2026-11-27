(()=>{"use strict";
const $=id=>document.getElementById(id);
const state={busy:false};
function setStatus(message,stateText){if($("ocr-status"))$("ocr-status").textContent=message;if(stateText&&$("ocr-state"))$("ocr-state").textContent=stateText}
function classify(text){
 const s=String(text||"").toLowerCase(),out=[];
 const rules=[
 ["Possible warning",/warning|danger|caution|closed|slippery|landslide|falling rocks|restricted|चेतावनी|सावधान|खतरा|बंद|फिसलन|भूस्खलन/i],
 ["Possible direction",/left|right|straight|north|south|east|west|←|→|↑|↓|बाएँ|दाएँ|सीधा|उत्तर|दक्षिण|पूर्व|पश्चिम/i],
 ["Possible trail marker",/trail|trek|route|path|track|km|kilomet|meter|mile|पगडंडी|रास्ता|मार्ग|किमी|मीटर/i],
 ["Possible place or facility",/camp|shelter|village|summit|peak|water|toilet|hospital|checkpoint|शिविर|गाँव|शिखर|पानी|शौचालय|अस्पताल/i]
 ];
 for(const [label,re] of rules){const m=s.match(re);if(m)out.push(label+": "+m[0])}
 return out.length?out.join("\n"):"No common trail-sign keywords detected. OCR can miss stylized, distant, faded or damaged text.";
}
function updateActions(){const has=!!$("ocr-output")?.textContent.trim()&&!/^Extracted text will appear here\.$|^OCR \d+%$/.test($("ocr-output").textContent.trim());$("ocr-copy").disabled=!has;$("ocr-download").disabled=!has;$("read-text").disabled=!has}
function inspectOutput(){const text=$("ocr-output")?.textContent||"";if(!text||text==="Extracted text will appear here."||/^OCR \d+%$/.test(text.trim()))return;const clean=text.replace(/\n\nRecognition confidence:.*$/s,"").trim();$("ocr-cues").textContent=clean?classify(clean):"No text available to classify.";updateActions();if(clean)setStatus("OCR result ready. Check spelling, numbers and directions against the physical sign.","TEXT FOUND")}
function init(){
 if(!$("ocr-language"))return;
 $("ocr-language").addEventListener("change",e=>{window.SYNVORA_OCR_LANGUAGE=e.target.value;window.dispatchEvent(new Event("synvora:ocr-language-change"));setStatus("Recognition language set to "+e.target.options[e.target.selectedIndex].text+". Run OCR again.","LANGUAGE SET")});
 $("ocr-live-capture").addEventListener("click",()=>{
  if(state.busy)return;
  if(!$("capture")||$("capture").disabled){setStatus("Start the camera first, then try scanning a frame.","CAMERA OFF");return}
  const once=()=>{window.removeEventListener("synvora:image-ready",once);setTimeout(()=>{if(!$("run-ocr").disabled)$("run-ocr").click();},80)};
  window.addEventListener("synvora:image-ready",once,{once:true});$("capture").click();
  setStatus("Camera frame captured locally. Preparing OCR…","CAPTURED");
 });
 $("camera-start").addEventListener("click",()=>setTimeout(()=>{$("ocr-live-capture").disabled=$("capture").disabled;},0));
 const captureObserver=new MutationObserver(()=>{$("ocr-live-capture").disabled=$("capture").disabled});captureObserver.observe($("capture"),{attributes:true,attributeFilter:["disabled"]});
 $("image-upload").addEventListener("change",()=>setTimeout(()=>{$("ocr-live-capture").disabled=$("capture").disabled;},100));
 $("ocr-copy").addEventListener("click",async()=>{const text=$("ocr-output").textContent.replace(/\n\nRecognition confidence:.*$/s,"").trim();if(!text)return;try{await navigator.clipboard.writeText(text);setStatus("Extracted text copied to clipboard.","COPIED")}catch(e){setStatus("Clipboard unavailable. Select the result and copy it manually.","COPY UNAVAILABLE")}});
 $("ocr-download").addEventListener("click",()=>{const text=$("ocr-output").textContent.replace(/\n\nRecognition confidence:.*$/s,"").trim();if(!text)return;const url=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"})),a=document.createElement("a");a.href=url;a.download="synvora-ocr.txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus("OCR text download prepared.","DOWNLOADING")});
 $("ocr-clear").addEventListener("click",()=>{window.dispatchEvent(new Event("synvora:ocr-clear"));$("ocr-output").textContent="Extracted text will appear here.";$("ocr-cues").textContent="No OCR result yet.";$("read-text").disabled=true;updateActions();setStatus("OCR result cleared from this page.","OCR STANDBY")});
 const observer=new MutationObserver(inspectOutput);observer.observe($("ocr-output"),{childList:true,subtree:true,characterData:true});
 $("ocr-live-capture").disabled=$("capture").disabled;updateActions();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();