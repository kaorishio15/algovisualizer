import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = {
  bg: "#0a0a0f",
  panel: "#0f0f1a",
  border: "#1e1e3a",
  accent: "#00ff88",
  accent2: "#00aaff",
  accent3: "#ff6b6b",
  accent4: "#ffd700",
  text: "#e0e0ff",
  muted: "#555577",
  highlight: "#1a1a2e",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── SORTING ALGORITHMS ───────────────────────────────────────────────────────

async function bubbleSort(arr, setArr, setHighlight, setComparing, speed) {
  let a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      setComparing([j, j + 1]);
      await sleep(speed);
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        setArr([...a]);
        setHighlight([j, j + 1]);
        await sleep(speed);
      }
    }
  }
  setComparing([]);
  setHighlight([]);
}

async function mergeSort(arr, setArr, setHighlight, setComparing, speed) {
  let a = [...arr];
  async function mergeSortHelper(arr, left, right) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    await mergeSortHelper(arr, left, mid);
    await mergeSortHelper(arr, mid + 1, right);
    await merge(arr, left, mid, right);
  }
  async function merge(arr, left, mid, right) {
    const L = arr.slice(left, mid + 1);
    const R = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < L.length && j < R.length) {
      setComparing([left + i, mid + 1 + j]);
      await sleep(speed);
      if (L[i] <= R[j]) { arr[k++] = L[i++]; }
      else { arr[k++] = R[j++]; }
      setArr([...arr]);
      setHighlight([k - 1]);
      await sleep(speed / 2);
    }
    while (i < L.length) { arr[k++] = L[i++]; setArr([...arr]); await sleep(speed / 2); }
    while (j < R.length) { arr[k++] = R[j++]; setArr([...arr]); await sleep(speed / 2); }
  }
  await mergeSortHelper(a, 0, a.length - 1);
  setComparing([]);
  setHighlight([]);
}

async function quickSort(arr, setArr, setHighlight, setComparing, speed) {
  let a = [...arr];
  async function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      setComparing([j, high]);
      await sleep(speed);
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArr([...arr]);
        setHighlight([i, j]);
        await sleep(speed / 2);
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArr([...arr]);
    return i + 1;
  }
  async function qs(arr, low, high) {
    if (low < high) {
      const pi = await partition(arr, low, high);
      await qs(arr, low, pi - 1);
      await qs(arr, pi + 1, high);
    }
  }
  await qs(a, 0, a.length - 1);
  setComparing([]);
  setHighlight([]);
}

async function insertionSort(arr, setArr, setHighlight, setComparing, speed) {
  let a = [...arr];
  for (let i = 1; i < a.length; i++) {
    let key = a[i], j = i - 1;
    setHighlight([i]);
    while (j >= 0 && a[j] > key) {
      setComparing([j, j + 1]);
      a[j + 1] = a[j];
      setArr([...a]);
      await sleep(speed);
      j--;
    }
    a[j + 1] = key;
    setArr([...a]);
    await sleep(speed / 2);
  }
  setComparing([]);
  setHighlight([]);
}

// ─── GRAPH ALGORITHMS ─────────────────────────────────────────────────────────

const GRAPH_NODES = [
  { id: 0, x: 120, y: 80, label: "A" },
  { id: 1, x: 280, y: 60, label: "B" },
  { id: 2, x: 440, y: 100, label: "C" },
  { id: 3, x: 180, y: 200, label: "D" },
  { id: 4, x: 340, y: 220, label: "E" },
  { id: 5, x: 500, y: 240, label: "F" },
  { id: 6, x: 240, y: 320, label: "G" },
  { id: 7, x: 420, y: 340, label: "H" },
];

const GRAPH_EDGES = [
  { u: 0, v: 1, w: 4 }, { u: 0, v: 3, w: 2 },
  { u: 1, v: 2, w: 3 }, { u: 1, v: 3, w: 5 }, { u: 1, v: 4, w: 1 },
  { u: 2, v: 4, w: 6 }, { u: 2, v: 5, w: 2 },
  { u: 3, v: 4, w: 3 }, { u: 3, v: 6, w: 7 },
  { u: 4, v: 5, w: 4 }, { u: 4, v: 6, w: 2 }, { u: 4, v: 7, w: 5 },
  { u: 5, v: 7, w: 3 },
  { u: 6, v: 7, w: 6 },
];

