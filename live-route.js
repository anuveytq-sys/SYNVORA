(()=>{"use strict";
const $=id=>document.getElementById(id);
const S={stream:null,estimator:null,timer:null,busy:false,lastVoice:0,lastElapsed:0,stopped:false};
const MODEL="onnx-community/depth-anything-v2-small";
const say=(message,bad=false)=>{$("route-status").textContent=message;$("route-state").textContent=bad?"MODEL UNAVAILABLE":S.stream?"DEPTH ANALYSIS":"CAMERA OFF"};
function setModelState(value){$("route-model-state").textContent=value}
function stop(){
 S.stopped=true;if(S.timer)clearTimeout(S.timer);S.timer=null;
 if(S.stream){if(window.SYNVORA_CAMERA)window.SYNVORA_CAMERA.release("route");else S.stream.getTracks().forEach(t=>t.stop())}
 S.stream=null;S.busy=false;$("route-video").srcObject=null;$("route-video").hidden=true;$("route-overlay").hidden=true;$("route-empty").hidden=false;$("route-start").disabled=false;$("route-stop").disabled=true;$("route-state").textContent="CAMERA OFF";$("route-fps").textContent="—";$("route-zones").textContent="—";say("Terrain scan stopped. Camera tracks have been released.");
}
async function loadDepthModel(){
 if(S.estimator)return S.estimator;
 setModelState("DOWNLOADING");say("Loading Depth Anything V2 Small in this browser. First download can be around 95 MB; keep this page open…");
 const lib=await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2");
 if(lib.env){lib.env.allowLocalModels=false;lib.env.useBrowserCache=true}
 const opts={progress_callback:p=>{if(p&&p.status==="progress"&&p.total){const pct=Math.round((p.loaded||0)/p.total*100);say("Downloading terrain model · "+pct+"% · first use only…")}}};
 try{
  S.estimator=await lib.pipeline("depth-estimation",MODEL,{...opts,device:navigator.gpu?"webgpu":"wasm",dtype:navigator.gpu?"fp16":"q8"});
 }catch(firstError){
  if(!navigator.gpu)throw firstError;
  say("GPU setup unavailable; retrying the compatible browser runtime…");
  S.estimator=await lib.pipeline("depth-estimation",MODEL,{...opts,device:"wasm",dtype:"q8"});
 }
 setModelState("READY");return S.estimator;
}
function quantile(sorted,q){return sorted[Math.max(0,Math.min(sorted.length-1,Math.floor((sorted.length-1)*q)))]}
function analyseDepth(depth){
 if(!depth||!depth.data||!depth.width||!depth.height)throw Error("The depth model returned an unsupported frame.");
 const w=depth.width,h=depth.height,data=depth.data,channels=depth.channels||Math.max(1,Math.round(data.length/(w*h)));
 const values=new Float32Array(w*h);
 for(let i=0;i<w*h;i++){let v=0;for(let c=0;c<channels;c++)v+=Number(data[i*channels+c]||0);values[i]=v/channels}
 const sorted=Array.from(values).filter(Number.isFinite).sort((a,b)=>a-b);
 if(sorted.length<100)throw Error("Not enough valid depth values to interpret this frame.");
 const lo=quantile(sorted,.05),hi=quantile(sorted,.95),spread=hi-lo;
 const cols=28,rows=16,grid=new Float32Array(cols*rows),top=.30;
 if(!Number.isFinite(spread)||spread<3)return{cols,rows,top,grid,flags:[],uncertain:true,spread};
 for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){
  const x0=Math.floor(gx*w/cols),x1=Math.max(x0+1,Math.floor((gx+1)*w/cols));
  const y0=Math.floor((top*h)+gy*((1-top)*h)/rows),y1=Math.max(y0+1,Math.floor(top*h+(gy+1)*(1-top)*h/rows));
  let sum=0,n=0;for(let y=y0;y<Math.min(h,y1);y+=2)for(let x=x0;x<Math.min(w,x1);x+=2){sum+=values[y*w+x];n++}
  grid[gy*cols+gx]=n?Math.max(0,Math.min(1,(sum/n-lo)/spread)):0;
 }
 const flags=[];
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const i=y*cols+x,v=grid[i];let jump=0;
  if(x<cols-1)jump=Math.max(jump,Math.abs(v-grid[i+1]));
  if(y<rows-1)jump=Math.max(jump,Math.abs(v-grid[i+cols]));
  if(x>0)jump=Math.max(jump,Math.abs(v-grid[i-1]));
  if(y>0)jump=Math.max(jump,Math.abs(v-grid[i-cols]));
  if(jump>.22)flags.push({x,y,jump});
 }
 return{cols,rows,top,grid,flags,uncertain:false,spread};
}
function draw(result){
 const video=$("route-video"),canvas=$("route-overlay"),ctx=canvas.getContext("2d");
 const w=video.videoWidth,h=video.videoHeight;if(!w||!h)return;
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
 ctx.clearRect(0,0,w,h);const top=Math.round(h*result.top);
 ctx.fillStyle="rgba(30,130,255,.055)";ctx.fillRect(0,top,w,h);
 ctx.strokeStyle="rgba(65,166,255,.22)";ctx.lineWidth=Math.max(1,w/900);
 for(let x=0;x<=result.cols;x++){const px=x*w/result.cols;ctx.beginPath();ctx.moveTo(px,top);ctx.lineTo(px,h);ctx.stroke()}
 for(let y=0;y<=result.rows;y++){const py=top+y*(h-top)/result.rows;ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(w,py);ctx.stroke()}
 ctx.strokeStyle="rgba(70,170,255,.9)";ctx.lineWidth=Math.max(2,w/420);ctx.strokeRect(1,top,w-2,h-top);
 if(result.uncertain){ctx.fillStyle="rgba(255,194,64,.20)";ctx.fillRect(0,top,w,h);ctx.strokeStyle="#ffd166";ctx.lineWidth=2;ctx.strokeRect(3,top+3,w-6,h-top-6);ctx.fillStyle="#fff1c2";ctx.font=Math.max(13,w/42)+"px system-ui";ctx.fillText("LOW VISUAL CERTAINTY",12,top+26);return}
 result.flags.forEach(f=>{const cw=w/result.cols,ch=(h-top)/result.rows,x=f.x*cw,y=top+f.y*ch;ctx.fillStyle="rgba(255,65,91,.28)";ctx.fillRect(x,y,cw,ch);ctx.strokeStyle="rgba(255,75,98,.96)";ctx.lineWidth=Math.max(2,w/500);ctx.strokeRect(x+1,y+1,cw-2,ch-2)});
 ctx.fillStyle="#d8efff";ctx.font=Math.max(12,w/48)+"px system-ui";ctx.fillText("RELATIVE DEPTH REVIEW · NOT A WALKING LINE",12,Math.max(18,top-10));
}
function render(result){
 const list=$("route-observations");list.replaceChildren();
 const rows=[];
 if(result.uncertain)rows.push("Depth output has too little variation to interpret reliably. Treat this frame as uncertain.");
 else if(result.flags.length)rows.push("Possible abrupt relative-depth changes flagged in "+result.flags.length+" image regions. These may be object boundaries, shadows or terrain changes; they are not confirmed drop-offs.");
 else rows.push("No strong relative-depth discontinuity was flagged in this frame. This does not mean the ground is clear or safe.");
 rows.push("Blue overlay = camera analysis field only. It is not a suggested route or foothold.");
 rows.push("Single-camera relative depth cannot verify surface grip, rock stability, holes, slope safety or load-bearing strength.");
 rows.forEach(t=>{const li=document.createElement("li");li.textContent=t;list.appendChild(li)});
 $("route-zones").textContent=result.uncertain?"UNCERTAIN":String(result.flags.length);
}
function voice(result){
 if(!$("route-voice").checked||!window.speechSynthesis||Date.now()-S.lastVoice<8000)return;
 let message=result.uncertain?"Terrain depth view is uncertain. Pause and assess directly.":result.flags.length?"Possible visual depth changes detected. Pause and inspect the terrain directly.":"No strong depth change flagged. This is not a safety confirmation.";
 S.lastVoice=Date.now();speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(message));
}
async function scan(){
 if(!S.stream||S.busy||S.stopped)return;const video=$("route-video");if(video.readyState<2||!video.videoWidth){S.timer=setTimeout(scan,700);return}
 S.busy=true;const began=performance.now();
 try{
  const estimator=await loadDepthModel();
  const scale=Math.min(1,448/video.videoWidth),width=Math.max(224,Math.round(video.videoWidth*scale)),height=Math.max(160,Math.round(video.videoHeight*scale));
  const inputCanvas=document.createElement("canvas");inputCanvas.width=width;inputCanvas.height=height;inputCanvas.getContext("2d",{willReadFrequently:true}).drawImage(video,0,0,width,height);
  const blob=await new Promise(resolve=>inputCanvas.toBlob(resolve,"image/jpeg",.82));if(!blob)throw Error("Could not prepare the camera frame.");
  const {RawImage}=await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2");
  const input=await RawImage.fromBlob(blob);const output=await estimator(input);const result=analyseDepth(output.depth);
  draw(result);render(result);voice(result);
  S.lastElapsed=Math.round(performance.now()-began);$("route-fps").textContent=S.lastElapsed+" ms";
  say("On-device relative-depth analysis active · "+S.lastElapsed+" ms/frame · no camera frames are saved or uploaded.");
 }catch(e){say("Camera preview remains active, but depth analysis is unavailable: "+e.message,true);setModelState("ERROR");}
 finally{S.busy=false;if(S.stream&&!S.stopped){const delay=Math.max(1800,Math.min(5000,S.lastElapsed?S.lastElapsed*1.7:2600));S.timer=setTimeout(scan,delay)}}
}
async function start(){
 if(S.stream)return;if(!navigator.mediaDevices?.getUserMedia){say("Camera access requires HTTPS and a supported browser.",true);return}
 S.stopped=false;$("route-start").disabled=true;say("Requesting camera permission…");
 try{
  const request=window.SYNVORA_CAMERA?window.SYNVORA_CAMERA.acquire("route",{video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:false}):navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1280},height:{ideal:720}},audio:false});
  S.stream=await request;const video=$("route-video");video.srcObject=S.stream;video.muted=true;video.playsInline=true;await video.play();video.hidden=false;$("route-overlay").hidden=false;$("route-empty").hidden=true;$("route-stop").disabled=false;
  say("Camera is active. Loading the on-device depth model; first use requires a large download…");
  scan();
 }catch(e){stop();say("Could not start terrain scan: "+e.message,true)}
}
$("route-start").addEventListener("click",start);$("route-stop").addEventListener("click",stop);
window.addEventListener("synvora:camera-starting",e=>{if(e.detail!=="route"&&S.stream)stop()});
window.addEventListener("pagehide",stop);document.addEventListener("visibilitychange",()=>{if(document.hidden&&S.stream)stop()});
const reveal=$("live-route");if("IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");observer.unobserve(e.target)}}),{threshold:.08});observer.observe(reveal)}else reveal.classList.add("is-visible");setTimeout(()=>reveal.classList.add("is-visible"),2600);
})();