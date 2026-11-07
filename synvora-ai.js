(()=>{"use strict";
const KEY="synvora-openrouter-config-v1", $=id=>document.getElementById(id);
const state={config:null,lastActions:[],busy:false,locationCache:null};
const css=`
.synvora-ai{border:1px solid rgba(87,220,235,.3);border-radius:14px;padding:14px;margin:14px 0;background:linear-gradient(145deg,rgba(7,31,49,.96),rgba(4,15,29,.98));box-shadow:inset 0 0 24px rgba(42,180,205,.05)}
.synvora-ai h3{margin:5px 0 10px}.synvora-ai label{display:grid!important;gap:6px!important;align-items:stretch!important;margin:12px 0 7px!important;font-size:.78rem!important;color:#bfe9f0!important}
.synvora-ai input,.synvora-ai textarea{width:100%;min-width:0;padding:10px;border-radius:9px;border:1px solid #365d75;background:#041321;color:#effcff}
.synvora-ai textarea{min-height:72px;resize:vertical}.synvora-ai .ai-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.synvora-ai button{font-size:.76rem}
.synvora-ai .ai-status{min-height:32px;padding:8px 10px;border:1px solid rgba(100,228,232,.17);border-radius:8px;background:#03111e;color:#a9eff0;font-size:.75rem;white-space:pre-wrap}
.synvora-ai .ai-chat-log{display:grid;gap:9px;max-height:290px;overflow:auto;margin:12px 0}
.synvora-ai .ai-message{padding:10px;border:1px solid rgba(100,228,232,.15);border-radius:9px;background:rgba(5,20,34,.8);font-size:.8rem;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.synvora-ai .ai-message.user{border-color:rgba(110,180,255,.3)}.synvora-ai .ai-actions{display:grid;gap:8px;margin-top:10px}
.synvora-ai .ai-action{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px;border:1px solid rgba(100,228,232,.16);border-radius:8px;font-size:.75rem}
.synvora-ai .ai-note{font-size:.69rem;line-height:1.45;color:#91aebe}
`;
function addStyle(){if($("synvora-ai-style"))return;const s=document.createElement("style");s.id="synvora-ai-style";s.textContent=css;document.head.append(s)}
function readConfig(){try{const c=JSON.parse(localStorage.getItem(KEY)||"null");return c&&typeof c==="object"?c:null}catch{return null}}
function status(message){const el=$("synvora-ai-status");if(el)el.textContent=message}
function addMessage(role,message){const log=$("synvora-ai-log");if(!log)return;const item=document.createElement("div");item.className="ai-message "+role;item.textContent=message;log.append(item);log.scrollTop=log.scrollHeight}
function mount(){
 const panel=$("settings-panel");if(!panel||$("synvora-ai"))return;
 const section=document.createElement("section");section.className="control-section synvora-ai";section.id="synvora-ai";
 section.innerHTML=`<div class="eyebrow">SYNVORA INTELLIGENCE · OPTIONAL CLOUD AI</div><h3>OpenRouter AI backend</h3>
 <p class="ai-note">Connect your own OpenRouter key. Choose a model marked :free or use the openrouter/free router. Your key is saved only in this browser; anyone with access to this device/browser profile may be able to use it. Never paste a password or payment details.</p>
 <label for="synvora-ai-key">OpenRouter API key</label><input id="synvora-ai-key" type="password" autocomplete="off" placeholder="sk-or-v1-…">
 <label for="synvora-ai-model">Model ID</label><input id="synvora-ai-model" list="synvora-ai-models" value="openrouter/free" placeholder="provider/model:free"><datalist id="synvora-ai-models"><option value="openrouter/free"><option value="meta-llama/llama-3.3-70b-instruct:free"><option value="google/gemma-3-27b-it:free"></datalist>
 <div class="ai-row"><button type="button" class="primary" id="synvora-ai-test">Test configuration</button><button type="button" id="synvora-ai-save">Save configuration</button><button type="button" id="synvora-ai-clear">Clear key</button></div>
 <p class="ai-status" id="synvora-ai-status" role="status" aria-live="polite">Not connected. Add a key, test it, then save.</p>
 <div class="eyebrow" style="margin-top:18px">ECHO · CIVICLENS · FORMGENIUS · TERRAIN AI · CORE</div>
 <div id="synvora-ai-log" class="ai-chat-log" aria-live="polite"><div class="ai-message">Ask SYNVORA to explain the current workspace, summarize available module status, or suggest a supported action.</div></div>
 <form id="synvora-ai-form"><label for="synvora-ai-query">Ask SYNVORA AI</label><textarea id="synvora-ai-query" maxlength="1800" placeholder="Example: Explain my current results and open the document workspace."></textarea><div class="ai-row"><button class="primary" id="synvora-ai-send" type="submit">Ask AI</button><button id="synvora-ai-apply" type="button" disabled>Apply suggested actions</button></div></form>
 <div id="synvora-ai-actions" class="ai-actions"></div>
 <p class="ai-note">AI can read non-sensitive status summaries and suggest navigation, local analysis and display-setting actions. It cannot silently start cameras/microphones, request GPS, send emergency messages, submit forms, delete data, or certify routes and hazards. Review actions before applying. OpenRouter requests send your prompt and the listed module summaries to OpenRouter.</p>`;
 panel.insertBefore(section,panel.children[1]||null);
 const c=readConfig();if(c){$("synvora-ai-key").value=c.key||"";$("synvora-ai-model").value=c.model||"openrouter/free";status("Saved configuration found on this device. Test it before chatting.");}
 $("synvora-ai-test").addEventListener("click",testConfig);
 $("synvora-ai-save").addEventListener("click",saveConfig);
 $("synvora-ai-clear").addEventListener("click",clearConfig);
 $("synvora-ai-form").addEventListener("submit",ask);
 $("synvora-ai-apply").addEventListener("click",applyActions);
}
function getDraft(){return {key:$("synvora-ai-key")?.value.trim()||"",model:$("synvora-ai-model")?.value.trim()||"openrouter/free"}}
function valid(c){if(!c.key||!/^sk-or-v1-[A-Za-z0-9_-]{20,}$/.test(c.key))throw Error("Enter a valid-looking OpenRouter key beginning with sk-or-v1-.");if(!c.model||c.model.length>180)throw Error("Enter a valid model ID.");return c}
async function request(path,options={}){const c=valid(state.config||getDraft());const r=await fetch("https://openrouter.ai/api/v1/"+path,{...options,headers:{"Authorization":"Bearer "+c.key,"Content-Type":"application/json","HTTP-Referer":"https://anuveytq-sys.github.io/SYNVORA/","X-Title":"SYNVORA ECHO",...(options.headers||{})},signal:AbortSignal.timeout(45000)});const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error?.message||data.message||("OpenRouter returned HTTP "+r.status));return data}
async function testConfig(){try{state.config=valid(getDraft());status("Testing API key and model with a minimal request…");const data=await request("chat/completions",{method:"POST",body:JSON.stringify({model:state.config.model,messages:[{role:"user",content:"Reply with exactly: SYNVORA CONNECTION OK"}],max_tokens:24,temperature:0})});const reply=data.choices?.[0]?.message?.content;if(!reply)throw Error("The model returned an empty response. Try another :free model.");status("Connection successful · "+state.config.model+" · "+String(reply).slice(0,100));}catch(e){status("Test failed: "+e.message+" Check the key, model availability and internet connection.");}}
function saveConfig(){try{const c=valid(getDraft());localStorage.setItem(KEY,JSON.stringify(c));state.config=c;status("Configuration saved on this device. The API key is not stored in the repository.");}catch(e){status("Could not save: "+e.message)}}
function clearConfig(){localStorage.removeItem(KEY);state.config=null;$("synvora-ai-key").value="";$("synvora-ai-model").value="openrouter/free";status("Saved key removed from this browser.");}
function moduleContext(){
 const val=id=>($(id)?.innerText||"").trim().slice(0,650);
 const checks=[...document.querySelectorAll("[data-civic-filter]")].map(x=>x.dataset.civicFilter+":"+(x.checked?"on":"off"));
 return {
  app:"SYNVORA ECHO accessibility workspace",
  modules:{
   ECHO:{state:val("input-state"),detections:val("detections"),sceneSummary:val("scene-summary"),ocrAvailable:!!val("ocr-output")&&!/Extracted text will appear/i.test(val("ocr-output"))},
   CIVICLENS:{state:val("civic-status"),mappedFeatureCount:val("civic-count"),filters:checks,journeySummary:val("journey-result")},
   FORMGENIUS:{state:val("fg-status"),pages:val("fg-pages"),reviewProgress:val("fg-completion"),serviceCategory:$("fg-service")?.value||"unknown"},
   TERRAIN_AI:{state:val("terrain-status"),variation:val("terrain-variation"),regions:val("terrain-regions")},
   CORE:{state:val("core-state"),summary:val("core-output")}
  },
  limits:"Community map data can be incomplete. Visual models can be wrong. No output certifies safety, accessibility, medical status, legal eligibility or route conditions."
 };
}
const scrollTargets=["synvora-core","echo","civiclens","journey-title","formgenius","terrain-ai","live-route","settings-panel"];
const clickTargets=["analyze","run-ocr","accessibility-scan","fg-analyze"];
const setTargets=["contrast","reduce-motion","keyboard-mode","profile","language","text-size"];
function parseAnswer(raw){
 let obj=null;try{obj=JSON.parse(raw)}catch{const m=raw.match(/\{[\s\S]*\}/);if(m)try{obj=JSON.parse(m[0])}catch{}}
 if(!obj||typeof obj!=="object")return {reply:raw,actions:[]};
 return {reply:String(obj.reply||obj.answer||"Here is the current SYNVORA workspace summary."),actions:Array.isArray(obj.actions)?obj.actions.slice(0,5):[]};
}
function normalizeActions(actions){
 return actions.map(a=>{if(!a||typeof a!=="object")return null;const target=String(a.target||"");if(a.type==="scroll"&&scrollTargets.includes(target))return {type:"scroll",target,label:"Open "+target.replaceAll("-"," ")};if(a.type==="click"&&clickTargets.includes(target))return {type:"click",target,label:"Run "+target.replaceAll("-"," ")};if(a.type==="set"&&setTargets.includes(target)){const el=$(target);if(!el)return null;let value=a.value;if(el.type==="checkbox")value=!!value;else if(el.tagName==="SELECT"&&![...el.options].some(o=>o.value===String(value)))return null;else if(target==="text-size"&&!["1","1.15","1.3","1.5"].includes(String(value)))return null;return {type:"set",target,value,label:"Set "+target.replaceAll("-"," ")+" to "+String(value)}}return null}).filter(Boolean);
}
async function ask(e){e.preventDefault();if(state.busy)return;const q=$("synvora-ai-query").value.trim();if(!q)return;const config=readConfig();if(!config){status("Add, test and save your OpenRouter configuration first.");return}state.config=config;state.busy=true;$("synvora-ai-send").disabled=true;addMessage("user",q);status("SYNVORA AI is checking the available module summaries…");
 const system="You are SYNVORA AI, an assistant for an accessibility workspace. Use only the supplied module status. Do not claim actions succeeded. Do not invent live location, route, object, OCR or document data. Never claim a route or place is safe. Return ONLY JSON: {\"reply\":\"concise helpful answer\",\"actions\":[...]}. Allowed action objects: {\"type\":\"scroll\",\"target\": one of synvora-core,echo,civiclens,journey-title,formgenius,terrain-ai,live-route,settings-panel}; {\"type\":\"click\",\"target\": one of analyze,run-ocr,accessibility-scan,fg-analyze}; {\"type\":\"set\",\"target\": one of contrast,reduce-motion,keyboard-mode,profile,language,text-size,\"value\":valid setting}. Suggest no more than 3 actions. Do not suggest actions that require unavailable inputs. Cameras, microphones, GPS, emergency messaging, form submission, deleting/exporting data and uploads must always remain direct user actions.";
 try{const data=await request("chat/completions",{method:"POST",body:JSON.stringify({model:config.model,temperature:.2,max_tokens:750,messages:[{role:"system",content:system},{role:"user",content:"WORKSPACE STATUS (privacy-filtered):\n"+JSON.stringify(moduleContext())+"\n\nUSER REQUEST:\n"+q}]})});const raw=data.choices?.[0]?.message?.content;if(!raw)throw Error("The model returned an empty response. Test a different free model.");const parsed=parseAnswer(raw);addMessage("assistant",parsed.reply);state.lastActions=normalizeActions(parsed.actions);renderActions();status("Response received from "+config.model+". Review any suggested actions before applying.");}catch(err){status("AI request failed: "+err.message)}finally{state.busy=false;$("synvora-ai-send").disabled=false}}
function renderActions(){const host=$("synvora-ai-actions");host.replaceChildren();state.lastActions.forEach((a,i)=>{const row=document.createElement("div");row.className="ai-action";const label=document.createElement("span");label.textContent=a.label;const tag=document.createElement("span");tag.textContent=a.type.toUpperCase();row.append(label,tag);host.append(row)});$("synvora-ai-apply").disabled=!state.lastActions.length}
function applyActions(){if(!state.lastActions.length)return;const actions=state.lastActions.slice();state.lastActions=[];$("synvora-ai-apply").disabled=true;for(const a of actions){if(a.type==="scroll")$(a.target)?.scrollIntoView({behavior:document.body.classList.contains("reduce-motion")?"auto":"smooth",block:"start"});else if(a.type==="click"){const el=$(a.target);if(el&&!el.disabled)el.click()}else if(a.type==="set"){const el=$(a.target);if(el){el.value=el.type==="checkbox"?a.value:String(a.value);if(el.type==="checkbox")el.checked=a.value;el.dispatchEvent(new Event("change",{bubbles:true}))}}}status("Applied "+actions.length+" approved interface action(s). Privacy-sensitive controls were not changed.");}
function installLocationRecovery(){
 const geo=navigator.geolocation;if(!geo||geo.__synvoraWrapped)return;
 const original=geo.getCurrentPosition.bind(geo);
 try{geo.getCurrentPosition=function(success,error,options={}){let settled=false;const fail=e=>{if(settled)return;if(e?.code===1){settled=true;const message="Browser/iOS denied location permission. Confirm Location Services is on and allow location for the browser, then reload SYNVORA. If opened inside another app, open the site directly in Safari or Chrome. You can still search for a place manually.";if(error)error({code:1,message,PERMISSION_DENIED:1,POSITION_UNAVAILABLE:2,TIMEOUT:3});return}if(e?.code===2||e?.code===3){original(p=>{if(!settled){settled=true;state.locationCache=p;success?.(p)}},e2=>{if(!settled){settled=true;error?.(e2)}},{enableHighAccuracy:false,timeout:22000,maximumAge:180000});return}settled=true;error?.(e)};original(p=>{if(!settled){settled=true;state.locationCache=p;success?.(p)}},fail,{enableHighAccuracy:options.enableHighAccuracy!==false,timeout:Math.max(Number(options.timeout)||15000,18000),maximumAge:Math.max(Number(options.maximumAge)||0,30000)});};geo.__synvoraWrapped=true;}catch(e){console.warn("SYNVORA location recovery could not wrap geolocation",e)}
}
function init(){addStyle();mount();installLocationRecovery();window.addEventListener("synvora:location",e=>{if(e.detail?.lat!=null)state.locationCache={coords:{latitude:e.detail.lat,longitude:e.detail.lon,accuracy:e.detail.accuracy||0}}});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();