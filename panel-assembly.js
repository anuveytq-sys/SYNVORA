(()=>{"use strict";
const TARGETS=[
"main.layout>section",
".work-grid>.card",
".core-module-grid>.core-module",".core-orchestrator",".core-personalization",".core-shared",
".civic-dashboard-grid>*",".civic-results>*",".civic-report",
".terrain-results>section",".terrain-metrics>div",
".fg-workspace>.fg-pane",".fg-glossary",".fg-guide",
".result-block"
].join(",");
const labels=["NODE 01 · ALIGN","NODE 02 · DOCK","NODE 03 · LOCK"];
function cursorMarkup(){return '<svg viewBox="0 0 28 34" aria-hidden="true"><path d="M3 2 L3 26 L9 20 L14 31 L19 28 L14 17 L23 17 Z" fill="currentColor" stroke="#07111f" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 2 L23 17" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/></svg>'}
function loadAI(){if(document.querySelector('script[data-synvora-ai]'))return;const s=document.createElement("script");s.src="./synvora-ai.js?v=ai-main-panel-r2";s.async=true;s.dataset.synvoraAi="true";document.head.append(s)}
function init(){
 const panels=[...new Set(document.querySelectorAll(TARGETS))];
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches||document.body.classList.contains("reduce-motion");
 panels.forEach((el,i)=>{
  el.classList.add("panel-assembly-reveal");
  el.style.setProperty("--assembly-order",String(i%4));
  if(!el.querySelector(":scope > .panel-assembly-cursors")){
   const layer=document.createElement("span");layer.className="panel-assembly-cursors";layer.setAttribute("aria-hidden","true");
   labels.forEach(label=>{const c=document.createElement("span");c.className="panel-assembly-cursor";c.innerHTML=cursorMarkup()+'<span class="cursor-tag">'+label+'</span>';layer.append(c)});
   el.append(layer);
  }
 });
 function reveal(el){
  if(el.dataset.assemblyPlayed==="yes")return;
  el.dataset.assemblyPlayed="yes";
  el.classList.add("is-visible","is-assembled");
  if(reduced)return;
  el.classList.remove("is-assembling");void el.offsetWidth;
  requestAnimationFrame(()=>{el.classList.add("is-assembling");window.setTimeout(()=>el.classList.remove("is-assembling"),1800)});
 }
 if(!("IntersectionObserver"in window)){panels.forEach(reveal);loadAI();return}
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){observer.unobserve(entry.target);reveal(entry.target)}});
 },{threshold:0.01,rootMargin:"0px 0px -2% 0px"});
 panels.forEach(el=>observer.observe(el));
 loadAI();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();