import { C, algoInfo } from "../constants/theme";
import { Generators, resetEidCounter } from "../lib/generators";

export default function LeftPanel({
  algo,
  mode,
  setMode,
  edgeFrom,
  setEdgeFrom,
  newEdgeWeight,
  setNewEdgeWeight,
  setGraph,
  setSteps,
  setStepIdx,
  setStartNode,
  setSelectedNode,
  showJSON,
  setShowJSON,
  jsonInput,
  setJsonInput,
  jsonError,
  setJsonError,
  graph,
  showMetrics,
  metrics,
}) {
  const importJSON = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (!data.nodes || !data.edges)
        throw new Error("Must have nodes and edges arrays");
      setGraph(data);
      setJsonError("");
      setShowJSON(false);
      setSteps([]);
      setStepIdx(0);
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const loadPreset = (preset) => {
    resetEidCounter();
    let g;
    if (preset === "dense") g = Generators.dense();
    else if (preset === "sparse") g = Generators.sparse();
    else if (preset === "grid") g = Generators.grid(4, 4);
    else if (preset === "tree") g = Generators.tree(12);
    else if (preset === "scaleFree") g = Generators.scaleFree(14);
    else g = Generators.random(8, 0.35);
    setGraph(g);
    setSteps([]);
    setStepIdx(0);
    setStartNode(g.nodes[0]?.id || null);
    setSelectedNode(null);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(graph, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "graph.json";
    a.click();
  };

  return (
    <div
      style={{
        width: 220,
        background: C.panel,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        padding: 12,
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Algorithm info */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          padding: 10,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: C.textDim,
            letterSpacing: 1.5,
            marginBottom: 6,
          }}
        >
          SELECTED ALGORITHM
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.accent,
            marginBottom: 2,
          }}
        >
          {algoInfo[algo].name}
        </div>
        <div style={{ fontSize: 9, color: C.accent3, marginBottom: 6 }}>
          {algoInfo[algo].complexity}
        </div>
        <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.5 }}>
          {algoInfo[algo].desc}
        </div>
      </div>

      {/* Edit Mode */}
      <div>
        <div
          style={{
            fontSize: 9,
            color: C.textDim,
            letterSpacing: 1.5,
            marginBottom: 6,
          }}
        >
          EDIT MODE
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            ["select", "↖ Select / Move"],
            ["addNode", "⊕ Add Node"],
            ["addEdge", "— Add Edge"],
            ["delete", "✕ Delete"],
          ].map(([m, label]) => (
            <button
              key={m}
              className={`btn ${mode === m ? "active" : ""}`}
              onClick={() => {
                setMode(m);
                setEdgeFrom(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === "addEdge" && (
          <div
            style={{
              marginTop: 8,
              padding: 8,
              background: C.bg,
              borderRadius: 4,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 4 }}>
              Edge weight: {newEdgeWeight}
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={newEdgeWeight}
              onChange={(e) => setNewEdgeWeight(+e.target.value)}
              style={{ width: "100%" }}
            />
            {edgeFrom && (
              <div
                style={{ marginTop: 6, fontSize: 10, color: C.accent }}
                className="pulse"
              >
                Click target node...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Presets */}
      <div>
        <div
          style={{
            fontSize: 9,
            color: C.textDim,
            letterSpacing: 1.5,
            marginBottom: 6,
          }}
        >
          GRAPH PRESETS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            ["random", "🎲 Random"],
            ["dense", "🕸 Dense"],
            ["sparse", "⬡ Sparse"],
            ["grid", "⊞ Grid"],
            ["tree", "🌲 Tree"],
            ["scaleFree", "🌐 Scale-Free"],
          ].map(([p, label]) => (
            <button key={p} className="btn" onClick={() => loadPreset(p)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* JSON Import */}
      <div>
        <div
          style={{
            fontSize: 9,
            color: C.textDim,
            letterSpacing: 1.5,
            marginBottom: 6,
          }}
        >
          IMPORT / EXPORT
        </div>
        <button
          className="btn accent"
          style={{ width: "100%", marginBottom: 4 }}
          onClick={() => setShowJSON((v) => !v)}
        >
          {showJSON ? "✕ Close" : "{ } Import JSON"}
        </button>
        <button className="btn" style={{ width: "100%" }} onClick={exportJSON}>
          ⬇ Export JSON
        </button>
      </div>

      {showJSON && (
        <div
          style={{
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: 8,
          }}
          className="slide-in"
        >
          <textarea
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={
              '{\n  "nodes": [{"id":"n0","x":100,"y":100,"label":"0"}],\n  "edges": [{"id":"e0","from":"n0","to":"n1","weight":5,"directed":false}]\n}'
            }
          />
          {jsonError && (
            <div style={{ fontSize: 10, color: C.danger, marginTop: 4 }}>
              {jsonError}
            </div>
          )}
          <button
            className="btn success"
            style={{ width: "100%", marginTop: 6 }}
            onClick={importJSON}
          >
            ⬆ Import
          </button>
        </div>
      )}

      {/* Metrics */}
      {showMetrics && (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: 10,
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: C.textDim,
              letterSpacing: 1.5,
              marginBottom: 8,
            }}
          >
            GRAPH METRICS
          </div>
          {[
            ["Nodes", metrics.nodes],
            ["Edges", metrics.edges],
            ["Avg Degree", metrics.avgDeg],
            ["Max Degree", metrics.maxDeg],
            ["Density", metrics.density],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                marginBottom: 4,
              }}
            >
              <span style={{ color: C.textDim }}>{k}</span>
              <span style={{ color: C.accent, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
