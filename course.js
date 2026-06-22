/* course.js — "Eliminating the Chiller" expert course.
   Fundamentals -> expert. Defines the global LESSONS array consumed by app.js (loaded after this).
   Block conventions used inside body HTML:
     <div class="eqn">...</div>        equation
     <div class="example">...</div>    worked example
     <div class="litnote">...</div>    from the literature
     <div class="defends">...</div>    "you can now answer" callout
   Optional per-lesson: check {q, opts:[{t,ok}], reveal}
*/
const LESSONS = [
// ===================== PART A — THERMODYNAMIC FOUNDATIONS =====================
{ch:"A · Thermo foundations", title:"The tank is an open system",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>Filling a tank is not a closed box — mass crosses the boundary. So we track a <b>control volume</b>: its internal energy <i>U</i> changes as gas flows in carrying <b>enthalpy</b> (internal energy + flow work, <i>h = u + Pv</i>), minus heat leaving through the wall.</p>
 <div class="eqn"><span class="frac"><span>d<i>U</i></span><span>d<i>t</i></span></span> = <i>ṁ</i> <i>h</i><sub>in</sub> − <i>Q̇</i><sub>wall</sub></div>
 <p>Incoming gas dumps <i>enthalpy</i> (not just internal energy) — the extra <i>Pv</i> "flow work" is a big part of why tanks heat on filling.</p>
 <div class="example"><b>Intuition.</b> Push gas from a 900-bar bank into a 700-bar tank: it arrives with high <i>h</i>, and once inside that energy has only two exits — raise the gas temperature, or leak through the wall.</div>`},

{ch:"A · Thermo foundations", title:"Why a fast fill runs hot",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>Rearrange the balance over a fill of duration Δ<i>t</i>. The wall can only remove heat so fast, so a <b>short</b> fill leaves almost no time for <i>Q</i><sub>wall</sub> — the limit is adiabatic:</p>
 <div class="eqn">Δ<i>U</i> ≈ <i>ṁ h</i><sub>in</sub> Δ<i>t</i> &nbsp;(Q<sub>wall</sub> → 0 as the fill gets faster)</div>
 <p>That's the core tension of fast-fill: speed and temperature pull against each other.</p>`,
 check:{q:"Fill the SAME tank faster — peak gas temperature goes…",
  opts:[{t:"Up — less time for heat to escape",ok:true},{t:"Down — gas spends less time inside",ok:false}],
  reveal:"Up. In the engine the full design peaks <b>84 °C at 10 min</b> but <b>102 °C at 5 min</b>. Faster = hotter, every time."}},

{ch:"A · Thermo foundations", title:"Real gases: Z and the EOS ladder",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>At 700 bar hydrogen is far from ideal. We carry the <b>compressibility factor</b> <i>Z</i>:</p>
 <div class="eqn"><i>P V</i> = <i>Z</i> <i>n R T</i> &nbsp;&nbsp;(ideal gas is just <i>Z</i> = 1)</div>
 <p>EOS accuracy is a ladder: <i>ideal</i> → <i>cubic</i> (van der Waals, SRK, Peng–Robinson) → <i>virial</i> → <i>reference</i> multiparameter EOS. For H₂ the gold standard is the Leachman et&nbsp;al. reference equation, which is what the CoolProp library evaluates.</p>
 <div class="example"><b>Worked.</b> At 700 bar / 15 °C, <i>Z</i> ≈ 1.3, so real density ρ ≈ 40 kg/m³ — about <b>30 % below</b> the ideal-gas value. Get this wrong and your fuelled mass and compression temperature are both wrong.</div>
 <div class="litnote"><b>📚 From the literature.</b> Leachman et&nbsp;al. (2009) is the accepted reference EOS for normal/para-hydrogen and underpins NIST REFPROP and CoolProp — more accurate here than cubic EOS like SRK/PR.</div>
 <div class="defends">🛡️ You can now answer: <i>"Did you use the ideal gas law? What about Z ≈ 1.25–1.3?"</i> — No: real-gas Leachman EOS via CoolProp, Z carried throughout.</div>`},

{ch:"A · Thermo foundations", title:"Joule–Thomson: why H₂ warms as it expands",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>Throttling gas through a valve/nozzle is <b>isenthalpic</b> (constant <i>h</i>). The temperature change is set by the Joule–Thomson coefficient:</p>
 <div class="eqn">μ<sub>JT</sub> = <span class="frac"><span>∂<i>T</i></span><span>∂<i>P</i></span></span><sub><i>h</i></sub></div>
 <p>Most gases have μ<sub>JT</sub> > 0 (they cool on expansion). Hydrogen's <b>inversion temperature is ~200 K (−73 °C)</b>, so near ambient μ<sub>JT</sub> < 0 — H₂ <i>warms</i> as it expands. Throttling 700-bar H₂ into the tank adds a little heat instead of removing it.</p>
 <div class="defends">🛡️ You can now answer: <i>"Did you separate the J–T spike from bulk compression?"</i> — Our 0-D core captures bulk real-gas enthalpy; the local nozzle spike needs injector CFD (out of scope). H₂'s negative μ<sub>JT</sub> is a secondary contributor.</div>`},

// ===================== PART B — HEAT TRANSFER FOUNDATIONS =====================
{ch:"B · Heat transfer", title:"Conduction & thermal resistance",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>Heat crosses the wall by conduction — Fourier's law:</p>
 <div class="eqn"><i>q</i> = <i>k A</i> <span class="frac"><span>Δ<i>T</i></span><span><i>L</i></span></span> &nbsp;⇔&nbsp; <i>R</i> = <span class="frac"><span><i>L</i></span><span><i>k A</i></span></span></div>
 <p>Layers add like resistors in series: <i>R</i><sub>tot</sub> = R<sub>liner</sub> + R<sub>PCM</sub> + R<sub>CFRP</sub>. The biggest resistance dominates — and in a standard tank that's the plastic liner (k ≈ 0.4 W/m·K, a near-insulator). Metal liners are ~200.</p>
 <div class="defends">🛡️ Foundation for the liner questions — the liner is the gatekeeping resistance in the series stack.</div>`},

{ch:"B · Heat transfer", title:"Transient conduction: diffusivity & time",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:false},
 body:`<p>How <i>fast</i> heat moves is set by the thermal diffusivity α, and the time to cross a thickness <i>L</i> scales with <i>L</i>²:</p>
 <div class="eqn">α = <span class="frac"><span><i>k</i></span><span>ρ <i>c</i><sub>p</sub></span></span> &nbsp;,&nbsp; τ ≈ <span class="frac"><span><i>L</i>²</span><span>α</span></span> &nbsp;,&nbsp; penetration δ ≈ √(α<i>t</i>)</div>
 <div class="example"><b>Worked.</b> Doping the liner from k = 0.4 → 5 W/m·K raises α ~12×, cutting the cross-time from <b>~4.5 to ~0.4 s per mm</b>. Heat now reaches the wall within the 10-minute fill.</div>`,
 check:{q:"A great conductive liner (k=5) but NO heat store — does a 30 °C chiller-less fill pass?",
  opts:[{t:"Yes, heat escapes fast enough",ok:false},{t:"No — nowhere to put the heat",ok:true}],
  reveal:"No — dome still <b>141 °C</b>. Conduction <i>delivers</i> heat to the wall; it doesn't <i>store</i> the tens of MJ. You need a sink."}},

{ch:"B · Heat transfer", title:"Convection & the coefficient h",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>Gas-to-wall transfer is convection — Newton's law <i>q</i> = <i>h A</i> Δ<i>T</i> — with <i>h</i> hidden inside the Nusselt number:</p>
 <div class="eqn">Nu = <span class="frac"><span><i>h L</i></span><span><i>k</i></span></span> = <i>f</i>(Re, Pr) &nbsp;~&nbsp; Re<sup>m</sup> Pr<sup>n</sup></div>
 <p>The inlet jet drives strong forced convection early, but turbulence (and Re) decay as the fill completes, so <i>h</i> is really time-varying.</p>
 <div class="litnote"><b>📚 From the literature.</b> Fast-fill h is typically 150–600 W/m²·K; CFD studies (Galassi 2012; Heitsch 2011) resolve it spatially. We use a single value at the upper end (~500) and flag the sensitivity.</div>
 <div class="defends">🛡️ You can now answer: <i>"Static or transient h?"</i> — Fixed ~500 (an assumption); at h ≈ 350 the design fails. A transient Nu-decay model is the clean refinement. Own it.</div>`},

{ch:"B · Heat transfer", title:"Lumped vs distributed, and the hot dome",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>When is a body "uniform enough" to treat as one temperature? The Biot number decides:</p>
 <div class="eqn">Bi = <span class="frac"><span><i>h L</i></span><span><i>k</i></span></span> &nbsp;(Bi ≪ 1 ⇒ lumped is valid)</div>
 <p>We treat the gas core as 0-D (lumped) but resolve the wall as 1-D radial conduction — the right fidelity for each. The gas is <i>not</i> uniform though: the inlet jet and buoyancy make the top <b>dome</b> hotter than the bulk, so we add a conservative offset and bind on the dome.</p>
 <div class="eqn"><i>T</i><sub>dome</sub> = <i>T</i><sub>bulk</sub> + Δ<i>T</i><sub>strat</sub> (≈ +10 °C)</div>
 <div class="defends">🛡️ You can now answer: <i>"How do you handle the dome jet hotspot?"</i> — A +10 °C stratification proxy on the binding constraint; full 3-D jet impingement is future CFD.</div>`},

// ===================== PART C — PHASE CHANGE & PCM =====================
{ch:"C · Phase change & PCM", title:"Latent heat & the Stefan problem",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
 body:`<p>Two ways to absorb heat. <b>Sensible</b> raises temperature; <b>latent</b> is banked while a solid melts, at nearly constant temperature — and it's far larger per kg:</p>
 <div class="eqn"><i>q</i> = <i>m c</i> Δ<i>T</i> &nbsp;&nbsp;vs&nbsp;&nbsp; <i>Q</i> = <i>m L</i></div>
 <p>A melting front that moves through the material is a <b>moving-boundary (Stefan) problem</b>. In simulation it's handled cleanly with the <b>enthalpy method</b>: track total enthalpy per cell and let temperature follow, so the front emerges automatically without meshing it explicitly.</p>
 <div class="defends">🛡️ Foundation for every PCM question — and for "how did you model the melt front?" (enthalpy method).</div>`},

{ch:"C · Phase change & PCM", title:"Melt fraction & sizing the sponge",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
 body:`<p>The state of the sponge is the <b>melt fraction</b> Φ; size it so its latent capacity covers the heat that would otherwise push the dome past 85 °C:</p>
 <div class="eqn">Φ = <span class="frac"><span><i>Q</i><sub>absorbed</sub></span><span><i>m L</i></span></span> &nbsp;,&nbsp; <i>m</i><sub>PCM</sub> ≥ <span class="frac"><span><i>Q</i><sub>excess</sub></span><span><i>L</i></span></span></div>
 <div class="example"><b>Worked.</b> For this 700-bar tank that lands near <b>50 kg</b> at k ≈ 12, L ≈ 147 kJ/kg. A higher-latent or higher-k PCM needs less mass — see the mass-vs-conductivity chart.</div>`,
 check:{q:"Use a PCM with TWICE the latent heat L. Required mass…",
  opts:[{t:"roughly halves",ok:true},{t:"doubles",ok:false},{t:"unchanged",ok:false}],
  reveal:"Halves — mass scales as 1/L. That's why latent heat and conductivity are <i>both</i> design levers."}},

{ch:"C · Phase change & PCM", title:"PCM materials & effective conductivity",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
 body:`<p>Candidate PCMs: paraffins, bio-based fatty acids (capric/lauric/myristic), salt hydrates. The killer flaw of neat paraffin is <b>k ≈ 0.2 W/m·K</b> — it would melt only near the hot face, leaving cold un-melted islands.</p>
 <p>The fix is a composite: infiltrate the wax into <b>expanded graphite (EG)</b> or metal foam, raising <i>effective</i> k to ~5–12 while keeping most of the latent heat.</p>
 <div class="litnote"><b>📚 From the literature.</b> Paraffin/EG composites reach k ≈ 5–12 W/m·K (Wang 2020; Lin 2022); the broad guidance (Gulfam 2019 review) is to trade a little latent heat for a large conductivity gain — exactly the sweet spot we target.</div>
 <div class="defends">🛡️ You can now answer: <i>"Native k is 0.2 — how do you avoid un-melted islands?"</i> — EG composite, effective k ≈ 12; in Sandbox a low-k PCM visibly fails.</div>`},

{ch:"C · Phase change & PCM", title:"Inside the matrix: LTE vs LTNE",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
 body:`<p>A graphite/paraffin composite is really two materials. <b>Local Thermal Equilibrium (LTE)</b> assumes they share one temperature; <b>LTNE</b> (two-temperature) lets the conductive skeleton run ahead of the wax it's heating:</p>
 <div class="eqn">LTE: <i>T</i><sub>graphite</sub> = <i>T</i><sub>wax</sub> &nbsp;⟶&nbsp; LTNE: two coupled temperatures</div>
 <p>We use effective properties (LTE-like) — simple and accurate when the skeleton is highly conductive, but it can slightly <i>overstate</i> instantaneous absorption versus LTNE.</p>
 <div class="defends">🛡️ You can now answer: <i>"Did you assume LTE? Does it overestimate absorption?"</i> — Yes, LTE; modest error given high EG conductivity; LTNE is the refinement.</div>`},

{ch:"C · Phase change & PCM", title:"Supercooling, hysteresis & cycle life",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
 body:`<p>Two real-world PCM behaviours: <b>supercooling</b> (it must cool <i>below</i> the melt point before it re-freezes — a hysteresis loop on discharge) and <b>cycle degradation</b> (latent heat fades over many melt/freeze cycles).</p>
 <div class="litnote"><b>📚 From the literature.</b> Encapsulated/composite paraffins are remarkably stable: paraffin/EG loses &lt;3 % latent over 100 cycles (Wang 2020); paraffin/HDPE only ~2.9 % over <b>5000 cycles</b> (Rahmalina 2022); comprehensive 3000-cycle data in Kahwaji 2018. Shape-stabilizers (HDPE, EG) both boost conductivity <i>and</i> suppress leakage/fade.</p>
 <div class="defends">🛡️ You can now answer: <i>"Supercooling? Year-10 degradation?"</i> — Our fill (melt) peak is unaffected by supercooling; reset could be optimistic. Composite latent fade is single-digit % over thousands of cycles per the literature; long-term qualification is future work.</div>`},

// ===================== PART D — THE HYDROGEN SYSTEM =====================
{ch:"D · The H₂ system", title:"Type IV tanks & the thermal trap",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>Pressure vessels evolved I → IV, trading metal for a thin <b>polymer liner + carbon-fibre overwrap</b>. Type IV cut tank mass &gt;50 % and enabled fuel-cell vehicles — but the same plastic liner that saved weight is a thermal insulator. That trade <i>created</i> the fast-fill heat problem.</p>
 <div class="litnote"><b>📚 From the literature.</b> Early metal-lined Type III tanks (liner k ~120–200) shed heat fast enough to barely need chillers; the move to plastic (k ≈ 0.4) is precisely where the chiller mandate begins.</div>`},

{ch:"D · The H₂ system", title:"The 85 °C ceiling & certification",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>The overwrap's strength comes from epoxy resin, which softens approaching its glass transition (T<sub>g</sub> ≈ 120 °C). To preserve margin, <b>UN GTR 13</b> caps the gas at <b>85 °C</b> and requires a 2.25× burst safety factor; <b>SAE J2601</b> defines the fuelling protocol and the −40 °C "T40" pre-cool tiers.</p>
 <div class="defends">🛡️ You can now answer: <i>"What's the epoxy T<sub>g</sub>; does a hot desert kill margin?"</i> — T<sub>g</sub> ≈ 120 °C sits above the 85 °C design point, but a hot soak raises the baseline — which is exactly why the envelope fails above ~33 °C ambient (try the Sandbox).</div>`},

{ch:"D · The H₂ system", title:"Fuelling protocols and their hard limit",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>Protocols got smarter: rigid <b>J2601 lookup tables</b> → the real-time <b>MC Method</b> (Harty &amp; Mathison, Honda R&amp;D — a lumped m·C model modulated against 85 °C) → <b>J2601-5</b> with heavy-duty flow categories (FM60–FM300) and the MCF-HF-G algorithm.</p>
 <p>But software can only <i>slow you down</i>. A commercial HD fill needs ~108 g/s (65 kg in 10 min); a chiller-less standard tank physically can't take that without overheating. Intelligence can't beat thermodynamics.</p>
 <div class="defends">🛡️ You can now answer: <i>"Why not just use better software?"</i> — Protocols cap flow; the heat still must leave the gas, so the fix must be in the tank.</div>`},

{ch:"D · The H₂ system", title:"Validation & the PRHYDE question",
 set:{useChiller:false,temp:30,fill:10,linerK:0.4,pcmOn:false},
 body:`<p>Fast-fill models are validated against measured fills. The lineage: 1-D + CFD vs experiment (Johnson 2015, Sandia), CFD at 70 MPa (Galassi 2012; Heitsch 2011), and the EU <b>PRHYDE</b> project defining heavy-duty fuelling test data.</p>
 <div class="litnote"><b>📚 From the literature.</b> These studies establish that 1-D/0-D models predict mean gas temperature well, while peak <i>wall</i> temperature needs 3-D — which is why we bind on a conservative dome offset.</div>
 <div class="defends">🛡️ You can now answer: <i>"PRHYDE comparability with your extra layer?"</i> — We don't claim a formal PRHYDE benchmark; our physics aligns with these validated models and we verify internal consistency. A PRHYDE-calibrated run <i>with</i> the PCM layer is the honest next step.</div>`},

// ===================== PART E — THE ONBOARD FIX =====================
{ch:"E · The onboard fix", title:"The conductive nano-filled liner",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:false},
 body:`<p>Raise the liner's k by dispersing graphene nanoplatelets, CNTs, or boron nitride in the polymer. The subtlety reviewers probe is <b>percolation</b> — but you must distinguish two kinds:</p>
 <div class="eqn">electrical percolation ≪ thermal percolation</div>
 <p><b>Electrical</b> percolation is ultralow (~0.02–0.1 vol%) because the filler/matrix conductivity contrast is ~10¹⁵. <b>Thermal</b> percolation is higher and gentler (~1–20 vol% depending on filler) because the thermal contrast is only ~10². So you don't get a sharp thermal jump — you climb it with high-aspect-ratio, well-dispersed fillers and good interfaces.</p>
 <div class="litnote"><b>📚 From the literature.</b> Unified percolation theory (Sarikhani 2022) and Kargar (2018) show thermal thresholds far above electrical ones; Shtein (2015) reached k ≈ 12 W/m·K with graphene nanoplatelets; interfacial (Kapitza) resistance caps gains (Kapadia 2013). k ≈ 2–5 at &lt;5 wt% is consistent with this body of work.</p>
 <div class="defends">🛡️ You can now answer: <i>"What wt%? Below percolation you won't hit k = 2–5."</i> — The relevant threshold is <i>thermal</i>, not electrical; with high-aspect-ratio dispersed fillers k = 2–5 at &lt;5 wt% is well-supported.</div>`,
 check:{q:"A reviewer says 'below percolation your k won't reach 2–5.' Which percolation matters here?",
  opts:[{t:"Thermal percolation — higher & gradual",ok:true},{t:"Electrical percolation — ultralow threshold",ok:false}],
  reveal:"Thermal. Electrical percolates at &lt;0.1 vol%; thermal is the relevant, higher, gradual one because the thermal contrast ratio is only ~100."}},

