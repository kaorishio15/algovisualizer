import { C, dataStructureInfo } from '../constants/theme';

export default function RightPanel({ algo, graph, currentStep }) {
  return (
    <div style={{ width: 200, background: C.panel, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: 12, gap: 10, flexShrink: 0 }}>
      <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5 }}>ALGORITHM STATE</div>

      {currentStep && (
        <div className="slide-in" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 9, color: C.textDim, marginBottom: 4 }}>STEP TYPE</div>
          <div style={{ fontSize: 12, color: (() => { const t = currentStep.type; return t === 'done' ? C.accent3 : t === 'update' || t === 'add' ? C.accent : t === 'reject' ? C.danger : C.accent2; })(), fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{currentStep.type}</div>
        </div>
      )}

      {/* Distance table */}
      {currentStep?.dist && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 6 }}>DISTANCES</div>
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {graph.nodes.map(n => {
              const d = currentStep.dist[n.id];
              const isMin = d !== Infinity && d === Math.min(...Object.values(currentStep.dist).filter(v => v !== Infinity));
              return (
                <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: `1px solid ${C.bg}`, fontSize: 11 }}>
                  <span style={{ color: currentStep.current === n.id ? C.accent2 : C.textDim }}>n{n.label}</span>
                  <span style={{ color: d === Infinity ? C.textDim : isMin ? C.accent3 : C.accent, fontWeight: d !== Infinity ? 700 : 400 }}>{d === Infinity ? '∞' : d}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visited set */}
      {currentStep?.visited && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 6 }}>VISITED ({currentStep.visited.size})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[...currentStep.visited].map(nid => {
              const n = graph.nodes.find(n => n.id === nid);
              return <span key={nid} className="chip" style={{ background: 'rgba(16,185,129,0.1)', color: C.accent3, border: `1px solid ${C.accent3}22` }}>{n?.label ?? nid}</span>;
            })}
          </div>
        </div>
      )}

      {/* MST edges */}
      {currentStep?.mstEdges && currentStep.mstEdges.size > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 6 }}>MST EDGES ({currentStep.mstEdges.size})</div>
          <div style={{ maxHeight: 120, overflow: 'auto' }}>
            {[...currentStep.mstEdges].map(eid2 => {
              const e = graph.edges.find(e => e.id === eid2);
              if (!e) return null;
              const fn = graph.nodes.find(n => n.id === e.from), tn = graph.nodes.find(n => n.id === e.to);
              return <div key={eid2} style={{ fontSize: 10, color: C.accent3, marginBottom: 2 }}>{fn?.label} — {tn?.label} ({e.weight})</div>;
            })}
          </div>
        </div>
      )}

      {/* Negative cycle */}
      {currentStep?.negCycle && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: `1px solid ${C.danger}`, borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 11, color: C.danger, fontWeight: 700 }}>⚠ Negative Cycle Detected</div>
          <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>Distances are unreliable</div>
        </div>
      )}

      {/* Stack/Queue for DFS/BFS */}
      {currentStep?.queue !== undefined && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 6 }}>QUEUE ({currentStep.queue.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {currentStep.queue.map((nid, i) => {
              const n = graph.nodes.find(n => n.id === nid);
              return <span key={i} className="chip" style={{ background: 'rgba(0,212,255,0.1)', color: C.accent }}>{n?.label ?? nid}</span>;
            })}
          </div>
        </div>
      )}
      {currentStep?.stack !== undefined && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 8 }}>
          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 6 }}>STACK ({currentStep.stack.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {currentStep.stack.map((nid, i) => {
              const n = graph.nodes.find(n => n.id === nid);
              return <span key={i} className="chip" style={{ background: 'rgba(124,58,237,0.1)', color: C.accent2 }}>{n?.label ?? nid}</span>;
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 6 }}>DATA STRUCTURES</div>
        <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {dataStructureInfo[algo]}
        </div>
      </div>
    </div>
  );
}