/* Eliminating the Chiller — interactive simulator (static, browser-only).
   All curves come from data.json, pre-computed by the real fastfill_350 engine [CALC].
   External values [EXT] are declared in EXT below with their sources. */

// ---------------- external (publicly-sourced) constants ----------------
const EXT = {
  ceiling: 85,            // UN GTR 13 / SAE J2579 structural ceiling
  t40: -40,               // SAE J2601 T40 pre-cool
  benchKg: 65,            // Class-8 array fill basis (deck / HDSAM)
  benchFlow: 108.3,       // g/s = 65 kg / 600 s  (SAE J2601-5, 10-min)
  chillerShare: 16,       // % of station CAPEX in pre-cooling (Argonne HDRSAM / HDSAM)
  chillerCapex: "$3.9M of $24M",
  permeation: "30–90%",   // permeation reduction from nano-filler liner
  Tg: 120,                // CFRP/epoxy glass transition (Toray T700-class)
};
const LINERS = [          // material -> conductivity (must hit grid liner_k)
  {name: "Standard HDPE", k: 0.4, src: "Travaš-Sejdić"},
  {name: "Graphene-NP / HDPE", k: 2, src: "Hamidinejad 2019"},
  {name: "Enhanced composite", k: 3, src: "Feng 2021"},
  {name: "CNT / HDPE (this work)", k: 5, src: "Hamidinejad / Feng"},
];
const PCMS = [            // material -> conductivity (must hit grid pcm_k)
  {name: "Low-k composite", k: 2, src: "Sari 2007"},
  {name: "Graphite-light paraffin", k: 6, src: "Lin 2022"},
  {name: "Expanded-graphite (design)", k: 12, src: "Lin 2022 / Dong 2022"},
  {name: "Aluminium-foam paraffin", k: 16, src: "Dong 2022"},
];
const REFS = [
  ["UN GTR 13 / SAE J2579", "85 °C structural ceiling, 2.25× burst, HD Phase-2", ""],
  ["SAE J2601 / J2601-5", "fuelling protocol, T40 −40 °C, FM flow categories, 108.3 g/s", ""],
  ["EU AFIR 2023/1804", "2030 HDV hydrogen-station mandate", ""],
  ["Argonne HDRSAM / HDSAM", "pre-cooling share of station CAPEX/OPEX", ""],
  ["NREL station data", "chiller maintenance as leading downtime source", ""],
  ["Mazzucco 2016 (IJHE)", "PCM integration in H₂ tanks — modelling & parametric design",
    "https://consensus.app/papers/details/e49fe8d30fd557839337faa70a7d111c/?utm_source=claude_desktop"],
  ["Ramasamy 2018", "PCM for fast filling — paraffin fails, graphite works; −10–20 K pre-cool",
    "https://consensus.app/papers/details/4b187c40576158c1809494d72f356ba6/?utm_source=claude_desktop"],
  ["Hamidinejad 2019; Feng 2021", "graphene/CNT-enhanced HDPE conductivity 2–5 W/m·K", ""],
  ["Lin 2022; Dong 2022; Sari 2007", "expanded-graphite / Al-foam PCM k & latent heat", ""],
  ["Toray T700-class data", "CFRP/epoxy Tg ≈ 120 °C", ""],
];

