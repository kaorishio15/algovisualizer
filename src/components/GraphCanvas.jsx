import { useRef, useCallback } from "react";
import { C } from "../constants/theme";
import { eid } from "../lib/generators";

export default function GraphCanvas({
  graph,
  setGraph,
  mode,
  edgeFrom,
  setEdgeFrom,
  newEdgeWeight,
  directed,
  startNode,
  setStartNode,
  selectedNode,
  setSelectedNode,
  dragNode,
  setDragNode,
  dragOffset,
  setDragOffset,
  tooltip,
  setTooltip,
  currentStep,
  pulse,
}) {
  const svgRef = useRef(null);

  const nodeMap = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

  // Compute a viewBox that always fits every node, so presets (tree, scale-free,
  // grid, etc.) never get cut off regardless of how tall/wide they generate.
  const PAD = 60;
  const xs = graph.nodes.map((n) => n.x);
  const ys = graph.nodes.map((n) => n.y);
  const minX = xs.length ? Math.min(...xs) - PAD : 0;
  const minY = ys.length ? Math.min(...ys) - PAD : 0;
  const maxX = xs.length ? Math.max(...xs) + PAD : 800;
  const maxY = ys.length ? Math.max(...ys) + PAD : 600;
  const vbWidth = Math.max(maxX - minX, 400);
  const vbHeight = Math.max(maxY - minY, 300);

  const getNodeState = useCallback(
    (nid) => {
      if (!currentStep) return "default";
      if (currentStep.current === nid) return "current";
      if (currentStep.inMST?.has(nid)) return "mst";
      if (currentStep.visited?.has(nid)) return "visited";
      return "default";
    },
    [currentStep],
  );

  const getEdgeState = useCallback(
    (edge) => {
      if (!currentStep) return "default";
      if (currentStep.mstEdges?.has(edge.id)) return "mst";
      const hl = currentStep.highlight || [];
      for (const h of hl) {
        if (h.eid === edge.id) return "highlight";
        if (
          (h.from === edge.from && h.to === edge.to) ||
          (!edge.directed && h.from === edge.to && h.to === edge.from)
        )
          return "highlight";
      }
      return "default";
    },
    [currentStep],
  );

  const getNodeColor = (state) => {
    if (state === "current") return C.accent2;
    if (state === "mst") return C.accent3;
    if (state === "visited") return "#0f4c35";
    return C.nodeDefault;
  };

  const getEdgeColor = (state) => {
    if (state === "highlight") return C.accent;
    if (state === "mst") return C.accent3;
    return C.edgeDefault;
  };

  const getSVGPos = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleSVGClick = (e) => {
    if (dragNode) return;
    const pos = getSVGPos(e);
    if (mode === "addNode") {
      const id = `n${Date.now()}`;
      setGraph((g) => ({
        ...g,
        nodes: [
          ...g.nodes,
          { id, label: `${g.nodes.length}`, x: pos.x, y: pos.y },
        ],
      }));
    }
  };

  const handleNodeClick = (e, nid) => {
    e.stopPropagation();
    if (mode === "select") {
      setSelectedNode(nid);
      setStartNode(nid);
    } else if (mode === "addEdge") {
      if (!edgeFrom) {
        setEdgeFrom(nid);
      } else if (edgeFrom !== nid) {
        setGraph((g) => ({
          ...g,
          edges: [
            ...g.edges,
            {
              id: eid(),
              from: edgeFrom,
              to: nid,
              weight: newEdgeWeight,
              directed,
            },
          ],
        }));
        setEdgeFrom(null);
      } else {
        setEdgeFrom(null);
      }
    } else if (mode === "delete") {
      setGraph((g) => ({
        nodes: g.nodes.filter((n) => n.id !== nid),
        edges: g.edges.filter((e) => e.from !== nid && e.to !== nid),
      }));
    }
  };

  const handleEdgeClick = (e, eid2) => {
    e.stopPropagation();
    if (mode === "delete")
      setGraph((g) => ({ ...g, edges: g.edges.filter((e) => e.id !== eid2) }));
  };

  const handleNodeMouseDown = (e, nid) => {
    if (mode !== "select") return;
    e.stopPropagation();
    const pos = getSVGPos(e);
    const node = graph.nodes.find((n) => n.id === nid);
    setDragNode(nid);
    setDragOffset({ x: pos.x - node.x, y: pos.y - node.y });
  };

  const handleMouseMove = (e) => {
    if (!dragNode) return;
    const pos = getSVGPos(e);
    setGraph((g) => ({
      ...g,
      nodes: g.nodes.map((n) =>
        n.id === dragNode
          ? { ...n, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y }
          : n,
      ),
    }));
  };

  const handleMouseUp = () => setDragNode(null);

  return (
    <div
      style={{ flex: 1, position: "relative", overflow: "auto", minHeight: 0 }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${minX} ${minY} ${vbWidth} ${vbHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          cursor:
            mode === "addNode"
              ? "crosshair"
              : mode === "delete"
                ? "not-allowed"
                : "default",
          background: C.bg,
          display: "block",
        }}
        onClick={handleSVGClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={C.accent} />
          </marker>
          <marker
            id="arrow-mst"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill={C.accent3} />
          </marker>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="node-grad-current" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </radialGradient>
          <radialGradient id="node-grad-visited" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
          <radialGradient id="node-grad-mst" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
          </radialGradient>
          <radialGradient id="node-grad-default" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#2d4a7a" />
            <stop offset="100%" stopColor="#1e2d4a" />
          </radialGradient>
        </defs>

        {/* Grid background */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke={C.border}
            strokeWidth="0.5"
            opacity="0.3"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Edges */}
        {graph.edges.map((edge) => {
          const from = nodeMap[edge.from],
            to = nodeMap[edge.to];
          if (!from || !to) return null;
          const state = getEdgeState(edge);
          const color = getEdgeColor(state);
          const isHighlit = state !== "default";
          const dx = to.x - from.x,
            dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const r = 20;
          const x1 = from.x + (dx / len) * r,
            y1 = from.y + (dy / len) * r;
          const x2 = to.x - (dx / len) * (r + (directed ? 8 : 0));
          const y2 = to.y - (dy / len) * (r + (directed ? 8 : 0));
          const mx = (from.x + to.x) / 2,
            my = (from.y + to.y) / 2;
          return (
            <g key={edge.id} onClick={(e) => handleEdgeClick(e, edge.id)}>
              {isHighlit && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeWidth={10}
                  opacity={0.15}
                />
              )}
              <line
                className="edge-line"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={isHighlit ? 2.5 : 1.5}
                opacity={isHighlit ? 1 : 0.5}
                markerEnd={
                  directed
                    ? `url(#arrow${state === "mst" ? "-mst" : ""})`
                    : undefined
                }
                filter={isHighlit ? "url(#glow-filter)" : undefined}
                style={{ cursor: mode === "delete" ? "pointer" : "default" }}
              />
              <text
                x={mx}
                y={my - 6}
                textAnchor="middle"
                fontSize="10"
                fill={isHighlit ? color : C.textDim}
                fontFamily="inherit"
                fontWeight={isHighlit ? 700 : 400}
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Edge-from indicator */}
        {edgeFrom && nodeMap[edgeFrom] && (
          <circle
            cx={nodeMap[edgeFrom].x}
            cy={nodeMap[edgeFrom].y}
            r={28}
            fill="none"
            stroke={C.accent}
            strokeWidth={2}
            strokeDasharray="4 4"
            opacity={pulse ? 1 : 0.3}
          />
        )}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const state = getNodeState(node.id);
          const isStart = node.id === startNode;
          const isSelected = node.id === selectedNode;
          const dist = currentStep?.dist?.[node.id];
          const gradId =
            state === "current"
              ? "node-grad-current"
              : state === "mst"
                ? "node-grad-mst"
                : state === "visited"
                  ? "node-grad-visited"
                  : "node-grad-default";
          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              onClick={(e) => handleNodeClick(e, node.id)}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onMouseEnter={() =>
                setTooltip({
                  id: node.id,
                  x: node.x,
                  y: node.y,
                  dist,
                  label: node.label,
                })
              }
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: mode === "select" ? "move" : "pointer" }}
            >
              {/* Outer glow rings */}
              {state === "current" && (
                <circle
                  r={30}
                  fill="none"
                  stroke={C.accent2}
                  strokeWidth={1}
                  opacity={pulse ? 0.6 : 0.2}
                />
              )}
              {isStart && (
                <circle
                  r={26}
                  fill="none"
                  stroke={C.accent}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.6}
                />
              )}
              {isSelected && (
                <circle
                  r={24}
                  fill="none"
                  stroke={C.warn}
                  strokeWidth={2}
                  opacity={0.8}
                />
              )}
              {/* Main circle */}
              <circle
                className="node-circle"
                r={20}
                fill={`url(#${gradId})`}
                stroke={
                  state === "current"
                    ? C.accent2
                    : isStart
                      ? C.accent
                      : C.borderHi
                }
                strokeWidth={state === "current" || isStart ? 2 : 1}
                filter={state === "current" ? "url(#glow-filter)" : undefined}
              />
              {/* Label */}
              <text
                textAnchor="middle"
                dy="4"
                fontSize="11"
                fontWeight="700"
                fill={C.textBright}
                fontFamily="inherit"
              >
                {node.label}
              </text>
              {/* Distance badge */}
              {dist !== undefined && dist !== Infinity && (
                <g transform="translate(12,-12)">
                  <circle
                    r={10}
                    fill={C.card}
                    stroke={C.accent}
                    strokeWidth={1}
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontSize="9"
                    fill={C.accent}
                    fontWeight="700"
                    fontFamily="inherit"
                  >
                    {dist}
                  </text>
                </g>
              )}
              {dist === Infinity && currentStep && (
                <g transform="translate(12,-12)">
                  <circle
                    r={10}
                    fill={C.card}
                    stroke={C.textDim}
                    strokeWidth={1}
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fontSize="8"
                    fill={C.textDim}
                    fontFamily="inherit"
                  >
                    ∞
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <g transform={`translate(${tooltip.x + 25},${tooltip.y - 25})`}>
            <rect
              rx={4}
              ry={4}
              width={80}
              height={32}
              fill={C.card}
              stroke={C.borderHi}
            />
            <text
              x={8}
              y={14}
              fontSize={10}
              fill={C.accent}
              fontFamily="inherit"
              fontWeight={700}
            >
              Node {tooltip.label}
            </text>
            {tooltip.dist !== undefined && (
              <text
                x={8}
                y={26}
                fontSize={9}
                fill={C.textDim}
                fontFamily="inherit"
              >
                d={tooltip.dist === Infinity ? "∞" : tooltip.dist}
              </text>
            )}
          </g>
        )}
      </svg>

      {/* Mode indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          padding: "4px 10px",
          fontSize: 10,
          color: C.textDim,
        }}
      >
        MODE:{" "}
        <span style={{ color: C.accent, fontWeight: 700 }}>
          {mode.toUpperCase()}
        </span>
        {mode === "addNode" && " · Click canvas to place node"}
        {mode === "addEdge" &&
          (edgeFrom
            ? ` · Now click target (from: ${graph.nodes.find((n) => n.id === edgeFrom)?.label})`
            : " · Click source node")}
        {mode === "delete" && " · Click node or edge to delete"}
      </div>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {[
          [C.accent2, "●", "Current node"],
          [C.accent3, "●", "Visited / MST"],
          [C.accent, "—", "Active edge"],
          [C.accent3, "—", "MST edge"],
          [C.accent, "○", "Start node"],
        ].map(([color, sym, label]) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10,
            }}
          >
            <span style={{ color, fontWeight: 700 }}>{sym}</span>
            <span style={{ color: C.textDim }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
