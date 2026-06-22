# Chiller-Less 700-bar Fast-Fill of Hydrogen Tanks — Interactive Simulator

Companion tool for the WHEC poster *"Chillerless Fast-Fill for Heavy-Duty Hydrogen
Vehicles: PCM Thermal Buffering Eliminates Pre-Cooling Requirements"* (B. Chiramel, HPCL).

**Live site:** https://1boscochiramel.github.io/Chiller-Less700-barFast-FillofHydrogenTanks-WHEC-/

A static, browser-only simulator. Every thermal curve is pre-computed by the real coupled
gas–wall engine (`fastfill_350.py`, real-gas H₂); the page just looks values up, so it is
instant and needs no server. Each value is tagged **[EXT]** (public source) or **[CALC]**
(real engine).

Three modes:
- **Story walkthrough** — 7 steps from "standard tank fails" to "full stack passes".
- **Sandbox** — fill temperature, refuelling time, liner material/k, PCM on/off, material, mass.
- **Where we came from** — the design history (tank Types I–IV, liner conductivity eras,
  PCM generations, refuelling-protocol evolution).

Files: `index.html`, `style.css`, `app.js`, `data.json`.