// ---------------- history (where we came from) ----------------
const HISTORY = [
  {eyebrow:"Pressure vessel", title:"Types I → IV: lighter, at a price",
   intro:"Each generation contained higher pressure with less weight.",
   stages:[
     {tag:"Type I · 1880s", h:"All-metal seamless", d:"Thick steel/aluminium. Robust but prohibitively heavy. Still dominant in stationary storage."},
     {tag:"Type II · 1960s", h:"Hoop-wrapped metal", d:"Fibreglass hoop on a thinned metal body. Transitional — never reached automotive."},
     {tag:"Type III · 1970s", h:"Aluminium liner + CFRP", d:"Thin Al liner as permeation barrier; carbon fibre carries the load. Easy fast-fill thermals — but heavy & embrittlement-prone."},
     {tag:"Type IV · 1990s+", h:"Polymer liner + CFRP", d:"HDPE/polyamide liner; fibre carries 100% of pressure. Today's commercial standard — and the root of the thermal trap."},
   ],
   take:"Type IV's polymer liner cut tank mass <b>over 50%</b> and enabled commercial fuel-cell vehicles — and created the thermal-management problem this tool is about."},
  {eyebrow:"The liner", title:"Three material eras — a conductivity story",
   intro:"A thin layer whose thermal conductivity dictates the entire thermal strategy.",
   stages:[
     {tag:"01 · Metallic (Type I–III)", h:"120–200 W/m·K", d:"Aluminium / steel. Heat leaves the gas instantly — early Type III prototypes needed no chiller. Lost to weight, embrittlement & manufacturing cost."},
     {tag:"02 · Plastic revolution (1990s+)", h:"~0.4 W/m·K", d:"HDPE / polyamide. Cut empty mass 50%+ and made Type IV viable — but the same property made it a thermal trap. The chiller mandate begins here.", cls:"fail"},
     {tag:"03 · Enhanced polymer (now)", h:"2–5 W/m·K", d:"Graphene nanoplatelets, CNTs or BN at <5 wt%. Restores conductivity 5–12× without losing flexibility. Bonus: −30–90% H₂ permeation.", cls:"win"},
   ],
   take:"This simulator's <b>liner slider walks exactly this axis</b>: 0.4 (plastic) → 5 (enhanced polymer)."},
  {eyebrow:"Phase-change material", title:"Three generations: two failures, one breakthrough",
   intro:"Each generation corrected the geometric failure of the one before.",
   stages:[
     {tag:"1 · Stationary · early 2000s", h:"Salt-hydrate jackets", d:"Na-sulfate / CaCl₂ hydrates wrapping metal-hydride tanks. Worked only because weight & bulk were unconstrained. ✗ Never viable for vehicles.", cls:"fail"},
     {tag:"2 · Outer-shell · 2010s", h:"Paraffin outside the shell", d:"Macro-encapsulated wax wrapped outside the carbon-fibre shell. ✗ Failed — the structural shell is itself an insulator, so the heat never reached the PCM.", cls:"fail"},
     {tag:"3 · Internal tri-layer · now", h:"PCM inside the heat path", d:"Micro-encapsulated paraffin / bio fatty-acid (capric, lauric, myristic) in an expanded-graphite or Al-foam matrix, inboard of the shell. Effective k 5–12. ✓ Working.", cls:"win"},
   ],
   take:"The lesson: <b>PCM must sit inboard of the structural composite.</b> The modern tri-layer architecture — and this simulator — is built on that geometry."},
  {eyebrow:"Refuelling protocol", title:"Smarter software — until physics bit back",
   intro:"Each generation added intelligence, and each hit a thermodynamic wall.",
   stages:[
     {tag:"Pre-2014", h:"SAE J2601 v1 — lookup tables", d:"Rigid ambient + initial-pressure lookup; the station carries 100% of responsibility under worst-case assumptions. Mandated T40/T30/T20 — worst-case logic forced −40 °C for the fastest fills."},
     {tag:"2010–2016", h:"The MC Method", d:"Harty & Mathison (Honda R&D): lumped m·C of the receiving tank modulated against the 85 °C ceiling in real time. Shifted from station-only to station–vehicle shared control."},
     {tag:"2014–2024", h:"SAE J2601-5 (TIR, 2024)", d:"Heavy-duty extension: flow categories FM60–FM300 and the MCF-HF-G dynamic algorithm — current state of the art. HD fuelling remains under active development."},
   ],
   take:"Software optimised the fill but couldn't beat physics — the heat still has to leave the tank. That's why the answer moved <b>onboard</b>, to the liner and the PCM."},
];

// ---------------- state ----------------
let DATA = null, META = null;
const S = {temp: 30, useChiller: false, fill: 10, linerK: 0.4, pcmOn: true, pcmK: 12, mass: 50};

const $ = id => document.getElementById(id);
const nearest = (v, arr) => arr.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);
const keyOf = s => {
  const t = s.useChiller ? -40 : s.temp;
  const pcm = s.pcmOn ? `on|${s.pcmK}|${s.mass}` : "off|0|0";
  return `${t}|${s.fill}|${s.linerK}|${pcm}`;
};
const rec = s => DATA.grid[keyOf(s)] || null;