{ch:"E · The onboard fix", title:"Liner mechanics & manufacturing",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:false},
 body:`<p>Nano-fillers raise stiffness but can cut <b>elongation at break</b> — and the liner must survive thousands of empty→full "breathing" strains without cracking. Keeping loading &lt;5 wt% with high-aspect-ratio platelets preserves most of the polymer's ductility.</p>
 <p>Manufacturing the tri-layer means inserting the PCM between liner molding and filament winding — a real process-development task. As a bonus, the filler's tortuous path cuts H₂ permeation 30–90 %.</p>
 <div class="defends">🛡️ You can now answer the brittleness, manufacturing, and permeation questions — honestly scoping which are computed vs cited vs future process work.</div>`},

{ch:"E · The onboard fix", title:"Why the PCM must sit inboard",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
 body:`<p>Geometry is everything. An earlier generation wrapped PCM <i>outside</i> the carbon-fibre shell — and failed, because the structural shell is itself an insulator that blocks the heat from ever reaching the PCM. The working architecture puts the PCM <b>inboard</b>, directly in the heat path: conductive liner delivers the heat, PCM stores it.</p>
 <div class="litnote"><b>📚 From the literature.</b> Mazzucco (2016) modelled integrated-PCM fuelling and found the decisive lever is heat-transfer <i>area/conductivity</i>, not a single property; Ramasamy (2018) showed neat paraffin fails but graphite composites cut required pre-cooling 10–20 K and cooler power 50–100 %.</p>
 <div class="defends">🛡️ You can now answer the "does PCM actually help / where does it go" questions from first principles + the modelling literature.</div>`},

