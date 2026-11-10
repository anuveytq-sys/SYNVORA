(()=>{"use strict";
const $=id=>document.getElementById(id);
const S={
 stream:null,landmarker:null,raf:0,lastDetect:0,active:false,
 closedAt:0,blinkConsumed:false,lastClick:0,lastPan:0,lastX:null,lastY:null,
 headBaseline:null,headSmooth:null,eyeBaseline:null,eyeSmooth:null,
 targetX:innerWidth/2,targetY:innerHeight/2,x:innerWidth/2,y:innerHeight/2,
 faceLost:0,stillSince:0,lastEdge:0,lastDwell:0
};
const video=$("gaze-video"),cursor=$("gaze-cursor");
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,k)=>a+(b-a)*k;
const status=(message,error=false)=>{
 $("gaze-status").textContent=message;
 $("gaze-state").textContent=error?"ERROR":S.active?"TRACKING":"OFF";
};
function blendshape(categories,name){
 const item=categories?.find(category=>category.categoryName===name);
 return item?.score??0;
}
function readFace(landmarks,result){
 const nose=landmarks?.[1];
 if(!nose)return null;
 const leftIris=landmarks[468],rightIris=landmarks[473];
 const eye=leftIris&&rightIris
  ?{x:(leftIris.x+rightIris.x)/2,y:(leftIris.y+rightIris.y)/2}
  :null;
 const categories=result?.faceBlendshapes?.[0]?.categories||[];
 const left=blendshape(categories,"eyeBlinkLeft");
 const right=blendshape(categories,"eyeBlinkRight");
 return{
  head:{x:nose.x,y:nose.y},
  eye,
  bothClosed:(left+right)/2>.38&&Math.min(left,right)>.18
 };
}
function draw(){
 cursor.style.transform="translate3d("+S.x+"px,"+S.y+"px,0) translate(-50%,-50%)";
}
function setPointerFromLandmarks(){
 if(!S.headBaseline||!S.headSmooth)return;
 const sensitivity=Number($("gaze-speed").value)/100;
 let x,y;
 if($("gaze-mode").value==="eye"){
  if(!S.eyeBaseline||!S.eyeSmooth){status("Eye landmarks unavailable. Switch to head mode or recalibrate.");return}
  x=(.5-(S.eyeSmooth.x-S.eyeBaseline.x)*7.0*sensitivity)*innerWidth;
  y=(.5+(S.eyeSmooth.y-S.eyeBaseline.y)*8.0*sensitivity)*innerHeight;
 }else{
  x=(.5-(S.headSmooth.x-S.headBaseline.x)*3.2*sensitivity)*innerWidth;
  y=(.5+(S.headSmooth.y-S.headBaseline.y)*3.2*sensitivity)*innerHeight;
 }
 S.targetX=clamp(x,8,innerWidth-8);
 S.targetY=clamp(y,8,innerHeight-8);
}
function blinkClick(){
 const now=performance.now();
 if(now-S.lastClick<420)return false;
 const elements=document.elementsFromPoint(S.x,S.y);
 let control=null;
 for(const element of elements){
  if(element===cursor||element.closest?.("#gaze-cursor"))continue;
  control=element.closest?.('button,a[href],input[type="button"],input[type="checkbox"],input[type="radio"],input[type="range"],select,summary,[role="button"]');
  if(control)break;
 }
 if(!control||control.disabled||control.getAttribute("aria-disabled")==="true"||control.getAttribute("aria-hidden")==="true")return false;
 if(control.matches('form button[type="submit"],form input[type="submit"],#emergency-save,#emergency-test-location'))return false;
 if(control.closest("form")&&control.matches("button:not([type]),button[type=submit],input[type=submit]"))return false;
 try{
  control.focus?.({preventScroll:true});
  if(control.matches('input[type="range"]')){
   const rect=control.getBoundingClientRect();
   if(rect.width<=0||S.x<rect.left||S.x>rect.right||S.y<rect.top||S.y>rect.bottom)return false;
   const computed=getComputedStyle(control);
   let ratio=clamp((S.x-rect.left)/rect.width,0,1);
   if(computed.direction==="rtl")ratio=1-ratio;
   const min=control.min!==""?Number(control.min):0;
   const max=control.max!==""?Number(control.max):100;
   let value=min+ratio*(max-min);
   if(control.step!=="any"){
    const step=control.step!==""?Number(control.step):1;
    if(Number.isFinite(step)&&step>0)value=min+Math.round((value-min)/step)*step;
   }
   value=clamp(value,min,max);
   const precision=control.step&&control.step!=="any"&&control.step.includes(".")?Math.min(10,control.step.split(".")[1].length):6;
   control.value=String(Number(value.toFixed(precision)));
   control.dispatchEvent(new Event("input",{bubbles:true}));
   control.dispatchEvent(new Event("change",{bubbles:true}));
  }else control.click();
  S.lastClick=now;
  status("Blink click: "+(control.getAttribute("aria-label")||control.textContent?.trim().slice(0,32)||control.id||"control"));
  return true;
 }catch(error){status("Could not activate that control. Try a direct touch or click.",true);return false}
}
function mapPan(now,dx,dy){
 const element=document.elementFromPoint(S.x,S.y);
 const mapElement=element?.closest("#civic-map");
 const map=window.SYNVORA_CIVIC_MAP?.getMap?.();
 if(!mapElement||!map||!$("gaze-map").checked||now-S.lastPan<80||Math.hypot(dx,dy)<2.5)return;
 map.panBy([clamp(dx*1.2,-18,18),clamp(dy*1.2,-18,18)],{animate:false});
 S.lastPan=now;
}
function edgeScroll(now){
 if(!$("gaze-edge").checked)return;
 const edge=46;
 const direction=S.y<edge?"top":S.y>innerHeight-edge?"bottom":null;
 if(!direction||now-S.lastEdge<90)return;
 const amount=clamp((direction==="top"?edge-S.y:S.y-(innerHeight-edge))*.12,1,8);
 window.scrollBy({top:direction==="top"?-amount:amount,behavior:"auto"});
 S.lastEdge=now;
}
function scrollableAtPointer(){
 for(const node of document.elementsFromPoint(S.x,S.y)){
  if(!node||node===cursor)continue;
  let current=node;
  while(current&&current!==document.body){
   if(current instanceof HTMLElement){
    const css=getComputedStyle(current);
    if(/(auto|scroll|overlay)/.test(css.overflowY)&&current.scrollHeight>current.clientHeight+8)return current;
   }
   current=current.parentElement;
  }
 }
 return null;
}
function dwellScroll(now,dx,dy){
 if(!$("gaze-dwell").checked){S.stillSince=0;return}
 if(Math.hypot(dx,dy)>2.2){S.stillSince=0;return}
 if(!S.stillSince){S.stillSince=now;return}
 if(now-S.stillSince<Number($("gaze-dwell-time").value)||now-S.lastDwell<900)return;
 const box=scrollableAtPointer();
 if(box){
  const rect=box.getBoundingClientRect();
  const edge=Math.min(58,Math.max(28,rect.height*.16));
  let direction=0;
  if(S.y<=rect.top+edge&&box.scrollTop>0)direction=-1;
  else if(S.y>=rect.bottom-edge&&box.scrollTop+box.clientHeight<box.scrollHeight-1)direction=1;
  if(direction)box.scrollBy({top:direction*110,behavior:"smooth"});
  else box.scrollBy({top:110,behavior:"smooth"});
  S.lastDwell=now;S.stillSince=now;
 }else S.stillSince=now;
}
function updateBlink(now,closed){
 if(closed&&$("gaze-blink").checked){
  if(!S.closedAt){S.closedAt=now;S.blinkConsumed=false}
  if(now-S.closedAt>=70&&!S.blinkConsumed){
   blinkClick();S.blinkConsumed=true;cursor.classList.add("gaze-actionable");
  }
 }else if(S.closedAt){
  const duration=now-S.closedAt;
  if($("gaze-blink").checked&&!S.blinkConsumed&&duration>=45&&duration<=1100){
   blinkClick();cursor.classList.add("gaze-actionable");
  }
  S.closedAt=0;S.blinkConsumed=false;
 }
}
function frame(now){
 if(!S.active)return;
 if(now-S.lastDetect>=45&&S.landmarker&&video.readyState>=2){
  S.lastDetect=now;
  try{
   const result=S.landmarker.detectForVideo(video,now);
   const landmarks=result.faceLandmarks?.[0];
   if(landmarks){
    S.faceLost=0;
    const sample=readFace(landmarks,result);
    if(sample){
     if(!S.headSmooth)S.headSmooth={...sample.head};
     else{
      S.headSmooth.x=smooth(S.headSmooth.x,sample.head.x,.22);
      S.headSmooth.y=smooth(S.headSmooth.y,sample.head.y,.22);
     }
     if(sample.eye){
      if(!S.eyeSmooth)S.eyeSmooth={...sample.eye};
      else{
       S.eyeSmooth.x=smooth(S.eyeSmooth.x,sample.eye.x,.28);
       S.eyeSmooth.y=smooth(S.eyeSmooth.y,sample.eye.y,.28);
      }
     }
     if(S.headBaseline)setPointerFromLandmarks();
     updateBlink(now,sample.bothClosed);
    }
   }else{
    S.closedAt=0;S.blinkConsumed=false;
    if(++S.faceLost===8)status("Face lost. Re-centre your face in the camera view.");
   }
  }catch(error){status("Tracking frame error: "+String(error?.message||error).slice(0,100),true)}
 }
 if(S.faceLost<8){
  const oldX=S.x,oldY=S.y;
  S.x=smooth(S.x,S.targetX,.34);S.y=smooth(S.y,S.targetY,.34);
  if(Math.hypot(S.x-oldX,S.y-oldY)<.15){S.x=oldX;S.y=oldY}
  draw();
  const dx=S.x-(S.lastX??S.x),dy=S.y-(S.lastY??S.y);
  mapPan(now,dx,dy);edgeScroll(now);dwellScroll(now,dx,dy);
  S.lastX=S.x;S.lastY=S.y;
 }
 S.raf=requestAnimationFrame(frame);
}
async function loadLandmarker(){
 const vision=await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm");
 const files=await vision.FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
 return vision.FaceLandmarker.createFromOptions(files,{
  baseOptions:{
   modelAssetPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
   delegate:"CPU"
  },
  runningMode:"VIDEO",numFaces:1,outputFaceBlendshapes:true,
  minFaceDetectionConfidence:.55,minFacePresenceConfidence:.55,minTrackingConfidence:.55
 });
}
async function start(){
 if(S.active)return;
 if(!navigator.mediaDevices?.getUserMedia){status("Camera access requires HTTPS and a supported browser.",true);return}
 $("gaze-start").disabled=true;status("Requesting camera permission…");
 try{
  S.stream=await navigator.mediaDevices.getUserMedia({
   audio:false,
   video:{facingMode:"user",width:{ideal:640},height:{ideal:480},frameRate:{ideal:24,max:30}}
  });
  video.srcObject=S.stream;await video.play();
  status("Loading COSMOSIM-style face and iris tracking…");
  S.landmarker=await loadLandmarker();
  S.headBaseline=S.headSmooth=S.eyeBaseline=S.eyeSmooth=null;
  S.closedAt=0;S.blinkConsumed=false;S.faceLost=0;S.stillSince=0;S.lastDetect=0;
  S.active=true;
  $("gaze-start").disabled=true;$("gaze-stop").disabled=false;
  $("gaze-calibrate").disabled=false;$("gaze-recenter").disabled=false;
  cursor.hidden=false;cursor.classList.remove("gaze-actionable");
  status("Tracking active. Look at the screen centre and calibrate.");
  S.raf=requestAnimationFrame(frame);
 }catch(error){
  await stop(false);
  $("gaze-start").disabled=false;
  status("Could not start tracking: "+String(error?.message||error).slice(0,140),true);
 }
}
async function stop(showMessage=true){
 S.active=false;cancelAnimationFrame(S.raf);S.raf=0;
 S.stream?.getTracks().forEach(track=>track.stop());S.stream=null;
 video.pause();video.srcObject=null;
 try{S.landmarker?.close()}catch{}
 S.landmarker=null;cursor.hidden=true;cursor.classList.remove("gaze-actionable");
 $("gaze-start").disabled=false;$("gaze-stop").disabled=true;
 $("gaze-calibrate").disabled=true;$("gaze-recenter").disabled=true;
 S.headBaseline=S.headSmooth=S.eyeBaseline=S.eyeSmooth=null;
 S.lastX=S.lastY=null;S.closedAt=0;S.blinkConsumed=false;S.stillSince=0;S.faceLost=0;
 if(showMessage)status("Tracking stopped. Camera released.");
}
function calibrate(){
 if(!S.landmarker||video.readyState<2)return;
 try{
  const result=S.landmarker.detectForVideo(video,performance.now());
  const landmarks=result.faceLandmarks?.[0];
  if(!landmarks)return status("Face not detected. Centre your face and retry.",true);
  const sample=readFace(landmarks,result);
  if(!sample)return status("Face landmarks unavailable. Try again.",true);
  S.headSmooth={...sample.head};S.headBaseline={...sample.head};
  S.eyeSmooth=sample.eye?{...sample.eye}:null;
  S.eyeBaseline=sample.eye?{...sample.eye}:null;
  S.targetX=S.x=innerWidth/2;S.targetY=S.y=innerHeight/2;
  S.lastX=S.lastY=null;S.stillSince=0;draw();
  status("Centre calibrated. Move your head right to move the pointer right.");
 }catch(error){status("Calibration failed: "+String(error?.message||error).slice(0,100),true)}
}
$("gaze-start").addEventListener("click",start);
$("gaze-stop").addEventListener("click",()=>stop());
$("gaze-calibrate").addEventListener("click",calibrate);
$("gaze-recenter").addEventListener("click",()=>{
 S.targetX=S.x=innerWidth/2;S.targetY=S.y=innerHeight/2;
 if(S.headSmooth)S.headBaseline={...S.headSmooth};
 if(S.eyeSmooth)S.eyeBaseline={...S.eyeSmooth};
 S.lastX=S.lastY=null;S.stillSince=0;draw();status("Pointer re-centred and tracking baseline reset.");
});
$("gaze-dwell-time").addEventListener("input",event=>$("gaze-dwell-value").value=(Number(event.target.value)/1000).toFixed(1)+" s");
$("gaze-speed").addEventListener("input",event=>$("gaze-speed-value").value=(Number(event.target.value)/100).toFixed(1)+"×");
$("gaze-mode").addEventListener("change",()=>{
 if(S.active&&S.headSmooth){
  S.headBaseline={...S.headSmooth};
  if(S.eyeSmooth)S.eyeBaseline={...S.eyeSmooth};
  S.targetX=S.x=innerWidth/2;S.targetY=S.y=innerHeight/2;
  S.lastX=S.lastY=null;draw();
  status($("gaze-mode").value==="eye"?"Eye gaze mode. Recalibrated to centre.":"Head mode. Recalibrated to centre.");
 }
});
window.addEventListener("resize",()=>{
 S.targetX=clamp(S.targetX,8,innerWidth-8);S.targetY=clamp(S.targetY,8,innerHeight-8);
 S.x=clamp(S.x,8,innerWidth-8);S.y=clamp(S.y,8,innerHeight-8);draw();
});
window.addEventListener("pagehide",()=>{stop(false)});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&S.active)stop()});
})();