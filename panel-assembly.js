(()=>{"use strict";
const reduce=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches||document.body.classList.contains("reduce-motion");
const selectors=".intro,main>.card,main>.work-grid,main .work-grid>.card,main>.assistant-card,main>.profile-card,main .civic-dashboard,main .formgenius-workspace,main .terrain-workspace";
function init(){
 const panels=[...document.querySelectorAll(selectors)].filter((el,i,a)=>a.indexOf(el)===i);
 if(!panels.length)return;
 if(reduce()){panels.forEach(el=>el.classList.add("is-assembled"));return}
 panels.forEach((el,index)=>{
  el.classList.add("panel-assembly-reveal");
  el.style.setProperty("--assembly-delay",Math.min(index%4,3)*65+"ms");
  if(!el.querySelector(":scope > .panel-assembly-cursors")){
   const layer=document.createElement("span");layer.className="panel-assembly-cursors";layer.setAttribute("aria-hidden","true");
   for(let i=1;i<=3;i++){const cursor=document.createElement("span");cursor.className="panel-assembly-cursor";cursor.textContent="NODE 0"+i;layer.append(cursor)}
   el.append(layer);
  }
 });
 if(!("IntersectionObserver"in window)){panels.forEach(el=>el.classList.add("is-assembled"));return}
 const seen=new WeakSet();
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting||seen.has(entry.target))return;
   seen.add(entry.target);
   const el=entry.target;
   el.classList.add("is-assembled","is-assembling");
   el.querySelectorAll(".reveal-panel,.core-reveal,.civic-reveal,.formgenius-reveal,.fg-scroll-reveal,.terrain-reveal").forEach(child=>child.classList.add("is-visible"));
   window.setTimeout(()=>el.classList.remove("is-assembling"),1250);
   observer.unobserve(el);
  });
 },{threshold:.08,rootMargin:"0px 0px -4% 0px"});
 panels.forEach(el=>observer.observe(el));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();