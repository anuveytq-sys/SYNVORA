(()=>{"use strict";
const SELECTORS=[
"main>.intro","main>.core-card","main>.work-grid","main .work-grid>.card",
"main>.assistant-card","main>.profile-card","main>.civic-card",
"main>.civic-dashboard","main>.terrain-card","main>.live-object-card","main>.formgenius-card",
".core-module-grid>.core-module",".core-orchestrator",".core-personalization",".core-shared",
".civic-dashboard-grid>div",".result-block",".civic-report",
".fg-workspace>.fg-pane",".fg-glossary",".fg-guide",
".terrain-results>section"
].join(",");
const pointer=(label)=>'<svg viewBox="0 0 28 34" aria-hidden="true"><path d="M3 2 L3 26 L9 20 L14 31 L19 28 L14 17 L23 17 Z" fill="currentColor" stroke="#07111f" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 2 L23 17" stroke="white" stroke-opacity=".8" stroke-width=".8"/></svg><span class="cursor-tag">'+label+'</span>';
function init(){
 const panels=[...document.querySelectorAll(SELECTORS)].filter((el,i,a)=>a.indexOf(el)===i);
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches||document.body.classList.contains("reduce-motion");
 if(reduced){panels.forEach(el=>el.classList.add("is-assembled"));return}
 if(!("IntersectionObserver"in window)){panels.forEach(el=>el.classList.add("is-assembled"));return}
 panels.forEach((el,i)=>{
  el.classList.add("panel-assembly-reveal");
  el.style.setProperty("--assembly-order",String(i%5));
  if(!el.querySelector(":scope > .panel-assembly-cursors")){
   const layer=document.createElement("span");layer.className="panel-assembly-cursors";layer.setAttribute("aria-hidden","true");
   ["NODE 01 · ALIGN","NODE 02 · DOCK","NODE 03 · LOCK"].forEach(label=>{const cursor=document.createElement("span");cursor.className="panel-assembly-cursor";cursor.innerHTML=pointer(label);layer.append(cursor)});
   el.append(layer);
  }
 });
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   const el=entry.target;observer.unobserve(el);
   // Two frames ensure the unassembled state is painted before the assembly transition starts.
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    el.classList.add("is-assembled");
    el.classList.remove("is-assembling");
    void el.offsetWidth;
    el.classList.add("is-assembling");
    el.querySelectorAll(".reveal-panel,.core-reveal,.civic-reveal,.formgenius-reveal,.fg-scroll-reveal,.terrain-reveal").forEach(child=>child.classList.add("is-visible"));
    window.setTimeout(()=>el.classList.remove("is-assembling"),1650);
   }));
  });
 },{threshold:.04,rootMargin:"0px 0px -7% 0px"});
 panels.forEach(el=>observer.observe(el));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();