async function dijkstra(nodes, edges, source, setNodeState, setEdgeState, setDistances, speed) {
  const n = nodes.length;
  const dist = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(({ u, v, w }) => { adj[u].push({ to: v, w }); adj[v].push({ to: u, w }); });
  
  dist[source] = 0;
  setDistances([...dist]);
  
  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!visited[i] && (u === -1 || dist[i] < dist[u])) u = i;
    if (dist[u] === Infinity) break;
    visited[u] = true;
    setNodeState(prev => ({ ...prev, [u]: "visited" }));
    await sleep(speed * 2);
    
    for (const { to, w } of adj[u]) {
      setNodeState(prev => ({ ...prev, [to]: prev[to] === "visited" ? "visited" : "checking" }));
      const edgeKey = `${Math.min(u, to)}-${Math.max(u, to)}`;
      setEdgeState(prev => ({ ...prev, [edgeKey]: "checking" }));
      await sleep(speed);
      if (dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w;
        setDistances([...dist]);
        setEdgeState(prev => ({ ...prev, [edgeKey]: "relaxed" }));
      }
      await sleep(speed / 2);
    }
  }
}

async function primMST(nodes, edges, setNodeState, setEdgeState, setMSTEdges, speed) {
  const n = nodes.length;
  const inMST = new Array(n).fill(false);
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(({ u, v, w }) => { adj[u].push({ to: v, w, eu: u, ev: v }); adj[v].push({ to: u, w, eu: u, ev: v }); });
  
  inMST[0] = true;
  setNodeState({ 0: "visited" });
  const mstEdges = [];
  
  for (let iter = 0; iter < n - 1; iter++) {
    let bestEdge = null, bestW = Infinity;
    for (let u = 0; u < n; u++) {
      if (!inMST[u]) continue;
      for (const { to, w, eu, ev } of adj[u]) {
        if (!inMST[to]) {
          const key = `${Math.min(eu, ev)}-${Math.max(eu, ev)}`;
          setEdgeState(prev => ({ ...prev, [key]: "checking" }));
          if (w < bestW) { bestW = w; bestEdge = { u, v: to, eu, ev }; }
        }
      }
    }
    await sleep(speed * 2);
    if (!bestEdge) break;
    inMST[bestEdge.v] = true;
    const key = `${Math.min(bestEdge.eu, bestEdge.ev)}-${Math.max(bestEdge.eu, bestEdge.ev)}`;
    mstEdges.push(key);
    setMSTEdges([...mstEdges]);
    setEdgeState(prev => ({ ...prev, [key]: "mst" }));
    setNodeState(prev => ({ ...prev, [bestEdge.v]: "visited" }));
    await sleep(speed);
  }
}

