(()=>{"use strict";
const KEY="synvora-openrouter-config-v1",$=id=>document.getElementById(id);
const S={config:null,busy:false,actions:[]};
const styles=`
.synvora-ai-config{border-top:1px solid #29445b;padding:16px 0 8px;margin-top:12px}
.synvora-ai-config label,.synvora-ai-panel label{display:grid;gap:6px;margin:12px 0 7px;color:#bfe9f0;font-size:.8rem}
.synvora-ai-config input,.synvora-ai-panel input,.synvora-ai-panel textarea{width:100%;min-width:0;padding:11px;border-radius:9px;border:1px solid #365d75;background:#041321;color:#effcff}
.synvora-ai-panel{margin:28px 0 34px;padding:20px;border:1px solid rgba(87,220,235,.35);border-radius:17px;background:radial-gradient(ellipse at 5% 0%,rgba(44,190,205,.14),transparent 45%),linear-gradient(145deg,rgba(7,31,49,.98),rgba(4,15,29,.99));box-shadow:0 0 32px rgba(42,180,205,.09)}
.synvora-ai-panel .ai-chat-log{display:grid;gap:10px;max-height:390px;overflow:auto;margin:14px 0}
.synvora-ai-panel .ai-message{padding:12px;border:1px solid rgba(100,228,232,.17);border-radius:10px;background:rgba(5,20,34,.82);font-size:.84rem;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}
.synvora-ai-panel .ai-message.user{border-color:rgba(110,180,255,.35)}
.synvora-ai-panel textarea{min-height:84px;resize:vertical}
.synvora-ai-panel .ai-row,.synvora-ai-config .ai-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.synvora-ai-panel .ai-status,.synvora-ai-config .ai-status{padding:10px;border:1px solid rgba(100,228,232,.17);border-radius:8px;background:#03111e;color:#a9eff0;font-size:.76rem;white-space:pre-wrap}
.synvora-ai-panel .ai-actions{display:grid;gap:8px;margin-top:10px}
.synvora-ai-panel .ai-action{display:flex;justify-content:space-between;gap:10px;padding:9px;border:1px solid rgba(100,228,232,.16);border-radius:8px;font-size:.76rem}
.synvora-ai-panel .ai-note,.synvora-ai-config .ai-note{font-size:.72rem;line-height:1.5;color:#91aebe}
.synvora-ai-panel .ai-check{display:flex!important;grid-template-columns:auto 1fr;align-items:flex-start;gap:9px!important}
.synvora-ai-panel .ai-check input{width:auto;min-width:auto;margin-top:3px}
`;
function addStyle(){if($("synvora-ai-style"))return;const s=document.createElement("style");s.id="synvora-ai-style";s.textContent=styles;document.head.append(s)}
function config(){try{const v=JSON.parse(localStorage.getItem(KEY)||"null");return v&&typeof v==="object"?v:null}catch{return null}}
function configStatus(s){const el=$("synvora-ai-config-status");if(el)el.textContent=s}
function chatStatus(s){const el=$("synvora-ai-status");if(el)el.textContent=s}
function addMessage(role,text){const log=$("synvora-ai-log"),item=document.createElement("div");item.className="ai-message "+role;item.textContent=text;log.append(item);log.scrollTop=log.scrollHeight}
function mount(){
 const settings=$("settings-panel"),main=document.querySelector("main.layout");if(!settings||!main||$("synvora-ai-panel"))return;
 const cfg=document.createElement("section");cfg.className="control-section synvora-ai-config";cfg.id="synvora-ai-config";
 cfg.innerHTML=`<div class="eyebrow">SYNVORA INTELLIGENCE · API CONFIGURATION</div><h3>OpenRouter connection</h3>
 <p class="ai-note">Enter your own OpenRouter API key and a free model ID. The key is saved only in this browser's local storage, not in the repository. Anyone using this browser profile may be able to access it. Never share your key.</p>
 <label for="synvora-ai-key">API key</label><input id="synvora-ai-key" type="password" autocomplete="off" placeholder="sk-or-v1-…">
 <label for="synvora-ai-model">Model ID</label><input id="synvora-ai-model" list="synvora-ai-models" value="openrouter/free" placeholder="provider/model:free"><datalist id="synvora-ai-models"><option value="openrouter/free"><option value="meta-llama/llama-3.3-70b-instruct:free"><option value="google/gemma-3-27b-it:free"></datalist>
 <div class="ai-row"><button type="button" class="primary" id="synvora-ai-test">Test configuration</button><button type="button" id="synvora-ai-save">Save configuration</button><button type="button" id="synvora-ai-clear">Clear key</button></div>
 <p class="ai-status" id="synvora-ai-config-status" role="status" aria-live="polite">Not connected. Add a key, test it, then save.</p>`;
 settings.append(cfg);
 const panel=document.createElement("section");panel.className="card synvora-ai-panel panel-assembly-reveal is-visible is-assembled";panel.id="synvora-ai-panel";panel.setAttribute("aria-labelledby","synvora-ai-title");
 panel.innerHTML=`<div class="card-head"><div><div class="eyebrow">SYNVORA AI · CROSS-MODULE ASSISTANT</div><h2 id="synvora-ai-title">Ask SYNVORA anything</h2></div><span class="pill">OPENROUTER</span></div>
 <p class="muted">A separate assistant for ECHO, CIVICLENS, Intent Navigation, FORMGENIUS, TERRAIN AI, live object detection and CORE. It can explain available results and suggest supported interface actions. It does not invent live map data or certify safety.</p>
 <div id="synvora-ai-log" class="ai-chat-log" aria-live="polite"><div class="ai-message">Configure OpenRouter in the top-right ☷ settings, then ask a question about any SYNVORA module. Example: “Summarise the nearest-place search results and explain what the map shows.”</div></div>
 <form id="synvora-ai-form"><label for="synvora-ai-query">Message SYNVORA AI</label><textarea id="synvora-ai-query" maxlength="1800" placeholder="Ask about your results, explain a feature, or request help navigating SYNVORA…"></textarea>
 <label class="ai-check"><input id="synvora-ai-include-text" type="checkbox"><span>Allow this request to include visible OCR text and FORMGENIUS document text (up to 5,000 characters each). Leave off for private documents.</span></label>
 <div class="ai-row"><button class="primary" id="synvora-ai-send" type="submit">Send to SYNVORA AI</button><button id="synvora-ai-apply" type="button" disabled>Apply suggested actions</button><button id="synvora-ai-clear-chat" type="button">Clear chat</button></div></form>
 <div id="synvora-ai-actions" class="ai-actions"></div><p class="ai-status" id="synvora-ai-status" role="status" aria-live="polite">Waiting for OpenRouter configuration.</p>
 <p class="ai-note">Your prompt and the selected module summaries are sent to OpenRouter when you press Send. Precise GPS coordinates, camera frames, microphone audio, emergency contacts, private reports and uploaded files are not sent. OCR/document text is included only when you opt in. AI actions are suggestions; review and apply them yourself. GPS, cameras, emergency messages, saving reports, submitting forms and deleting data always require direct user action.</p>`;
 main.append(panel);
 const saved=config();if(saved){$("synvora-ai-key").value=saved.key||"";$("synvora-ai-model").value=saved.model||"openrouter/free";configStatus("Saved configuration found on this device. Test it before chatting.");chatStatus("OpenRouter configuration is saved on this device.");}
 $("synvora-ai-test").addEventListener("click",testConfig);$("synvora-ai-save").addEventListener("click",saveConfig);$("synvora-ai-clear").addEventListener("click",clearConfig);
 $("synvora-ai-form").addEventListener("submit",ask);$("synvora-ai-apply").addEventListener("click",applyActions);$("synvora-ai-clear-chat").addEventListener("click",()=>{$("synvora-ai-log").replaceChildren();S.actions=[];renderActions();chatStatus("Chat cleared on this device.")});
}
function draft(){return {key:$("synvora-ai-key")?.value.trim()||"",model:$("synvora-ai-model")?.value.trim()||"openrouter/free"}}
function valid(c){if(!c.key||!/^sk-or-v1-[A-Za-z0-9_-]{20,}$/.test(c.key))throw Error("Enter an OpenRouter key beginning with sk-or-v1-.");if(!c.model||c.model.length>180)throw Error("Enter a valid model ID.");return c}
async function request(c,messages,maxTokens=700){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
 try{
  const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+c.key,"Content-Type":"application/json","HTTP-Referer":"https://anuveytq-sys.github.io/SYNVORA/","X-Title":"SYNVORA ECHO"},body:JSON.stringify({model:c.model,messages,temperature:.2,max_tokens:maxTokens}),signal:controller.signal});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){const detail=d.error?.message||d.message||("HTTP "+r.status);const code=d.error?.code?(" · code "+d.error.code):"";throw Error("OpenRouter "+detail+code)}
  return d;
 }catch(error){if(error.name==="AbortError")throw Error("Request timed out after 45 seconds. Try again or select another available model.");throw error}
 finally{clearTimeout(timer)}
}
function responseText(data){
 const content=data?.choices?.[0]?.message?.content;
 if(typeof content==="string")return content.trim();
 if(Array.isArray(content))return content.map(part=>typeof part==="string"?part:part?.text||"").join("\n").trim();
 return "";
}
async function testConfig(){try{const c=valid(draft());configStatus("Testing API key and model…");const d=await request(c,[{role:"user",content:"Reply with exactly: SYNVORA CONNECTION OK"}],24);const answer=responseText(d);if(!answer)throw Error("The model returned no text. Check that the selected model supports chat completions, or choose another available free model.");S.config=c;configStatus("Connection successful · "+c.model+" · "+String(answer).slice(0,90));chatStatus("OpenRouter test succeeded. Save the configuration to use the assistant.");}catch(e){configStatus("Test failed: "+e.message+" Check the key, model availability and internet connection.")}}
function saveConfig(){try{const c=valid(draft());localStorage.setItem(KEY,JSON.stringify(c));S.config=c;configStatus("Configuration saved on this device. The API key is not stored in GitHub.");chatStatus("Ready · "+c.model)}catch(e){configStatus("Could not save: "+e.message)}}
function clearConfig(){localStorage.removeItem(KEY);S.config=null;$("synvora-ai-key").value="";$("synvora-ai-model").value="openrouter/free";configStatus("Saved API key removed from this browser.");chatStatus("OpenRouter configuration cleared.")}
const val=id=>($(id)?.innerText||"").trim().slice(0,1400);
function context(){
 const include=$("synvora-ai-include-text")?.checked;
 return {app:"SYNVORA ECHO accessibility and civic-information workspace",modules:{
 ECHO:{state:val("input-state"),model:val("model-status"),detections:val("detections"),sceneSummary:val("scene-summary"),ocrText:include?val("ocr-output").slice(0,5000):"Not shared"},
 CIVICLENS:{state:val("civic-status"),mappedFeatureCount:val("civic-count"),visibleResults:val("civic-results"),publicMappedResults:val("civic-results"),filters:[...document.querySelectorAll("[data-civic-filter]")].map(x=>x.dataset.civicFilter+":"+(x.checked?"on":"off"))},
 INTENT_NAVIGATION:{query:$("journey-query")?.value||"",status:val("journey-status"),result:val("journey-result")},
 FORMGENIUS:{state:val("fg-status"),pages:val("fg-pages"),reviewProgress:val("fg-completion"),serviceCategory:$("fg-service")?.value||"unknown",documentText:include?val("fg-text").slice(0,5000):"Not shared"},
 TERRAIN_AI:{state:val("terrain-status"),variation:val("terrain-variation"),regions:val("terrain-regions"),findings:val("terrain-findings")},
 SURFACE_VISION:{state:val("surface-vision-status"),findings:val("surface-vision-findings")},
 LIVE_OBJECT_CAMERA:{state:val("route-status"),observations:val("route-observations")},
 CORE:{state:val("core-state"),summary:val("core-output")}
 },safety:"OpenStreetMap data may be incomplete. AI and visual detections can be wrong. No output certifies route safety, accessibility, medical status, legal eligibility or current conditions. Never invent results or claim actions were completed."};
}
const scrollTargets=["synvora-core","echo","civiclens","journey-title","terrain-ai","live-route","formgenius","synvora-ai-panel","settings-panel"];
const clickTargets=["run-ocr","terrain-analyze","fg-analyze","civic-refresh"];
const fillTargets=["journey-query","civic-search","core-query"];
const setTargets=["reduce-motion","keyboard-mode","core-contrast","core-simple"];
function parse(raw){try{return JSON.parse(raw)}catch{const m=raw.match(/\{[\s\S]*\}/);if(m)try{return JSON.parse(m[0])}catch{}}return {reply:raw,actions:[]}}
function normalize(actions){return actions.map(a=>{if(!a||typeof a!=="object")return null;const t=String(a.target||"");if(a.type==="scroll"&&scrollTargets.includes(t))return {type:"scroll",target:t,label:"Open "+t.replaceAll("-"," ")};if(a.type==="click"&&clickTargets.includes(t)&&$(t))return {type:"click",target:t,label:"Run "+t.replaceAll("-"," ")};if(a.type==="fill"&&fillTargets.includes(t)&&$(t))return {type:"fill",target:t,value:String(a.value||"").slice(0,180),label:"Fill "+t.replaceAll("-"," ")};if(a.type==="set"&&setTargets.includes(t)&&$(t)){const el=$(t);return {type:"set",target:t,value:el.type==="checkbox"?!!a.value:String(a.value).slice(0,40),label:"Change "+t.replaceAll("-"," ")}}return null}).filter(Boolean).slice(0,4)}
async function ask(e){e.preventDefault();if(S.busy)return;const q=$("synvora-ai-query").value.trim();if(!q)return;const c=config();if(!c){chatStatus("Open top-right ☷ settings, add your OpenRouter key, test it and save.");return}S.busy=true;$("synvora-ai-send").disabled=true;addMessage("user",q);chatStatus("SYNVORA AI is reading the selected module summaries…");
 const system=`You are SYNVORA AI, the cross-module assistant inside an accessibility and civic-information app. Answer using only the supplied live UI summaries and general knowledge. Never invent current place listings, GPS coordinates, routes, OCR, document contents, camera detections, or claim an action has run. Clearly say when information is missing or stale. Return ONLY JSON: {"reply":"helpful concise answer","actions":[...]}. Allowed action objects: {"type":"scroll","target":"synvora-core|echo|civiclens|journey-title|terrain-ai|live-route|formgenius|synvora-ai-panel|settings-panel"}; {"type":"click","target":"run-ocr|terrain-analyze|fg-analyze|civic-refresh"}; {"type":"fill","target":"journey-query|civic-search|core-query","value":"text"}; {"type":"set","target":"reduce-motion|keyboard-mode|core-contrast|core-simple","value":"appropriate setting"}. Suggest up to 3 actions. Do not trigger GPS, camera, microphone, emergency WhatsApp, report save/delete/export, document upload, form submission or any destructive/private action. For nearby searches, fill journey-query with the user's request and tell them to review and press Find & route themselves.`;
 try{const d=await request(c,[{role:"system",content:system},{role:"user",content:"CURRENT SYNVORA MODULE SUMMARIES:\n"+JSON.stringify(context())+"\n\nUSER MESSAGE:\n"+q}],900);const raw=responseText(d);if(!raw)throw Error("The model returned no text. Try another available free model or check OpenRouter model availability.");const parsed=parse(raw);addMessage("assistant",String(parsed.reply||"No answer was returned."));S.actions=normalize(parsed.actions||[]);renderActions();chatStatus("Response received from "+c.model+". Review suggested actions before applying.")}catch(err){chatStatus("AI request failed: "+err.message)}finally{S.busy=false;$("synvora-ai-send").disabled=false}}