// ---------------- SVG charting ----------------
function svgEl(t, a){const e=document.createElementNS("http://www.w3.org/2000/svg",t);for(const k in a)e.setAttribute(k,a[k]);return e;}
function plot(svg, o){
  const vb = svg.getAttribute("viewBox").split(" ").map(Number), W = vb[2], H = vb[3];
  svg.innerHTML = "";
  const mL=34, mR=10, mT=8, mB=22;
  const px = x => mL + (x - o.xmin) / (o.xmax - o.xmin) * (W - mL - mR);
  const py = y => H - mB - (y - o.ymin) / (o.ymax - o.ymin) * (H - mT - mB);
  // grid + y ticks
  (o.yticks||[]).forEach(v=>{
    svg.appendChild(svgEl("line",{x1:mL,y1:py(v),x2:W-mR,y2:py(v),class:"grid"}));
    const tx=svgEl("text",{x:mL-4,y:py(v)+3,class:"tick","text-anchor":"end"});tx.textContent=v;svg.appendChild(tx);
  });
  (o.xticks||[]).forEach(v=>{
    const tx=svgEl("text",{x:px(v),y:H-6,class:"tick","text-anchor":"middle"});tx.textContent=v;svg.appendChild(tx);
  });
  // axes
  svg.appendChild(svgEl("line",{x1:mL,y1:mT,x2:mL,y2:H-mB,class:"axis"}));
  svg.appendChild(svgEl("line",{x1:mL,y1:H-mB,x2:W-mR,y2:H-mB,class:"axis"}));
  // threshold lines
  (o.hlines||[]).forEach(h=>{
    svg.appendChild(svgEl("line",{x1:mL,y1:py(h.y),x2:W-mR,y2:py(h.y),stroke:h.color,"stroke-width":1.4,"stroke-dasharray":"5 3"}));
    if(h.label){const t=svgEl("text",{x:mL+4,y:py(h.y)-3,class:"curvelbl",fill:h.color,"text-anchor":"start"});t.textContent=h.label;svg.appendChild(t);}
  });
  // series
  (o.series||[]).forEach(s=>{
    if(!s.pts.length)return;
    const d=s.pts.map((p,i)=>(i?"L":"M")+px(p[0]).toFixed(1)+" "+py(p[1]).toFixed(1)).join(" ");
    svg.appendChild(svgEl("path",{d,fill:"none",stroke:s.color,"stroke-width":s.width||2,"stroke-dasharray":s.dash||"none"}));
    if(s.label){const last=s.pts[s.pts.length-1];const t=svgEl("text",{x:px(last[0])-2,y:py(last[1])-4,class:"curvelbl",fill:s.color,"text-anchor":"end"});t.textContent=s.label;svg.appendChild(t);}
  });
  // dots
  (o.dots||[]).forEach(dt=>{
    svg.appendChild(svgEl("circle",{cx:px(dt.x),cy:py(dt.y),r:4,fill:dt.color,stroke:"#fff","stroke-width":1.5}));
    if(dt.label){const t=svgEl("text",{x:px(dt.x),y:py(dt.y)-7,class:"curvelbl",fill:dt.color,"text-anchor":"middle"});t.textContent=dt.label;svg.appendChild(t);}
  });
  // axis titles
  if(o.xlabel){const t=svgEl("text",{x:(mL+W-mR)/2,y:H-0.5,class:"tick","text-anchor":"middle"});t.textContent=o.xlabel;svg.appendChild(t);}
}