async function kruskalMST(nodes, edges, setNodeState, setEdgeState, setMSTEdges, speed) {
  const n = nodes.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  function find(x) { if (parent[x] !== x) parent[x] = find(parent[x]); return parent[x]; }
  function union(x, y) {
    const px = find(x), py = find(y);
    if (px === py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
    return true;
  }
  
  const sorted = [...edges].sort((a, b) => a.w - b.w);
  const mstEdges = [];
  
  for (const { u, v, w } of sorted) {
    const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
    setEdgeState(prev => ({ ...prev, [key]: "checking" }));
    await sleep(speed * 1.5);
    if (union(u, v)) {
      mstEdges.push(key);
      setMSTEdges([...mstEdges]);
      setEdgeState(prev => ({ ...prev, [key]: "mst" }));
      setNodeState(prev => ({ ...prev, [u]: "visited", [v]: "visited" }));
    } else {
      setEdgeState(prev => ({ ...prev, [key]: "rejected" }));
    }
    await sleep(speed / 2);
  }
}

// ─── COMPLEXITY DATA ──────────────────────────────────────────────────────────
const ALGO_INFO = {
  bubble: { name: "Bubble Sort", time: "O(n²)", space: "O(1)", best: "O(n)", desc: "Repeatedly swaps adjacent elements if they're in the wrong order. Simple but inefficient for large datasets." },
  merge: { name: "Merge Sort", time: "O(n log n)", space: "O(n)", best: "O(n log n)", desc: "Divides array in half, recursively sorts each half, then merges. Stable and consistent performance." },
  quick: { name: "Quick Sort", time: "O(n²) worst", space: "O(log n)", best: "O(n log n)", desc: "Picks a pivot, partitions around it, recursively sorts partitions. Fast in practice with good pivot choice." },
  insertion: { name: "Insertion Sort", time: "O(n²)", space: "O(1)", best: "O(n)", desc: "Builds sorted array one element at a time. Efficient for small or nearly sorted arrays." },
  dijkstra: { name: "Dijkstra's Algorithm", time: "O((V+E) log V)", space: "O(V)", best: "O((V+E) log V)", desc: "Finds shortest paths from source to all nodes in a weighted graph. Greedy approach using a priority queue." },
  prim: { name: "Prim's Algorithm", time: "O(E log V)", space: "O(V)", best: "O(E log V)", desc: "Builds MST by greedily adding the minimum weight edge that connects a new node to the growing tree." },
  kruskal: { name: "Kruskal's Algorithm", time: "O(E log E)", space: "O(V)", best: "O(E log E)", desc: "Builds MST by sorting edges and adding them if they don't form a cycle (using Union-Find)." },
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function ComplexityBadge({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: COLORS.highlight, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 16px", minWidth: 90 }}>
      <span style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace" }}>{label}</span>
      <span style={{ fontSize: 14, color, fontWeight: 700, fontFamily: "monospace", marginTop: 2 }}>{value}</span>
    </div>
  );
}

function SortingVisualizer({ algo, speed }) {
  const [arr, setArr] = useState([]);
  const [highlight, setHighlight] = useState([]);
  const [comparing, setComparing] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const generate = useCallback(() => {
    const a = Array.from({ length: 40 }, () => Math.floor(Math.random() * 90) + 10);
    setArr(a);
    setHighlight([]);
    setComparing([]);
    setDone(false);
  }, []);

  useEffect(() => { generate(); }, [algo]);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setDone(false);
    const fn = { bubble: bubbleSort, merge: mergeSort, quick: quickSort, insertion: insertionSort }[algo];
    await fn(arr, setArr, setHighlight, setComparing, speed);
    setRunning(false);
    setDone(true);
    setHighlight([]);
    setComparing([]);
  };

  const maxVal = Math.max(...arr, 1);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={generate} disabled={running} style={btnStyle(COLORS.accent2, running)}>↺ New Array</button>
        <button onClick={run} disabled={running} style={btnStyle(COLORS.accent, running)}>
          {running ? "⏳ Sorting..." : done ? "✓ Done — Run Again" : "▶ Start"}
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 200, padding: "0 4px" }}>
        {arr.map((v, i) => {
          let color = COLORS.accent2;
          if (comparing.includes(i)) color = COLORS.accent3;
          else if (highlight.includes(i)) color = COLORS.accent;
          else if (done) color = COLORS.accent;
          return (
            <div key={i} style={{ flex: 1, height: `${(v / maxVal) * 100}%`, background: color, borderRadius: "2px 2px 0 0", transition: "height 0.05s, background 0.1s", minWidth: 2 }} />
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, fontFamily: "monospace" }}>
        <span style={{ color: COLORS.accent2 }}>■ Unsorted</span>
        <span style={{ color: COLORS.accent3 }}>■ Comparing</span>
        <span style={{ color: COLORS.accent }}>■ Swapped / Sorted</span>
      </div>
    </div>
  );
}

