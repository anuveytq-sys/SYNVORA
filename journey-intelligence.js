(()=>{"use strict";
const $=id=>document.getElementById(id),KEY="synvora-emergency-contacts-v1";
const S={contacts:[],routeLayer:null,userMarker:null,accuracyLayer:null,origin:null,busy:false};
const say=m=>{const e=$("journey-status");if(e)e.textContent=m};
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const MAP_WAIT_MS=15000;
const overpass=["https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter","https://overpass.private.coffee/api/interpreter"];
const routeHosts=["https://routing.openstreetmap.de/routed-foot/route/v1/foot/"];
function map(){return window.SYNVORA_CIVIC_MAP?.getMap?.()||null}
async function waitForMap(){const start=Date.now();while(!map()&&Date.now()-start<MAP_WAIT_MS)await new Promise(r=>setTimeout(r,250));if(!map())throw Error("The OpenStreetMap is still loading. Wait a moment and try again.");return map()}
function ensureRouteLayer(){const m=map();if(!m||!window.L)return null;if(!S.routeLayer)S.routeLayer=L.layerGroup().addTo(m);return S.routeLayer}
function setOrigin(lat,lon,accuracy){S.origin={lat,lon,accuracy:accuracy||0};const m=map();if(!m||!window.L)return;if(S.userMarker)m.removeLayer(S.userMarker);S.userMarker=L.circleMarker([lat,lon],{radius:9,color:"#e8fbff",weight:3,fillColor:"#35d9f2",fillOpacity:1}).addTo(m).bindPopup("Your GPS position · accuracy ±"+Math.round(accuracy||0)+" m");if(S.accuracyLayer)m.removeLayer(S.accuracyLayer);S.accuracyLayer=L.circle([lat,lon],{radius:Math.max(accuracy||0,8),color:"#35d9f2",weight:1,fillOpacity:.07}).addTo(m)}
function currentLocation(){return new Promise((resolve,reject)=>{if(!navigator.geolocation)return reject(Error("This browser does not support GPS location."));navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy}),e=>reject(Error(e.code===1?"Location permission is blocked. Allow location access for SYNVORA in browser settings.":e.code===2?"GPS location is unavailable. Move to an open area and retry.":"GPS request timed out. Please retry.")),{enableHighAccuracy:true,timeout:25000,maximumAge:0})})}
function haversine(a,b){const rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon),x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 6371000*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
function facilityIntent(text){const q=text.toLowerCase();const defs=[
{label:"hospital",re:/\b(hospital|hospitals|emergency room|emergency department)\b/,filter:'["amenity"~"^(hospital|clinic)$"]'},
{label:"clinic",re:/\b(clinic|clinics|doctor|doctors|medical centre|medical center)\b/,filter:'["amenity"~"^(clinic|doctors|hospital)$"]'},
{label:"pharmacy",re:/\b(pharmacy|pharmacies|chemist|chemists|medicine shop)\b/,filter:'["amenity"="pharmacy"]'},
{label:"drinking water",re:/\b(drinking water|water point|water refill|water fountain)\b/,filter:'["amenity"="drinking_water"]'},
{label:"toilet",re:/\b(toilet|toilets|restroom|restrooms|washroom|washrooms)\b/,filter:'["amenity"="toilets"]'},
{label:"bus stop",re:/\b(bus stop|bus station|bus stand)\b/,filter:'["highway"="bus_stop"]'},
{label:"railway station",re:/\b(railway|railways|railway station|train station|train|rail station)\b/,filter:'["railway"="station"]'},
{label:"metro station",re:/\b(metro|metro station|subway station)\b/,filter:'["railway"="station"]["station"="subway"]'},
{label:"shelter",re:/\b(shelter|shelters|homeless shelter)\b/,filter:'["amenity"="shelter"]'},
{label:"bench",re:/\b(bench|benches|place to sit|resting place)\b/,filter:'["amenity"="bench"]'},
{label:"pond",re:/\b(pond|ponds)\b/,filter:'["natural"="water"]["water"="pond"]'},
{label:"lake",re:/\b(lake|lakes|reservoir|reservoirs)\b/,filter:'["natural"="water"]'},
{label:"river",re:/\b(river|rivers|stream|streams|canal|canals)\b/,filter:'["waterway"~"^(river|stream|canal)$"]'},
{label:"school",re:/\b(school|schools|college|university)\b/,filter:'["amenity"~"^(school|college|university)$"]'},
{label:"bank",re:/\b(bank|banks|atm|cash machine)\b/,filter:'["amenity"~"^(bank|atm)$"]'},
{label:"police station",re:/\b(police station|police stations|police)\b/,filter:'["amenity"="police"]'},
{label:"fire station",re:/\b(fire station|fire stations)\b/,filter:'["amenity"="fire_station"]'},
{label:"park",re:/\b(park|parks|garden|gardens)\b/,filter:'["leisure"="park"]'},
{label:"restaurant",re:/\b(restaurant|restaurants|cafe|cafes|food)\b/,filter:'["amenity"~"^(restaurant|cafe|fast_food)$"]'},
{label:"supermarket",re:/\b(supermarket|supermarkets|grocery|groceries|market)\b/,filter:'["shop"~"^(supermarket|convenience|grocery)$"]'},
{label:"hotel",re:/\b(hotel|hotels|guest house|lodging)\b/,filter:'["tourism"~"^(hotel|guest_house|hostel)$"]'},
{label:"post office",re:/\b(post office|post offices)\b/,filter:'["amenity"="post_office"]'}
];return defs.find(d=>d.re.test(q))||null}
function box(lat,lon,km=7){const d=km/111.32,dx=d/Math.max(.15,Math.cos(lat*Math.PI/180));return [lon-dx,lat-d,lon+dx,lat+d].join(",")}
async function fetchNearby(intent,origin){
 const radius=15000,filter=intent.filter;
 const q='[out:json][timeout:18];(node(around:'+radius+','+origin.lat+','+origin.lon+')'+filter+';way(around:'+radius+','+origin.lat+','+origin.lon+')'+filter+';relation(around:'+radius+','+origin.lat+','+origin.lon+')'+filter+';);out center tags;';
 const controllers=overpass.map(()=>new AbortController());
 const jobs=overpass.map((endpoint,i)=>(async()=>{
  const timer=setTimeout(()=>controllers[i].abort(),16000);
  try{
   const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8","Accept":"application/json"},body:"data="+encodeURIComponent(q),signal:controllers[i].signal});
   if(!res.ok)throw Error("Map data server returned "+res.status);
   const data=await res.json();if(!Array.isArray(data.elements))throw Error("Unexpected OpenStreetMap response");
   const seen=new Set(),items=[];
   for(const el of data.elements){const p=el.lat!=null?{lat:Number(el.lat),lon:Number(el.lon)}:el.center?{lat:Number(el.center.lat),lon:Number(el.center.lon)}:null;if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lon))continue;const id=el.type+":"+el.id;if(seen.has(id))continue;seen.add(id);const tags=el.tags||{};items.push({lat:p.lat,lon:p.lon,name:tags.name||tags["name:en"]||intent.label,display:[tags.name,tags["addr:street"],tags["addr:city"]].filter(Boolean).join(", "),tags,straight:haversine(origin,p)})}
   if(!items.length)throw Error("No mapped "+intent.label+" records from this mirror");
   return items.sort((a,b)=>a.straight-b.straight);
  }finally{clearTimeout(timer)}
 })());
 try{const found=await Promise.any(jobs);controllers.forEach(x=>x.abort());return found}catch(e){
  const terms=[intent.label,intent.label==="clinic"?"doctors":intent.label==="railway station"?"train station":intent.label];let fallbackError;
  for(const term of [...new Set(terms)])try{
   const url="https://nominatim.openstreetmap.org/search?format=jsonv2&limit=20&addressdetails=1&viewbox="+box(origin.lat,origin.lon,22)+"&bounded=1&q="+encodeURIComponent(term);
   const r=await fetch(url,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(14000)});
   if(!r.ok)throw Error("Nearby place lookup returned "+r.status);
   const rows=await r.json();
   const items=rows.map(x=>({lat:Number(x.lat),lon:Number(x.lon),name:x.name||x.display_name.split(",")[0],display:x.display_name,tags:{},straight:haversine(origin,{lat:Number(x.lat),lon:Number(x.lon)})})).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon)&&x.straight<=24000).sort((a,b)=>a.straight-b.straight);
   if(items.length)return items;
  }catch(e){fallbackError=e}
  if(fallbackError)throw Error("Nearby "+intent.label+" search could not reach OpenStreetMap place search ("+fallbackError.message+"). Try again when the connection is available.");
  return [];
 }
}
async function geocodeDestination(query,origin){const clean=String(query).replace(/\b(please|find|show me|where is|take me to|nearest|closest|nearby|near me)\b/gi," ").replace(/\s+/g," ").trim()||query;const params="format=jsonv2&limit=15&addressdetails=1&viewbox="+box(origin.lat,origin.lon,22)+"&bounded=1&q="+encodeURIComponent(clean);let rows=[];let last;for(const url of ["https://nominatim.openstreetmap.org/search?"+params,"https://nominatim.openstreetmap.org/search?format=jsonv2&limit=15&addressdetails=1&q="+encodeURIComponent(clean)])try{const r=await fetch(url,{headers:{Accept:"application/json"},signal:AbortSignal.timeout(16000)});if(!r.ok)throw Error("Destination search service returned "+r.status);rows=await r.json();if(rows.length)break}catch(e){last=e}if(!rows.length&&last)throw last;return rows.map(x=>({lat:Number(x.lat),lon:Number(x.lon),name:x.name||x.display_name.split(",")[0],display:x.display_name,tags:{},straight:haversine(origin,{lat:Number(x.lat),lon:Number(x.lon)})})).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon)&&x.straight<=30000).sort((a,b)=>a.straight-b.straight)}
async function snapToRoad(origin){
 let last;
 for(const host of routeHosts){
  const nearestHost=host.replace("/route/v1/","/nearest/v1/");
  const url=nearestHost+origin.lon+","+origin.lat+"?number=3";
  try{
   const r=await fetch(url,{signal:AbortSignal.timeout(12000)});
   if(!r.ok)throw Error("Pedestrian road-snap service returned "+r.status);
   const data=await r.json(),wp=(data.waypoints||[]).find(x=>Array.isArray(x.location)&&x.location.length>=2);
   if(data.code!=="Ok"||!wp)throw Error(data.message||"No nearby pedestrian road segment was returned");
   const road={lat:Number(wp.location[1]),lon:Number(wp.location[0])},distance=haversine(origin,road);
   if(!Number.isFinite(road.lat)||!Number.isFinite(road.lon)||distance>1500)throw Error("Nearest pedestrian road is outside the 1.5 km access limit");
   return {...road,distance,name:wp.name||"Nearest mapped pedestrian road",source:"routing-service"};
  }catch(e){last=e}
 }
 // Independent fallback: find actual mapped pedestrian-accessible OSM highway geometry,
 // then project the GPS point onto its nearest segment.
 const q='[out:json][timeout:18];way(around:1800,'+origin.lat+','+origin.lon+')["highway"];out geom;';
 const controllers=overpass.map(()=>new AbortController());
 const jobs=overpass.map((endpoint,i)=>(async()=>{
  const timer=setTimeout(()=>controllers[i].abort(),16000);
  try{
   const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8","Accept":"application/json"},body:"data="+encodeURIComponent(q),signal:controllers[i].signal});
   if(!r.ok)throw Error("Road geometry lookup returned "+r.status);
   const data=await r.json(),ways=Array.isArray(data.elements)?data.elements:[];
   const rad=origin.lat*Math.PI/180,mx=111320*Math.cos(rad),my=111320;
   let best=null;
   for(const way of ways){
    const tags=way.tags||{},h=tags.highway||"";
    if(!Array.isArray(way.geometry)||way.geometry.length<2||/^(motorway|motorway_link|trunk|trunk_link|construction|proposed|raceway|abandoned|platform)$/i.test(h)||/^(no|private)$/i.test(tags.foot||tags.access||""))continue;
    for(let k=1;k<way.geometry.length;k++){
     const p=way.geometry[k-1],z=way.geometry[k],ax=(Number(p.lon)-origin.lon)*mx,ay=(Number(p.lat)-origin.lat)*my,bx=(Number(z.lon)-origin.lon)*mx,by=(Number(z.lat)-origin.lat)*my,dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy;
     if(!Number.isFinite(len)||len<0.01)continue;
     const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/len)),x=ax+t*dx,y=ay+t*dy,distance=Math.hypot(x,y);
     if(!best||distance<best.distance)best={lat:origin.lat+y/my,lon:origin.lon+x/mx,distance,name:tags.name||h+" path",source:"openstreetmap-road-geometry"};
    }
   }
   if(!best)throw Error("No mapped pedestrian-accessible road geometry was found nearby");
   if(best.distance>1500)throw Error("Nearest mapped pedestrian-accessible road is "+fmtDistance(best.distance)+" away");
   return best;
  }finally{clearTimeout(timer)}
 })());
 try{const found=await Promise.any(jobs);controllers.forEach(x=>x.abort());return found}catch(e){throw Error("Could not identify a nearby pedestrian-accessible mapped road. "+(last?.message||"Routing service unavailable.")+" Map fallback: "+(e.errors?.map(x=>x.message).join("; ")||e.message))}
}
function decodePolyline6(str){let i=0,lat=0,lon=0,out=[];while(i<str.length){let result=0,shift=0,b;do{b=str.charCodeAt(i++)-63;result|=(b&31)<<shift;shift+=5}while(b>=32&&i<str.length);lat+=result&1?~(result>>1):result>>1;result=0;shift=0;do{b=str.charCodeAt(i++)-63;result|=(b&31)<<shift;shift+=5}while(b>=32&&i<str.length);lon+=result&1?~(result>>1):result>>1;out.push([lon/1e6,lat/1e6])}return out}
async function routeBetween(a,b){
 let last;
 for(const host of routeHosts){
  const coords=a.lon+","+a.lat+";"+b.lon+","+b.lat,url=host+coords+"?overview=full&geometries=geojson&steps=true&alternatives=true";
  try{const r=await fetch(url,{signal:AbortSignal.timeout(22000)});if(!r.ok)throw Error("OSRM foot router returned "+r.status);const data=await r.json();if(data.code!=="Ok"||!data.routes?.length)throw Error(data.message||"No connected pedestrian route");const routes=data.routes.filter(x=>x.geometry?.coordinates?.length>1&&Number.isFinite(x.distance)&&Number.isFinite(x.duration));if(routes.length)return routes.sort((x,y)=>x.distance-y.distance)}catch(e){last=e}
 }
 // Independent pedestrian-routing engine fallback. Never substitute a driving route or straight line.
 try{
  const r=await fetch("https://valhalla1.openstreetmap.de/route",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json","X-Client-Id":"synvora-accessibility-web-app"},body:JSON.stringify({locations:[{lat:a.lat,lon:a.lon,type:"break"},{lat:b.lat,lon:b.lon,type:"break"}],costing:"pedestrian",units:"kilometers",directions_type:"none",id:"synvora-foot-route"}),signal:AbortSignal.timeout(26000)});
  if(!r.ok)throw Error("Valhalla pedestrian router returned "+r.status);
  const data=await r.json(),trip=data.trip,leg=trip?.legs?.[0],summary=trip?.summary;
  const coordinates=leg?.shape?decodePolyline6(leg.shape):[];
  if(data.error||!coordinates||coordinates.length<2||!Number.isFinite(summary?.length)||!Number.isFinite(summary?.time))throw Error(data.error||data.error_message||"Valhalla returned no connected pedestrian route");
  return [{geometry:{coordinates},distance:summary.length*1000,duration:summary.time,source:"valhalla-pedestrian"}];
 }catch(e){last=Error("OSRM and Valhalla pedestrian routing failed. "+(last?.message||"")+" "+e.message)}
 throw last||Error("No pedestrian route could be calculated")
}
function fmtDistance(m){return m>=1000?(m/1000).toFixed(1)+" km":Math.round(m)+" m"}
function renderRoute(routes,dest,roadOrigin){const m=map(),layer=ensureRouteLayer();if(!m||!layer||!routes.length)throw Error("Map view is not ready. Tap Use my location first.");layer.clearLayers();const colors=["#43e5c2","#ffc857","#b59aff"];routes.slice(0,3).forEach((r,i)=>{const pts=r.geometry.coordinates.map(p=>[p[1],p[0]]);L.polyline(pts,{color:colors[i],weight:i===0?7:4,opacity:i===0?.98:.75,dashArray:i===0?null:"9 9"}).addTo(layer).bindPopup((i===0?"RECOMMENDED PEDESTRIAN ROUTE":"ALTERNATIVE "+i)+" · "+fmtDistance(r.distance)+" · "+Math.round(r.duration/60)+" min")});if(S.origin&&roadOrigin){L.polyline([[S.origin.lat,S.origin.lon],[roadOrigin.lat,roadOrigin.lon]],{color:"#42c9ff",weight:5,opacity:.95,dashArray:"3 9"}).addTo(layer).bindPopup("GPS-to-road access connector · "+fmtDistance(roadOrigin.distance)+" straight-line map connector only; check the actual ground path before walking");L.circleMarker([roadOrigin.lat,roadOrigin.lon],{radius:7,color:"#eafcff",weight:2,fillColor:"#42c9ff",fillOpacity:1}).addTo(layer).bindPopup("Route starts here: nearest mapped routable road")};L.marker([dest.lat,dest.lon]).addTo(layer).bindPopup("<strong>"+esc(dest.name)+"</strong><br>OpenStreetMap destination");if(S.origin)L.circleMarker([S.origin.lat,S.origin.lon],{radius:8,color:"#eafcff",weight:3,fillColor:"#35d9f2",fillOpacity:1}).addTo(layer).bindPopup("Your actual GPS starting location");const bounds=L.featureGroup(layer.getLayers()).getBounds();if(bounds.isValid())m.fitBounds(bounds.pad(.18))}
function showResult(dest,routes){const best=routes[0],min=Math.max(1,Math.round(best.duration/60));$("journey-result").innerHTML="<strong>"+esc(dest.name)+"</strong><span>"+esc(dest.display||dest.name)+"</span><div class='journey-stats'><b>"+fmtDistance(best.distance)+"</b><b>~"+min+" min</b><b>"+routes.length+" route option(s)</b></div><p>Recommended route is the shortest-distance pedestrian route returned by the foot-routing service. Mapped place data can be incomplete; route time and colour do not certify safety or accessibility.</p>";say("Route ready: "+dest.name+" · "+fmtDistance(best.distance)+" · about "+min+" min. Cyan = recommended; amber/purple = alternatives. Please verify surroundings and local conditions.")}
async function askJourney(forcedQuery){
 if(S.busy)return;
 const input=$("journey-query"),q=String(forcedQuery||input.value).trim();
 if(forcedQuery)input.value=q;
 if(!q){say("Type a need such as nearest hospital, pharmacy, drinking water, toilet or a destination.");return}
 S.busy=true;$("journey-find").disabled=true;
 $("journey-result").textContent="Finding nearby mapped places…";
 try{
  say("Getting your current GPS position…");
  const origin=await currentLocation();S.origin=origin;
  await waitForMap();setOrigin(origin.lat,origin.lon,origin.accuracy);
  const m=map();m.setView([origin.lat,origin.lon],16);setTimeout(()=>m.invalidateSize(),100);
  const intent=facilityIntent(q)||facilityIntent(q.replace(/\\b(please|find|show me|where is|take me to|nearest|closest|nearby|near me)\\b/gi," "));
  let candidates;
  if(intent){
   say("Searching OpenStreetMap for nearby "+intent.label+" places…");
   candidates=await fetchNearby(intent,origin).catch(()=>[]);
   if(!candidates.length)throw Error("No mapped "+intent.label+" places were found nearby. Map coverage may be incomplete, or OpenStreetMap search may be temporarily unavailable.");
  }else{
   say("Looking up the destination near your GPS position…");
   const clean=q.replace(/\\b(please|find|show me|where is|take me to|nearest|closest|nearby|near me)\\b/gi," ").replace(/\\s+/g," ").trim()||q;
   candidates=await geocodeDestination(clean,origin);
   if(!candidates.length)throw Error("No matching destination was found nearby. Try a specific place name or locality.");
  }
  candidates=candidates.filter(c=>Number.isFinite(c.lat)&&Number.isFinite(c.lon)).sort((a,b)=>haversine(origin,a)-haversine(origin,b)).slice(0,12);
  if(!candidates.length)throw Error("No mapped places with usable coordinates were returned.");
  const layer=ensureRouteLayer();if(!layer)throw Error("The map view is not ready yet. Wait a moment and try again.");
  layer.clearLayers();
  candidates.forEach((place,i)=>{
   const distance=haversine(origin,place);
   const marker=L.marker([place.lat,place.lon]).addTo(layer).bindPopup("<strong>"+esc(place.name)+"</strong><br>Approx. straight-line distance: "+fmtDistance(distance)+(i===0?"<br>Closest mapped result":""));
   if(i===0)marker.openPopup();
  });
  const nearest=candidates[0],distance=haversine(origin,nearest);
  const bounds=L.featureGroup([S.userMarker,...layer.getLayers()].filter(Boolean)).getBounds();
  if(bounds.isValid())m.fitBounds(bounds.pad(.18));
  $("journey-result").innerHTML="<strong>"+esc(nearest.name)+"</strong><span>"+esc(nearest.display||nearest.name)+"</span><div class='journey-stats'><b>"+fmtDistance(distance)+"</b><b>straight-line</b><b>"+candidates.length+" mapped result(s)</b></div><p>This is a nearby-place result, not a walking route or road distance. SYNVORA's in-app route calculation has been disabled because the public routing services were not returning dependable results. Use a navigation app with live directions before travelling.</p>";
  say("Found "+candidates.length+" mapped result(s). The closest is "+nearest.name+" at approximately "+fmtDistance(distance)+" straight-line distance. No walking route is being claimed.");
 }catch(e){
  say("Nearby place search: "+e.message);
  $("journey-result").textContent="Could not find nearby places. "+e.message;
 }finally{S.busy=false;$("journey-find").disabled=false}
}
function speakQuery(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){say("Voice input is not supported here. Type your request instead.");return}const r=new SR();r.lang=$("language")?.value||"en-US";r.maxAlternatives=1;r.onresult=e=>{$("journey-query").value=e.results[0][0].transcript;askJourney()};r.onerror=()=>say("Voice recognition did not complete. Please type your request.");try{r.start();say("Listening…")}catch{say("Voice input could not start. Type your request instead.")}}
function normalizePhone(v){return String(v||"").replace(/[^0-9]/g,"")}
function readContacts(){try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");S.contacts=Array.isArray(v)?v.slice(0,3):[]}catch{S.contacts=[]}renderContacts()}
function renderContacts(){const host=$("emergency-contact-list");if(!host)return;host.replaceChildren();for(let i=0;i<3;i++){const c=S.contacts[i]||{},row=document.createElement("div");row.className="emergency-contact-row";row.innerHTML='<label>Contact '+(i+1)+' name<input maxlength="50" data-em-name="'+i+'" value="'+esc(c.name||"")+'" placeholder="Trusted contact"></label><label>WhatsApp number<input inputmode="tel" maxlength="20" data-em-phone="'+i+'" value="'+esc(c.phone||"")+'" placeholder="Country code + number"></label>';host.append(row)}}
function saveContacts(){const rows=[];for(let i=0;i<3;i++){const name=document.querySelector("[data-em-name='"+i+"']")?.value.trim()||"",phone=normalizePhone(document.querySelector("[data-em-phone='"+i+"']")?.value);if(name||phone){if(phone.length<8||phone.length>15){$("emergency-settings-status").textContent="Contact "+(i+1)+" needs a valid international WhatsApp number (8–15 digits).";return}rows.push({name,phone})}}S.contacts=rows;localStorage.setItem(KEY,JSON.stringify(rows));renderEmergencyButtons();$("emergency-settings-status").textContent="Saved "+rows.length+" trusted contact(s) on this device only.";renderContacts()}
function messageFor(pos){let msg="EMERGENCY — I may need assistance. Prepared using SYNVORA. Time: "+new Date().toLocaleString()+".";if(pos)msg+=" My current location: https://www.openstreetmap.org/?mlat="+pos.lat+"&mlon="+pos.lon+"#map=18/"+pos.lat+"/"+pos.lon+" (GPS accuracy approximately "+Math.round(pos.accuracy||0)+" m).";else msg+=" GPS coordinates are unavailable. Please contact me.";return msg+" Please reply to confirm you received this."}
async function emergencyTo(i){const c=S.contacts[i];if(!c){$("settings-panel").hidden=false;$("settings-toggle").setAttribute("aria-expanded","true");say("Add a trusted WhatsApp contact in Quick Settings first.");return}const popup=window.open("about:blank","_blank");let pos=null;try{pos=await currentLocation();S.origin=pos;setOrigin(pos.lat,pos.lon,pos.accuracy)}catch{say("GPS unavailable; WhatsApp message will not include coordinates.")}const url="https://wa.me/"+c.phone+"?text="+encodeURIComponent(messageFor(pos));if(popup&&!popup.closed)popup.location.href=url;else{const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener";a.click()}say("WhatsApp opened for "+(c.name||"contact "+(i+1))+". Review the message and tap Send in WhatsApp.")}
function renderEmergencyButtons(){const host=$("emergency-actions");if(!host)return;host.replaceChildren();if(!S.contacts.length){host.textContent="Add trusted contacts in Quick Settings to enable emergency WhatsApp actions.";return}S.contacts.forEach((c,i)=>{const b=document.createElement("button");b.type="button";b.className="emergency-send";b.textContent="WhatsApp "+(c.name||"contact "+(i+1));b.addEventListener("click",()=>emergencyTo(i));host.append(b)})}
$("journey-find").addEventListener("click",askJourney);$("journey-query").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();askJourney()}});$("journey-voice").addEventListener("click",speakQuery);
$("emergency-save").addEventListener("click",saveContacts);$("emergency-test-location").addEventListener("click",async()=>{try{const p=await currentLocation();S.origin=p;await waitForMap();setOrigin(p.lat,p.lon,p.accuracy);$("emergency-settings-status").textContent="GPS fix received (±"+Math.round(p.accuracy)+" m).";map().setView([p.lat,p.lon],17)}catch(e){$("emergency-settings-status").textContent="Location unavailable: "+e.message}});
readContacts();renderEmergencyButtons();
window.addEventListener("synvora:journey-search",e=>{if(e.detail?.query)askJourney(e.detail.query)});
window.addEventListener("synvora:location",e=>{if(e.detail?.lat!=null)setOrigin(e.detail.lat,e.detail.lon,e.detail.accuracy)});
})();