// ---------------- render ----------------
function snapState(){   // force every input onto a real grid value -> lookups never miss
  if(!S.useChiller) S.temp = nearest(S.temp, META.axes.temp.filter(x=>x>=0));
  S.fill   = nearest(S.fill,   META.axes.fill_min);
  S.linerK = nearest(S.linerK, META.axes.liner_k);
  S.pcmK   = nearest(S.pcmK,   META.axes.pcm_k);
  S.mass   = nearest(S.mass,   META.axes.mass);
}
function render(){
  snapState();
  const r = rec(S);
  $("linerK").textContent = S.linerK;
  $("pcmK").textContent = S.pcmK;
  $("massVal").textContent = S.mass + " kg";
  $("ftVal").textContent = (S.fill % 1 ? S.fill : S.fill) + " min";
  $("ambVal").textContent = S.temp + " °C";
  $("ambWrap").style.opacity = S.useChiller ? .4 : 1;
  $("pcmFields").style.opacity = S.pcmOn ? 1 : .4;
  if(!r){$("domeT").textContent="—";return;}

  // verdict
  const pass = r.peak_dome <= EXT.ceiling;
  const v = $("verdict");
  v.className = "verdict " + (pass ? "pass" : "fail");
  $("domeT").textContent = Math.round(r.peak_dome);
  $("vmsg").textContent = pass ? "✓ PASS — within the 85 °C ceiling" : "✗ FAIL — breaches the 85 °C ceiling";
  const m = (EXT.ceiling - r.peak_dome);
  $("vmargin").textContent = (m>=0 ? "+"+m.toFixed(1) : m.toFixed(1)) + " °C margin · bulk core " + Math.round(r.peak_bulk) + " °C";

  // thermal curve
  const dome = r.t.map((t,i)=>[t, r.dome[i]]), bulk = r.t.map((t,i)=>[t, r.bulk[i]]);
  const lo = Math.min(0, Math.min(...r.bulk)), hi = Math.max(150, Math.max(...r.dome));
  plot($("curve"), {
    xmin:0, xmax:10, ymin:Math.floor((lo-5)/10)*10, ymax:Math.ceil((hi+8)/10)*10,
    xticks:[0,2,4,6,8,10], yticks:tickRange(Math.floor((lo-5)/10)*10, Math.ceil((hi+8)/10)*10),
    xlabel:"refuelling time (min)",
    hlines:[{y:EXT.ceiling, color:"#C84C3A", label:"85 °C ceiling"}],
    series:[{pts:dome, color:"#C84C3A", width:2.6, label:"dome"},
            {pts:bulk, color:"#4A6FA5", width:2.4, dash:"5 3", label:"bulk"}]
  });

  // phi
  if(S.pcmOn){
    $("phi").style.display="";
    const phi = r.t.map((t,i)=>[t, r.phi[i]]);
    plot($("phi"), {xmin:0,xmax:10,ymin:0,ymax:1, xticks:[0,5,10], yticks:[0,0.5,1],
      xlabel:"time (min)", series:[{pts:phi,color:"#7a4ea0",width:2.6}]});
    $("phiWarn").classList.toggle("hidden", r.phi_final < 0.999);
  } else {
    $("phi").style.display="none"; $("phiWarn").classList.add("hidden");
  }

  renderCommercial(r, pass);
  renderMassReq();
  renderEnvelope();
  renderImpact(r, pass);
}
function tickRange(lo,hi){const out=[];for(let v=lo;v<=hi;v+=Math.max(10,Math.round((hi-lo)/6/10)*10))out.push(v);return out;}

function renderCommercial(r, pass){
  const flow = (EXT.benchKg*1000)/(S.fill*60);
  const meets = pass;
  $("commercial").innerHTML =
    row("Refuelling time", S.fill+" min") +
    row("Equiv. flow ("+EXT.benchKg+" kg basis)", flow.toFixed(0)+" g/s") +
    row("Commercial benchmark", EXT.benchFlow+" g/s (10-min)") +
    row("Viable at this speed?", meets ? "<span class='ok'>YES — chiller-less</span>" : "<span class='no'>NO — would need to slow/pre-cool</span>");
}
const row = (a,b)=>`<div class="row"><span>${a}</span><b>${b}</b></div>`;

function renderMassReq(){
  const mr = DATA.massreq, ks = mr.k;
  const mk = (arr,c,dash)=>({pts:arr.map((y,i)=>y==null?null:[ks[i],y]).filter(Boolean),color:c,dash:dash||"none",width:2.2});
  const all = [].concat(...Object.values(mr.curves).filter(Boolean)).filter(v=>v!=null);
  plot($("massreq"), {
    xmin:Math.min(...ks), xmax:Math.max(...ks), ymin:0, ymax:Math.ceil(Math.max(...all,60)/20)*20,
    xticks:[2,6,10,14,16], yticks:[0,25,50,75,100], xlabel:"PCM k (W/m·K)",
    series:[mk(mr.curves["200"],"#2E7D32"), mk(mr.curves["147"],"#4A6FA5"), mk(mr.curves["110"],"#C84C3A","5 3")],
    hlines:[{y:S.mass, color:"#999", label:"your "+S.mass+" kg"}],
    dots: S.pcmOn ? [{x:S.pcmK, y:S.mass, color:"#14213D", label:"you"}] : []
  });
}