function renderActions(){const host=$("synvora-ai-actions");host.replaceChildren();S.actions.forEach(a=>{const row=document.createElement("div");row.className="ai-action";const label=document.createElement("span");label.textContent=a.label;const type=document.createElement("span");type.textContent=a.type.toUpperCase();row.append(label,type);host.append(row)});$("synvora-ai-apply").disabled=!S.actions.length}
function applyActions(){const actions=S.actions.slice();S.actions=[];renderActions();for(const a of actions){const el=$(a.target);if(!el)continue;if(a.type==="scroll")el.scrollIntoView({behavior:document.body.classList.contains("reduce-motion")?"auto":"smooth",block:"center"});else if(a.type==="fill"){el.value=a.value;el.dispatchEvent(new Event("input",{bubbles:true}));}else if(a.type==="click"&&!el.disabled)el.click();else if(a.type==="set"){if(el.type==="checkbox")el.checked=!!a.value;else el.value=a.value;el.dispatchEvent(new Event("change",{bubbles:true}))}}chatStatus("Applied "+actions.length+" reviewed interface action(s). Location, camera, emergency and submission actions were not triggered.")}
function installLocationRecovery(){
 const geo=navigator.geolocation;if(!geo||geo.__synvoraWrapped)return;
 const original=geo.getCurrentPosition.bind(geo);
 try{geo.getCurrentPosition=function(success,error,options={}){let settled=false;const fail=e=>{if(settled)return;if(e?.code===1){settled=true;const message="Browser/iOS denied location permission. Confirm Location Services is on and allow location for the browser, then reload SYNVORA. Open the site directly in Safari or Chrome if using an embedded browser.";if(error)error({code:1,message,PERMISSION_DENIED:1,POSITION_UNAVAILABLE:2,TIMEOUT:3});return}if(e?.code===2||e?.code===3){original(p=>{if(!settled){settled=true;success?.(p)}},e2=>{if(!settled){settled=true;error?.(e2)}},{enableHighAccuracy:false,timeout:22000,maximumAge:180000});return}settled=true;error?.(e)};original(p=>{if(!settled){settled=true;success?.(p)}},fail,{enableHighAccuracy:options.enableHighAccuracy!==false,timeout:Math.max(Number(options.timeout)||15000,18000),maximumAge:Math.max(Number(options.maximumAge)||0,30000)});};geo.__synvoraWrapped=true}catch(e){console.warn("SYNVORA location recovery could not wrap geolocation",e)}
}
function init(){addStyle();mount();installLocationRecovery()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();