// ===================== PART F — INTEGRITY, OPS & COST =====================
{ch:"F · Integrity, ops & cost", title:"Thermo-mechanical integrity",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
 body:`<p>Trapping a melting liquid between rigid walls raises four structural questions:</p>
 <p>• <b>Volumetric expansion</b> — paraffin grows ~10–15 % on melting; a real design needs an engineered <b>void / gas-void fraction (~12–15 %)</b> to absorb it without pressure spikes.<br>
 • <b>Delamination</b> — CTE mismatch between plastic, wax and CFRP over cycles → needs bonded-interface FE + cycle testing.<br>
 • <b>Liner buckling</b> on fast discharge → a depressurization design case.<br>
 • <b>Epoxy T<sub>g</sub> margin</b> in hot ambients → tracked via the CFRP temperature.</p>
 <div class="defends">🛡️ You can now answer all of Category 4 — clearly separating our thermal results (T<sub>g</sub> margin) from the structural provisions and future FE work (expansion void, delamination, buckling).</div>`},

{ch:"F · Integrity, ops & cost", title:"Numerical method & rigour",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
 body:`<p>Our solver is a 1-D radial finite-difference wall coupled to a 0-D real-gas core, with the melt front via the <b>enthalpy method</b>. Because it isn't a 3-D CFD, a CFD Grid-Convergence-Index doesn't directly apply; instead we show <b>time-step insensitivity</b> (Δt = 0.5 vs 1.0 s give identical peaks) and resolve the wall layers spatially.</p>
 <p>External boundary: natural convection / fixed ambient on the overwrap — conservative, since vehicle airflow would only help.</p>
 <div class="defends">🛡️ You can now answer: <i>"Mesh independence / GCI? Boundary conditions?"</i> — timestep-converged 1-D/0-D model with enthalpy-method front; conservative external BC; a 3-D CFD with GCI is future work.</div>`},

