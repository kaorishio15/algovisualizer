import { C } from '../constants/theme';

export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Orbitron:wght@400;700;900&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.panel}; } ::-webkit-scrollbar-thumb { background: ${C.borderHi}; border-radius: 2px; }
      .btn { border: 1px solid ${C.border}; background: ${C.card}; color: ${C.text}; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 13px; transition: all 0.15s; letter-spacing: 0.5px; }
      .btn:hover { border-color: ${C.accent}; color: ${C.accent}; background: rgba(0,212,255,0.05); }
      .btn.active { border-color: ${C.accent}; color: ${C.accent}; background: rgba(0,212,255,0.1); box-shadow: 0 0 8px rgba(0,212,255,0.2); }
      .btn.accent { border-color: ${C.accent}; color: ${C.accent}; }
      .btn.danger { border-color: ${C.danger}; color: ${C.danger}; }
      .btn.success { border-color: ${C.accent3}; color: ${C.accent3}; }
      .btn.purple { border-color: ${C.accent2}; color: ${C.accent2}; }
      select, input[type=range], input[type=number] { background: ${C.card}; border: 1px solid ${C.border}; color: ${C.text}; padding: 5px 8px; border-radius: 4px; font-family: inherit; font-size: 13px; }
      select:focus, input:focus { outline: none; border-color: ${C.accent}; }
      textarea { background: ${C.card}; border: 1px solid ${C.border}; color: ${C.text}; padding: 8px; border-radius: 4px; font-family: inherit; font-size: 13px; resize: vertical; width: 100%; }
      .chip { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; letter-spacing: 0.8px; font-weight: 700; }
      .node-circle { transition: fill 0.3s, stroke 0.3s; cursor: pointer; }
      .edge-line { transition: stroke 0.2s, stroke-width 0.2s; cursor: pointer; }
      .glow { filter: drop-shadow(0 0 6px rgba(0,212,255,0.5)); }
      .pulse { animation: pulse 1s infinite; }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      @keyframes slideIn { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }
      .slide-in { animation: slideIn 0.2s ease; }
      input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: ${C.border}; }
      input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${C.accent}; cursor: pointer; }

      /* Shrink the algorithm picker buttons on narrower / split-screen widths */
      @media (max-width: 900px) {
        .algo-btn { padding: 5px 8px !important; font-size: 12px !important; }
        .algo-btn .algo-type-label { display: none; }
      }
      @media (max-width: 680px) {
        .algo-btn { padding: 4px 6px !important; font-size: 11px !important; }
      }
    `}</style>
  );
}