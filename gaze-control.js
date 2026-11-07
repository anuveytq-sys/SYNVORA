(()=>{"use strict";
const $=id=>document.getElementById(id),S={stream:null,landmarker:null,raf:0,lastDetect:0,active:false,blinkSince:0,blinkLatched:false,lastClick:0,lastDwell:0,lastPan:0,lastX:null,lastY:null,calX:.5,calY:.5,targetX:.5,targetY:.5,x:innerWidth/2,y:innerHeight/2,faceLost:0,wasOverMap:false};
const status=(m,b=false)=>{$("gaze-status").textContent=m;$("gaze-state").textContent=b?"ERROR":S.active?"TRACKING":"OFF"},clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),smooth=(a,b,k)=>a+(b-a)*k,video=$("gaze-video"),cursor=$("gaze-cursor");
function ratioX(p,a,b){return (p.x-Math.min(a.x,b.x))/Math.max(.001,Math.abs(a.x-b.x))}
function ratioY(p,a,b){return (p.y-a.y)/Math.max(.001,Math.abs(b.y-a.y))}
function readFace(lm){
 const nose=lm[1],irisL=lm[468],irisR=lm[473];if(!nose||!irisL||!irisR)return null;
 let x,y;
 if($("gaze-mode").value==="head"){x=clamp((nose.x-lm[234].x)/Math.max(.001,lm[454].x-lm[234].x),0,1);y=clamp((nose.y-lm[10].y)/Math.max(.001,lm[152].y-lm[10].y),0,1)}
 else{x=clamp(1-(ratioX(irisL,lm[33],lm[133])+ratioX(irisR,lm[362],lm[263]))/2,0,1);y=clamp((ratioY(irisL,lm[159],lm[145])+ratioY(irisR,lm[386],lm[374]))/2,0,1)}
 const openness=(a,b,c)=>Math.abs(a.y-b.y)/Math.max(.001,Math.abs(a.x-c.x));
 return{x,y,blink:openness(lm[159],lm[145],lm[33])<.16&&openness(lm[386],lm[374],lm[362])<.16};
}
function moveHover(x,y){const el=document.elementFromPoint(x,y);if(!el)return;el.dispatchEvent(new MouseEvent("mousemove",{bubbles:true,clientX:x,clientY:y,view:window}));cursor.classList.toggle("gaze-actionable",!!el.closest("button,a,input,select,label,[role=button]"))}
function blinkClick(){const now=performance.now();if(now-S.lastClick<1100)return;const el=document.elementFromPoint(S.x,S.y);const target=el?.closest("button,a,input,select,label,[role=button]");if(!target||target.disabled||target.getAttribute("aria-disabled")==="true")return;target.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window,clientX:S.x,clientY:S.y}));S.lastClick=now;status("Blink click activated "+(target.getAttribute("aria-label")||target.textContent.trim().slice(0,32)||"control")+".")}
function edgeAndMap(now,dx,dy){
 const el=document.elementFromPoint(S.x,S.y),mapEl=el?.closest("#civic-map"),map=window.SYNVORA_CIVIC_MAP?.getMap?.();
 if(mapEl&&map&&$("gaze-map").checked&&now-S.lastPan>55){const px=clamp(dx*1.8,-28,28),py=clamp(dy*1.8,-28,28);if(Math.abs(px)+Math.abs(py)>1){map.panBy([-px,-py],{animate:false});S.lastPan=now}S.wasOverMap=true;return}
 S.wasOverMap=false;if(!$("gaze-edge").checked)return;
 const edge=72,top=Math.max(0,edge-S.y),bottom=Math.max(0,S.y-(innerHeight-edge));
 if(top||bottom)window.scrollBy({top:top?-clamp(top/edge*18,2,18):clamp(bottom/edge*18,2,18),behavior:"auto"});
}
function frame(now){if(!S.active)return;
 if(now-S.lastDetect>55&&S.landmarker&&video.readyState>=2){S.lastDetect=now;try{const res=S.landmarker.detectForVideo(video,now),lm=res.faceLandmarks?.[0];if(lm){S.faceLost=0;const p=readFace(lm);if(p){const speed=Number($("gaze-speed").value)/100;S.targetX=clamp(innerWidth*(.5+(p.x-S.calX)*1.65*speed),12,innerWidth-12);S.targetY=clamp(innerHeight*(.5+(p.y-S.calY)*1.65*speed),12,innerHeight-12);if(p.blink&&$("gaze-blink").checked){if(!S.blinkSince)S.blinkSince=now;if(now-S.blinkSince>260&&!S.blinkLatched){blinkClick();S.blinkLatched=true}}else{S.blinkSince=0;S.blinkLatched=false}}}else if(++S.faceLost===12)status("Face not found. Centre your face in the preview and improve lighting.")}catch(e){status("Tracking frame error: "+e.message,true)}}
 S.x=smooth(S.x,S.targetX,.22);S.y=smooth(S.y,S.targetY,.22);cursor.style.transform="translate3d("+S.x+"px,"+S.y+"px,0) translate(-50%,-50%)";moveHover(S.x,S.y);
 const dx=S.lastX==null?0:S.x-S.lastX,dy=S.lastY==null?0:S.y-S.lastY,now2=performance.now();edgeAndMap(now2,dx,dy);
 const edge=S.y<72||S.y>innerHeight-72;
 if($("gaze-dwell").checked&&!edge&&!S.wasOverMap){if(!S.lastDwell)S.lastDwell=now2;if(now2-S.lastDwell>Number($("gaze-dwell-time").value)){window.scrollBy({top:S.y<innerHeight/2?-220:220,behavior:"smooth"});S.lastDwell=now2+900}}else S.lastDwell=0;
 S.lastX=S.x;S.lastY=S.y;S.raf=requestAnimationFrame(frame);
}
async function start(){if(S.active)return;if(!navigator.mediaDevices?.getUserMedia){status("Camera access requires HTTPS and a supported browser.",true);return}$("gaze-start").disabled=true;status("Loading on-device face tracking…");
 try{const vision=await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm");const fileset=await vision.FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");S.landmarker=await vision.FaceLandmarker.createFromOptions(fileset,{baseOptions:{modelAssetPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",delegate:"CPU"},runningMode:"VIDEO",numFaces:1,outputFaceBlendshapes:false,outputFacialTransformationMatrixes:false});S.stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:640},height:{ideal:480},frameRate:{ideal:24,max:30}}});video.srcObject=S.stream;await video.play();S.active=true;$("gaze-start").disabled=true;$("gaze-stop").disabled=false;$("gaze-calibrate").disabled=false;$("gaze-recenter").disabled=false;cursor.hidden=false;status("Tracking active · look at screen centre and press Calibrate centre.");S.raf=requestAnimationFrame(frame)
 }catch(e){stop();status("Could not start head/eye tracking: "+String(e.message||e).slice(0,150),true)}}
function stop(){S.active=false;cancelAnimationFrame(S.raf);S.stream?.getTracks().forEach(t=>t.stop());S.stream=null;video.srcObject=null;try{S.landmarker?.close()}catch{}S.landmarker=null;cursor.hidden=true;$("gaze-start").disabled=false;$("gaze-stop").disabled=true;$("gaze-calibrate").disabled=true;$("gaze-recenter").disabled=true;S.lastX=S.lastY=null;S.blinkSince=0;S.blinkLatched=false;status("Tracking stopped. Camera released.")}
function calibrate(){if(!S.landmarker||video.readyState<2)return;try{const lm=S.landmarker.detectForVideo(video,performance.now()).faceLandmarks?.[0];if(!lm)return status("Face not detected. Look at the centre and retry.",true);const p=readFace(lm);S.calX=p.x;S.calY=p.y;S.targetX=S.x=innerWidth/2;S.targetY=S.y=innerHeight/2;status("Centre calibrated. Move eyes or head gently to move the pointer.")}catch(e){status("Calibration failed: "+e.message,true)}}
$("gaze-start").addEventListener("click",start);$("gaze-stop").addEventListener("click",stop);$("gaze-calibrate").addEventListener("click",calibrate);$("gaze-recenter").addEventListener("click",()=>{S.targetX=S.x=innerWidth/2;S.targetY=S.y=innerHeight/2;status("Pointer re-centred.")});
$("gaze-dwell-time").addEventListener("input",e=>$("gaze-dwell-value").value=(Number(e.target.value)/1000).toFixed(1)+" s");$("gaze-speed").addEventListener("input",e=>$("gaze-speed-value").value=(Number(e.target.value)/100)+"×");$("gaze-mode").addEventListener("change",()=>{if(S.active)calibrate()});
window.addEventListener("pagehide",stop);document.addEventListener("visibilitychange",()=>{if(document.hidden&&S.active)stop()});
})();