{ch:"F · Integrity, ops & cost", title:"Fleet logistics & the reset problem",
 set:{useChiller:false,temp:33,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
 body:`<p>A passive PCM is a <b>thermal battery</b> — it must re-freeze (regenerate) before the next fast fill. Regeneration is driven by the tank-to-ambient ΔT, so hot days lengthen it; our estimate is ~3.2 h parked / 0.9 h driving.</p>
 <p>That makes this a <b>scheduled hub-and-spoke</b> technology (transit, regional fleets with staging), not arbitrary back-to-back fills. To authorize a fast fill, a real system needs to know remaining latent capacity — i.e. embedded PCM thermal sensors estimating Φ.</p>
 <div class="defends">🛡️ You can now answer the back-to-back, hot-day regeneration, and state-of-charge questions — including the honest limit.</div>`,
 check:{q:"A truck returns in 2 h with the PCM still melted and no chiller. Result?",
  opts:[{t:"It overheats — outside the duty cycle",ok:true},{t:"Fine — PCM always works",ok:false}],
  reveal:"It overheats. With Φ→1 (no reserve) and no regeneration, a second fast fill breaches 85 °C. The system is scoped for scheduled duty cycles — state this proactively."}},

{ch:"F · Integrity, ops & cost", title:"Techno-economics & the split incentive",
 set:{useChiller:false,temp:30,fill:10,linerK:5,pcmOn:true,pcmK:12,mass:50},
 body:`<p>The station saves ~16 % of capital (the chiller) plus all pre-cooling OPEX; the truck pays ~+50 kg and a few % volume. That's the <b>split-incentive paradox</b> — costs and savings sit with different parties.</p>
 <p>The alignment lever is commercial: station operators discount hydrogen for self-cooling-tank fleets, funded by the infrastructure saving. Open items: a full 15-year fleet TCO, and the regulatory path (can a certified tank embed a PCM; drop/bonfire/cycle qualification of the tri-layer).</p>
 <div class="defends">🛡️ You can now answer all of Category 7 — the split incentive, payload TCO, and certification path — as commercial/qualification arguments, clearly distinct from the simulation.</div>
 <div class="example"><b>You've finished the course.</b> Open <b>🛡️ Tough Q&A</b> to rehearse the exact questions, or <b>Sandbox</b> to demonstrate any of them live.</div>`}
];