function GraphVisualizer({ algo, speed }) {
  const [nodeState, setNodeState] = useState({});
  const [edgeState, setEdgeState] = useState({});
  const [distances, setDistances] = useState([]);
  const [mstEdges, setMSTEdges] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => { setNodeState({}); setEdgeState({}); setDistances([]); setMSTEdges([]); setDone(false); };
  useEffect(() => { reset(); }, [algo]);

  const run = async () => {
    if (running) return;
    reset();
    setRunning(true);
    if (algo === "dijkstra") {
      await dijkstra(GRAPH_NODES, GRAPH_EDGES, 0, setNodeState, setEdgeState, setDistances, speed);
    } else if (algo === "prim") {
      await primMST(GRAPH_NODES, GRAPH_EDGES, setNodeState, setEdgeState, setMSTEdges, speed);
    } else if (algo === "kruskal") {
      await kruskalMST(GRAPH_NODES, GRAPH_EDGES, setNodeState, setEdgeState, setMSTEdges, speed);
    }
    setRunning(false);
    setDone(true);
  };

  const getEdgeColor = (u, v) => {
    const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
    const s = edgeState[key];
    if (s === "mst") return COLORS.accent;
    if (s === "relaxed") return COLORS.accent4;
    if (s === "checking") return COLORS.accent3;
    if (s === "rejected") return "#333355";
    return COLORS.border;
  };

  const getNodeColor = (id) => {
    const s = nodeState[id];
    if (s === "visited") return COLORS.accent;
    if (s === "checking") return COLORS.accent3;
    return COLORS.accent2;
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={reset} disabled={running} style={btnStyle(COLORS.accent2, running)}>↺ Reset</button>
        <button onClick={run} disabled={running} style={btnStyle(COLORS.accent, running)}>
          {running ? "⏳ Running..." : done ? "✓ Done — Run Again" : "▶ Start"}
        </button>
      </div>
      <svg width="100%" viewBox="0 0 620 400" style={{ background: COLORS.highlight, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
        {GRAPH_EDGES.map(({ u, v, w }) => {
          const nu = GRAPH_NODES[u], nv = GRAPH_NODES[v];
          const mx = (nu.x + nv.x) / 2, my = (nu.y + nv.y) / 2;
          const key = `${Math.min(u, v)}-${Math.max(u, v)}`;
          const isMST = edgeState[key] === "mst";
          return (
            <g key={key}>
              <line x1={nu.x} y1={nu.y} x2={nv.x} y2={nv.y} stroke={getEdgeColor(u, v)} strokeWidth={isMST ? 3 : 1.5} strokeOpacity={0.85} />
              <text x={mx} y={my - 5} fill={COLORS.muted} fontSize="11" textAnchor="middle" fontFamily="monospace">{w}</text>
            </g>
          );
        })}
        {GRAPH_NODES.map(({ id, x, y, label }) => {
          const c = getNodeColor(id);
          const dist = distances[id];
          return (
            <g key={id}>
              <circle cx={x} cy={y} r={22} fill={COLORS.panel} stroke={c} strokeWidth={2} />
              <text x={x} y={y + 5} fill={c} fontSize="14" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{label}</text>
              {dist !== undefined && dist !== Infinity && (
                <text x={x} y={y + 38} fill={COLORS.accent4} fontSize="11" textAnchor="middle" fontFamily="monospace">{dist}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, fontFamily: "monospace", flexWrap: "wrap" }}>
        <span style={{ color: COLORS.accent2 }}>■ Unvisited</span>
        <span style={{ color: COLORS.accent3 }}>■ Checking</span>
        <span style={{ color: COLORS.accent }}>■ {algo === "dijkstra" ? "Visited" : "In MST"}</span>
        {algo === "dijkstra" && <span style={{ color: COLORS.accent4 }}>■ Relaxed  <span style={{ color: COLORS.muted }}>(dist shown below node)</span></span>}
        {algo !== "dijkstra" && <span style={{ color: "#333355" }}>■ Rejected (cycle)</span>}
      </div>
    </div>
  );
}

function btnStyle(color, disabled) {
  return {
    padding: "8px 20px", borderRadius: 6, border: `1px solid ${color}`,
    background: disabled ? COLORS.highlight : `${color}22`,
    color: disabled ? COLORS.muted : color,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "monospace", fontSize: 13, fontWeight: 700, letterSpacing: 1,
    transition: "all 0.2s",
  };
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "sorting", label: "SORTING", algos: ["bubble", "merge", "quick", "insertion"] },
  { id: "graph", label: "GRAPH", algos: ["dijkstra", "prim", "kruskal"] },
];

export default function AlgoVisualizer() {
  const [tab, setTab] = useState("sorting");
  const [algo, setAlgo] = useState("bubble");
  const [speed, setSpeed] = useState(80);

  const currentTab = TABS.find(t => t.id === tab);
  const info = ALGO_INFO[algo];

  const switchTab = (t) => {
    setTab(t.id);
    setAlgo(t.algos[0]);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Courier New', monospace", padding: "24px 16px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0f; } ::-webkit-scrollbar-thumb { background: #1e1e3a; }
        body { margin: 0; background: #0a0a0f; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontFamily: "Orbitron, monospace", fontSize: 28, fontWeight: 900, color: COLORS.accent, letterSpacing: 4, textShadow: `0 0 20px ${COLORS.accent}55` }}>
          ALGOVISUALIZER
        </div>
        <div style={{ color: COLORS.muted, fontSize: 12, letterSpacing: 3, marginTop: 4 }}>INTERACTIVE ALGORITHM EXPLORER</div>
      </div>

      {/* Tab selector */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => switchTab(t)} style={{
            padding: "8px 28px", borderRadius: 6, border: `1px solid ${tab === t.id ? COLORS.accent : COLORS.border}`,
            background: tab === t.id ? `${COLORS.accent}18` : "transparent",
            color: tab === t.id ? COLORS.accent : COLORS.muted,
            cursor: "pointer", fontFamily: "Orbitron, monospace", fontSize: 12, letterSpacing: 2, fontWeight: 700,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Algorithm selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {currentTab.algos.map(a => (
            <button key={a} onClick={() => setAlgo(a)} style={{
              padding: "6px 16px", borderRadius: 20, border: `1px solid ${algo === a ? COLORS.accent2 : COLORS.border}`,
              background: algo === a ? `${COLORS.accent2}22` : "transparent",
              color: algo === a ? COLORS.accent2 : COLORS.muted,
              cursor: "pointer", fontFamily: "monospace", fontSize: 12, letterSpacing: 1,
            }}>{ALGO_INFO[a].name}</button>
          ))}
        </div>

        {/* Speed control */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ color: COLORS.muted, fontSize: 11, letterSpacing: 2, minWidth: 60 }}>SPEED</span>
          <input type="range" min={10} max={300} value={300 - speed + 10} onChange={e => setSpeed(300 - parseInt(e.target.value) + 10)}
            style={{ flex: 1, accentColor: COLORS.accent, cursor: "pointer" }} />
          <span style={{ color: COLORS.accent, fontSize: 11, fontFamily: "monospace", minWidth: 40 }}>
            {speed < 50 ? "FAST" : speed < 150 ? "MED" : "SLOW"}
          </span>
        </div>

        {/* Visualizer panel */}
        <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
          {tab === "sorting"
            ? <SortingVisualizer algo={algo} speed={speed} key={algo} />
            : <GraphVisualizer algo={algo} speed={speed} key={algo} />
          }
        </div>

        {/* Info panel */}
        <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: "Orbitron, monospace", fontSize: 14, color: COLORS.accent, letterSpacing: 2, marginBottom: 16 }}>
            {info.name.toUpperCase()}
          </div>
          <p style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.7, marginBottom: 20, opacity: 0.85 }}>{info.desc}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <ComplexityBadge label="Time (Avg)" value={info.time} color={COLORS.accent3} />
            <ComplexityBadge label="Best Case" value={info.best} color={COLORS.accent4} />
            <ComplexityBadge label="Space" value={info.space} color={COLORS.accent2} />
          </div>
        </div>
      </div>
    </div>
  );
}
