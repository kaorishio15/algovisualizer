import { C, algoInfo, stepDescriptions } from "../constants/theme";

export default function CanvasToolbar({
  algo,
  runAlgo,
  playing,
  setPlaying,
  steps,
  stepIdx,
  setStepIdx,
  speed,
  setSpeed,
  startNode,
  graph,
  currentStep,
}) {
  const stepDesc = stepDescriptions(currentStep);

  return (
    <div
      style={{
        background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        padding: "8px 12px",
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn purple" onClick={runAlgo}>
          ▶ Run {algoInfo[algo].name}
        </button>
        <button
          className={`btn ${playing ? "accent" : ""}`}
          onClick={() => steps.length && setPlaying((p) => !p)}
        >
          {playing ? "⏸ Pause" : "▷ Play"}
        </button>
        <button
          className="btn"
          onClick={() => {
            setStepIdx(0);
            setPlaying(false);
          }}
        >
          ⏮ Reset
        </button>
        <button
          className="btn"
          disabled={stepIdx <= 0}
          onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
        >
          ◀ Step
        </button>
        <button
          className="btn"
          disabled={stepIdx >= steps.length - 1}
          onClick={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
        >
          Step ▶
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 10, color: C.textDim }}>SPEED</span>
        <input
          type="range"
          min="50"
          max="1500"
          step="50"
          value={1550 - speed}
          onChange={(e) => setSpeed(1550 - +e.target.value)}
          style={{ width: 80 }}
        />
      </div>
      {steps.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 10, color: C.textDim }}>STEP</div>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>
            {stepIdx + 1} / {steps.length}
          </div>
          <div
            style={{
              width: 100,
              height: 4,
              background: C.border,
              borderRadius: 2,
            }}
          >
            <div
              style={{
                width: `${((stepIdx + 1) / steps.length) * 100}%`,
                height: "100%",
                background: C.accent,
                borderRadius: 2,
                transition: "width 0.2s",
              }}
            />
          </div>
        </div>
      )}
      {startNode && (
        <div style={{ fontSize: 10 }}>
          Start:{" "}
          <span style={{ color: C.accent2, fontWeight: 700 }}>
            node {graph.nodes.find((n) => n.id === startNode)?.label}
          </span>
        </div>
      )}
      <div
        style={{
          marginLeft: "auto",
          fontSize: 11,
          color: stepDesc.includes("complete")
            ? C.accent3
            : stepDesc.includes("⚠")
              ? C.warn
              : C.textDim,
        }}
      >
        {stepDesc || (steps.length === 0 ? "← Configure and click Run" : "")}
      </div>
    </div>
  );
}