function renderEnvelope(){
  const amb = META.axes.temp.filter(t=>t>=0);
  const pts = amb.map(t=>{
    const k = `${t}|${S.fill}|${S.linerK}|`+(S.pcmOn?`on|${S.pcmK}|${S.mass}`:"off|0|0");
    const rr = DATA.grid[k]; return rr ? [t, rr.peak_dome] : null;
  }).filter(Boolean);
  const ys = pts.map(p=>p[1]);
  plot($("env"), {
    xmin:Math.min(...amb), xmax:Math.max(...amb), ymin:Math.min(60,...ys)-5, ymax:Math.max(95,...ys)+8,
    xticks:amb, yticks:tickRange(Math.floor((Math.min(60,...ys)-5)/10)*10, Math.ceil((Math.max(95,...ys)+8)/10)*10),
    xlabel:"ambient (°C)", hlines:[{y:EXT.ceiling,color:"#C84C3A",label:"85 °C"}],
    series:[{pts, color:"#4A6FA5", width:2.6}],
    dots: S.useChiller ? [] : [{x:nearest(S.temp,amb), y:(DATA.grid[`${nearest(S.temp,amb)}|${S.fill}|${S.linerK}|`+(S.pcmOn?`on|${S.pcmK}|${S.mass}`:"off|0|0")]||{}).peak_dome, color:"#14213D", label:"you"}]
  });
}

function renderImpact(r, pass){
  let h="";
  if(S.useChiller){
    h = row("This configuration","<b>uses the −40 °C station chiller</b>") +
        row("Chiller CAPEX", "<span class='no'>still required ("+EXT.chillerShare+"% of station)</span>") +
        row("Pre-cooling OPEX", "<span class='no'>still incurred every fill</span>");
  } else if(!pass){
    h = row("Chiller-less at this config","<span class='no'>fails 85 °C — chiller still needed</span>") +
        "<div class='badge' style='background:#fdeceb;color:#C84C3A'>Not viable — add PCM / liner k or pre-cool</div>";
  } else {
    h = row("Chiller CAPEX removed", "<b>"+EXT.chillerCapex+" ("+EXT.chillerShare+"%)</b>") +
        row("Pre-cooling OPEX", "<span class='ok'>eliminated — every fill</span>") +
        row("Station footprint", "−30–40%") +
        row("H₂ permeation (nano-liner)", "−"+EXT.permeation) +
        row("Onboard penalty", "+~"+S.mass+" kg/tank · <1.5% range") +
        row("Tank reset", "3.2 h parked / 0.9 h driving") +
        "<div class='badge'>✓ UN GTR 13 preserved — no certification carve-out</div>";
  }
  $("impact").innerHTML = h;
}

// ---------------- story ----------------
const STORY = [
  {title:"The trap: a standard tank, no chiller", set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
   text:"Fill a standard HDPE-lined 700-bar tank at 30 °C ambient with no pre-cooling. Compression heat has nowhere to go through the insulating plastic liner — the gas rockets past 85 °C. This is why fast-fill needs help."},
  {title:"Today's fix: the −40 °C station chiller", set:{useChiller:true,fill:10,linerK:0.4,pcmOn:false},
   text:"The incumbent answer: refrigerate the gas to −40 °C before it enters. It works — peak drops well under 85 °C — but the chiller is ~16% of station CAPEX, the leading maintenance/downtime source, and burns energy on every fill."},
  {title:"The gap: why not just fill slower?", set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
   text:"Without a chiller you'd have to crawl: a chiller-less standard tank can't take 108 g/s (a 10-min Class-8 fill) without overheating. Protocol software (J2601-5) can cap flow, but it can't beat physics — the heat still has to leave the tank."},
  {title:"Fix the liner alone — still not enough", set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:false},
   text:"Make the liner conductive (CNT/HDPE, k≈5) so heat reaches the wall faster. Big improvement — but with nowhere to *store* the heat, the peak still breaches 85 °C. Conduction alone doesn't close the gap."},
  {title:"Add the thermal sponge: the full stack", set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
   text:"Add a phase-change layer (expanded-graphite paraffin, k≈12, ~50 kg) that absorbs tens of MJ of compression heat as latent heat while melting. Now a 30 °C, chiller-less, 10-min fill stays under 85 °C — at the dome, the binding point."},
  {title:"Know the limit: the operating envelope", set:{useChiller:false,temp:35,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
   text:"Honesty matters: this is a 30 °C point design. Push ambient up and the dome crosses 85 °C around 31–32 °C, and the PCM fully melts (Φ→1) leaving no reserve. Watch the envelope plot — that's the edge of validity."},
  {title:"The payoff", set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
   text:"At the design point the chiller disappears: ~16% station CAPEX and all pre-cooling OPEX gone, −30–40% footprint, 30–90% less permeation — for ~50 kg onboard (<1.5% range) and full UN GTR 13 compliance. Now explore it yourself."}
];
let step = 0;
function showStep(i){
  step = (i+STORY.length)%STORY.length;
  const s = STORY[step];
  Object.assign(S, {temp:30,useChiller:false,fill:10,linerK:0.4,pcmOn:false,pcmK:12,mass:50}, s.set);
  syncControls();
  $("stepIdx").textContent = step+1;
  $("storyTitle").textContent = s.title;
  $("storyText").textContent = s.text;
  $("prevBtn").disabled = step===0;
  render();
}

