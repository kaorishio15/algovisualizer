import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { C } from "../constants/theme";
import { LA } from "../lib/linearAlgebra";
import { Algorithms } from "../lib/algorithms";
import { Generators } from "../lib/generators";
import GlobalStyles from "./GlobalStyles";
import Header from "./Header";
import LeftPanel from "./LeftPanel";
import CanvasToolbar from "./CanvasToolbar";
import GraphCanvas from "./GraphCanvas";
import RightPanel from "./RightPanel";
import StatusBar from "./StatusBar";

export default function AlgorithmVisualizer() {
  const [graph, setGraph] = useState(() => Generators.random(8, 0.35));
  const [algo, setAlgo] = useState("dijkstra");
  const [startNode, setStartNode] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [mode, setMode] = useState("select"); // select | addNode | addEdge | delete
  const [edgeFrom, setEdgeFrom] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dragNode, setDragNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showJSON, setShowJSON] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [newEdgeWeight, setNewEdgeWeight] = useState(5);
  const [directed, setDirected] = useState(false);
  const [showMetrics] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [animTick, setAnimTick] = useState(0);
  const playRef = useRef(null);
  const animRef = useRef(null);

  // Pulse animation tick
  useEffect(() => {
    animRef.current = setInterval(() => setAnimTick((t) => t + 1), 100);
    return () => clearInterval(animRef.current);
  }, []);

  const currentStep = steps[stepIdx] || null;

  // Compute metrics
  const metrics = useMemo(() => {
    const deg = LA.degreeVector(graph.nodes, graph.edges);
    const degs = Object.values(deg);
    const avgDeg = degs.length
      ? (degs.reduce((a, b) => a + b, 0) / degs.length).toFixed(2)
      : 0;
    const maxDeg = degs.length ? Math.max(...degs) : 0;
    const density =
      graph.nodes.length > 1
        ? (
            graph.edges.length /
            ((graph.nodes.length * (graph.nodes.length - 1)) / 2)
          ).toFixed(3)
        : "0";
    return {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      avgDeg,
      maxDeg,
      density,
    };
  }, [graph]);

  // Auto-play
  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setStepIdx((i) => {
          if (i >= steps.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, speed);
    }
    return () => clearInterval(playRef.current);
  }, [playing, speed, steps.length]);

  const runAlgo = useCallback(() => {
    const src = startNode || graph.nodes[0]?.id;
    if (!src) return;
    let s = [];
    try {
      if (algo === "dijkstra")
        s = Algorithms.dijkstra(graph.nodes, graph.edges, src);
      else if (algo === "bfs")
        s = Algorithms.bfs(graph.nodes, graph.edges, src);
      else if (algo === "dfs")
        s = Algorithms.dfs(graph.nodes, graph.edges, src);
      else if (algo === "prim")
        s = Algorithms.prim(graph.nodes, graph.edges, src);
      else if (algo === "kruskal")
        s = Algorithms.kruskal(graph.nodes, graph.edges);
      else if (algo === "bellmanFord")
        s = Algorithms.bellmanFord(graph.nodes, graph.edges, src);
    } catch (e) {
      console.error(e);
    }
    setSteps(s);
    setStepIdx(0);
    setPlaying(false);
  }, [algo, graph, startNode]);

  const pulse = animTick % 10 < 5;

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        background: C.bg,
        height: "100vh",
        color: C.text,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <GlobalStyles />

      <Header
        algo={algo}
        setAlgo={setAlgo}
        setSteps={setSteps}
        setStepIdx={setStepIdx}
        directed={directed}
        setDirected={setDirected}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          overflowX: "auto",
          minHeight: 0,
        }}
      >
        <LeftPanel
          algo={algo}
          mode={mode}
          setMode={setMode}
          edgeFrom={edgeFrom}
          setEdgeFrom={setEdgeFrom}
          newEdgeWeight={newEdgeWeight}
          setNewEdgeWeight={setNewEdgeWeight}
          setGraph={setGraph}
          setSteps={setSteps}
          setStepIdx={setStepIdx}
          setStartNode={setStartNode}
          setSelectedNode={setSelectedNode}
          showJSON={showJSON}
          setShowJSON={setShowJSON}
          jsonInput={jsonInput}
          setJsonInput={setJsonInput}
          jsonError={jsonError}
          setJsonError={setJsonError}
          graph={graph}
          showMetrics={showMetrics}
          metrics={metrics}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: "320px",
            minHeight: 0,
          }}
        >
          <CanvasToolbar
            algo={algo}
            runAlgo={runAlgo}
            playing={playing}
            setPlaying={setPlaying}
            steps={steps}
            stepIdx={stepIdx}
            setStepIdx={setStepIdx}
            speed={speed}
            setSpeed={setSpeed}
            startNode={startNode}
            graph={graph}
            currentStep={currentStep}
          />
          <GraphCanvas
            graph={graph}
            setGraph={setGraph}
            mode={mode}
            edgeFrom={edgeFrom}
            setEdgeFrom={setEdgeFrom}
            newEdgeWeight={newEdgeWeight}
            directed={directed}
            startNode={startNode}
            setStartNode={setStartNode}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            dragNode={dragNode}
            setDragNode={setDragNode}
            dragOffset={dragOffset}
            setDragOffset={setDragOffset}
            tooltip={tooltip}
            setTooltip={setTooltip}
            currentStep={currentStep}
            pulse={pulse}
          />
        </div>

        <RightPanel algo={algo} graph={graph} currentStep={currentStep} />
      </div>

      <StatusBar metrics={metrics} startNode={startNode} graph={graph} />
    </div>
  );
}
