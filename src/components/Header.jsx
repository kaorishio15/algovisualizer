import { C, algoInfo } from "../constants/theme";

export default function Header({
  algo,
  setAlgo,
  setSteps,
  setStepIdx,
  directed,
  setDirected,
}) {
  return (
    <div
      style={{
        background: C.panel,
        borderBottom: `1px solid ${C.border}`,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: "linear-gradient(135deg, #00d4ff22, #7c3aed44)",
            border: `1px solid ${C.borderHi}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 19,
          }}
        >
          ⬡
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 16,
              fontWeight: 900,
              color: C.accent,
              letterSpacing: 2,
            }}
          >
            Algo<span style={{ color: C.accent2 }}>visualizer</span>
          </div>
          <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 1.5 }}>
            ALGORITHM VISUALIZER v2.0
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {Object.entries(algoInfo).map(([key, info]) => (
          <button
            key={key}
            className={`btn algo-btn ${algo === key ? "active" : ""}`}
            onClick={() => {
              setAlgo(key);
              setSteps([]);
              setStepIdx(0);
            }}
          >
            <span
              className="algo-type-label"
              style={{
                fontSize: 11,
                color: C.textDim,
                display: "block",
                letterSpacing: 1,
              }}
            >
              {info.type}
            </span>
            {info.name}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: C.textDim }}>DIRECTED</span>
        <div
          onClick={() => setDirected((d) => !d)}
          style={{
            width: 36,
            height: 20,
            borderRadius: 10,
            background: directed ? C.accent2 : C.border,
            cursor: "pointer",
            position: "relative",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              left: directed ? 18 : 2,
              width: 16,
              height: 16,
              borderRadius: 50,
              background: "#fff",
              transition: "left 0.2s",
            }}
          />
        </div>
      </div>
    </div>
  );
}