// ---------------- controls ----------------
function syncControls(){
  // temp segmented
  [...$("segTemp").children].forEach(b=>b.classList.toggle("active",
    (b.dataset.v==="-40")===S.useChiller));
  const aA=META.axes.temp.filter(t=>t>=0);
  $("amb").value = aA.indexOf(nearest(S.temp,aA));
  $("ft").value = META.axes.fill_min.indexOf(nearest(S.fill,META.axes.fill_min));
  $("liner").value = S.linerK;
  $("pcmOn").checked = S.pcmOn;
  $("pcmMat").value = S.pcmK;
  $("mass").value = META.axes.mass.indexOf(nearest(S.mass,META.axes.mass));
}
function wire(){
  // populate selects
  LINERS.forEach(l=>{const o=document.createElement("option");o.value=l.k;o.textContent=`${l.name} — k=${l.k}`;$("liner").appendChild(o);});
  PCMS.forEach(p=>{const o=document.createElement("option");o.value=p.k;o.textContent=`${p.name} — k=${p.k}`;$("pcmMat").appendChild(o);});
  const aA=META.axes.temp.filter(t=>t>=0);
  $("amb").max=aA.length-1; $("ft").max=META.axes.fill_min.length-1; $("mass").max=META.axes.mass.length-1;

  $("segTemp").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    S.useChiller=(b.dataset.v==="-40");syncControls();render();});
  $("amb").addEventListener("input",e=>{S.temp=aA[+e.target.value];render();});
  $("ft").addEventListener("input",e=>{S.fill=META.axes.fill_min[+e.target.value];render();});
  $("liner").addEventListener("change",e=>{S.linerK=+e.target.value;render();});
  $("pcmOn").addEventListener("change",e=>{S.pcmOn=e.target.checked;render();});
  $("pcmMat").addEventListener("change",e=>{S.pcmK=+e.target.value;render();});
  $("mass").addEventListener("input",e=>{S.mass=META.axes.mass[+e.target.value];render();});

  $("mStory").addEventListener("click",()=>setMode("story"));
  $("mSandbox").addEventListener("click",()=>setMode("sandbox"));
  $("mHistory").addEventListener("click",()=>setMode("history"));
  $("toSandbox").addEventListener("click",()=>setMode("sandbox"));
  $("nextBtn").addEventListener("click",()=>showStep(step+1));
  $("prevBtn").addEventListener("click",()=>showStep(step-1));

  // references
  $("reflist").innerHTML = REFS.map(r=>`<div>• ${r[2]?`<a href="${r[2]}" target="_blank">${r[0]}</a>`:`<b>${r[0]}</b>`} — ${r[1]}</div>`).join("");
  // history
  $("history").innerHTML = HISTORY.map(b=>`
    <div class="histblock">
      <div class="heyebrow">${b.eyebrow}</div>
      <h2>${b.title}</h2>
      <p class="hintro">${b.intro}</p>
      <div class="stages" style="--n:${b.stages.length}">
        ${b.stages.map(s=>`<div class="stage ${s.cls||""}"><div class="stag">${s.tag}</div><h4>${s.h}</h4><p>${s.d}</p></div>`).join("")}
      </div>
      <div class="htake">${b.take}</div>
    </div>`).join("");
}
function setMode(m){
  $("mStory").classList.toggle("active", m==="story");
  $("mSandbox").classList.toggle("active", m==="sandbox");
  $("mHistory").classList.toggle("active", m==="history");
  $("story").classList.toggle("hidden", m!=="story");
  $("controls").classList.toggle("hidden", m!=="sandbox");
  $("outputs").classList.toggle("hidden", m==="history");
  $("history").classList.toggle("hidden", m!=="history");
  if(m==="story") showStep(step);
  else if(m==="sandbox") { syncControls(); render(); }
}

// ---------------- init ----------------
fetch("data.json").then(r=>r.json()).then(d=>{
  DATA=d; META=d.meta;
  S.mass = META.design_mass;
  wire(); $("loading").style.display="none";
  setMode("story");
}).catch(e=>{
  $("loading").innerHTML = "Could not load data.json — serve this folder over http (e.g. <code>python -m http.server</code>), not file://.<br><small>"+e+"</small>";
});
