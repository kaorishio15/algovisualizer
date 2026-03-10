import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Linear Algebra Utilities ────────────────────────────────────────────────
const LA = {
  // Adjacency matrix ops
  matMul: (A, B) => A.map((row, i) => B[0].map((_, j) => row.reduce((s, _, k) => s + A[i][k] * B[k][j], 0))),
  transpose: (M) => M[0].map((_, j) => M.map(row => row[j])),
  toAdjMatrix: (nodes, edges) => {
    const n = nodes.length, idx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));
    const M = Array.from({ length: n }, () => Array(n).fill(Infinity));
    nodes.forEach((_, i) => M[i][i] = 0);
    edges.forEach(e => { const u = idx[e.from], v = idx[e.to]; if (u !== undefined && v !== undefined) { M[u][v] = e.weight; if (!e.directed) M[v][u] = e.weight; } });
    return { M, idx };
  },
  // Degree vector for scale-free metrics
  degreeVector: (nodes, edges) => {
    const deg = Object.fromEntries(nodes.map(n => [n.id, 0]));
    edges.forEach(e => { if (deg[e.from] !== undefined) deg[e.from]++; if (deg[e.to] !== undefined) deg[e.to]++; });
    return deg;
  }
};

// ─── Min-Heap with Locators ───────────────────────────────────────────────────
class MinHeap {
  constructor() { this.heap = []; this.locator = new Map(); }
  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    this.locator.set(this.heap[i].id, i);
    this.locator.set(this.heap[j].id, j);
  }
  _bubbleUp(i) { while (i > 0) { const p = (i - 1) >> 1; if (this.heap[p].key <= this.heap[i].key) break; this._swap(i, p); i = p; } }
  _siftDown(i) { const n = this.heap.length; while (true) { let s = i, l = 2*i+1, r = 2*i+2; if (l < n && this.heap[l].key < this.heap[s].key) s = l; if (r < n && this.heap[r].key < this.heap[s].key) s = r; if (s === i) break; this._swap(i, s); i = s; } }
  insert(id, key) { const e = { id, key }; this.heap.push(e); this.locator.set(id, this.heap.length - 1); this._bubbleUp(this.heap.length - 1); }
  decreaseKey(id, key) { const i = this.locator.get(id); if (i === undefined) return; this.heap[i].key = key; this._bubbleUp(i); }
  extractMin() { if (!this.heap.length) return null; this._swap(0, this.heap.length - 1); const min = this.heap.pop(); this.locator.delete(min.id); if (this.heap.length) this._siftDown(0); return min; }
  isEmpty() { return this.heap.length === 0; }
  has(id) { return this.locator.has(id); }
}

// ─── Union-Find for Kruskal ───────────────────────────────────────────────────
class UnionFind {
  constructor(ids) { this.parent = Object.fromEntries(ids.map(id => [id, id])); this.rank = Object.fromEntries(ids.map(id => [id, 0])); }
  find(x) { if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]); return this.parent[x]; }
  union(x, y) { const px = this.find(x), py = this.find(y); if (px === py) return false; if (this.rank[px] < this.rank[py]) this.parent[px] = py; else if (this.rank[px] > this.rank[py]) this.parent[py] = px; else { this.parent[py] = px; this.rank[px]++; } return true; }
}

// ─── Algorithm Implementations ────────────────────────────────────────────────
const Algorithms = {
  dijkstra(nodes, edges, startId) {
    const steps = [];
    const dist = Object.fromEntries(nodes.map(n => [n.id, Infinity]));
    const prev = Object.fromEntries(nodes.map(n => [n.id, null]));
    dist[startId] = 0;
    const heap = new MinHeap();
    nodes.forEach(n => heap.insert(n.id, n.id === startId ? 0 : Infinity));
    const visited = new Set();
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => { adj[e.from]?.push({ to: e.to, w: e.weight }); if (!e.directed) adj[e.to]?.push({ to: e.from, w: e.weight }); });
    steps.push({ type: 'init', dist: { ...dist }, visited: new Set(), current: startId, highlight: [] });
    while (!heap.isEmpty()) {
      const { id: u } = heap.extractMin();
      if (visited.has(u)) continue;
      visited.add(u);
      steps.push({ type: 'visit', dist: { ...dist }, visited: new Set(visited), current: u, highlight: [] });
      for (const { to: v, w } of (adj[u] || [])) {
        const nd = dist[u] + w;
        steps.push({ type: 'relax', dist: { ...dist }, visited: new Set(visited), current: u, highlight: [{ from: u, to: v }] });
        if (nd < dist[v]) {
          dist[v] = nd; prev[v] = u;
          if (heap.has(v)) heap.decreaseKey(v, nd);
          steps.push({ type: 'update', dist: { ...dist }, visited: new Set(visited), current: v, highlight: [{ from: u, to: v }] });
        }
      }
    }
    steps.push({ type: 'done', dist: { ...dist }, prev, visited: new Set(visited), current: null, highlight: [] });
    return steps;
  },

  bfs(nodes, edges, startId) {
    const steps = [];
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => { adj[e.from]?.push(e.to); if (!e.directed) adj[e.to]?.push(e.from); });
    const visited = new Set([startId]);
    const queue = [startId];
    const dist = Object.fromEntries(nodes.map(n => [n.id, n.id === startId ? 0 : Infinity]));
    steps.push({ type: 'init', visited: new Set(visited), queue: [...queue], current: startId, highlight: [] });
    while (queue.length) {
      const u = queue.shift();
      steps.push({ type: 'visit', visited: new Set(visited), queue: [...queue], current: u, highlight: [] });
      for (const v of (adj[u] || [])) {
        if (!visited.has(v)) {
          visited.add(v); queue.push(v);
          dist[v] = dist[u] + 1;
          steps.push({ type: 'discover', visited: new Set(visited), queue: [...queue], current: u, highlight: [{ from: u, to: v }] });
        }
      }
    }
    steps.push({ type: 'done', visited: new Set(visited), queue: [], current: null, highlight: [], dist });
    return steps;
  },

  dfs(nodes, edges, startId) {
    const steps = [];
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => { adj[e.from]?.push(e.to); if (!e.directed) adj[e.to]?.push(e.from); });
    const visited = new Set();
    const stack = [];
    const recurse = (u) => {
      visited.add(u); stack.push(u);
      steps.push({ type: 'visit', visited: new Set(visited), stack: [...stack], current: u, highlight: [] });
      for (const v of (adj[u] || [])) {
        if (!visited.has(v)) {
          steps.push({ type: 'explore', visited: new Set(visited), stack: [...stack], current: u, highlight: [{ from: u, to: v }] });
          recurse(v);
        }
      }
      stack.pop();
      steps.push({ type: 'backtrack', visited: new Set(visited), stack: [...stack], current: u, highlight: [] });
    };
    recurse(startId);
    steps.push({ type: 'done', visited: new Set(visited), stack: [], current: null, highlight: [] });
    return steps;
  },

  prim(nodes, edges, startId) {
    const steps = [];
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => { adj[e.from]?.push({ to: e.to, w: e.weight, eid: e.id }); adj[e.to]?.push({ to: e.from, w: e.weight, eid: e.id }); });
    const inMST = new Set([startId]);
    const mstEdges = new Set();
    const key = Object.fromEntries(nodes.map(n => [n.id, Infinity]));
    const edgeTo = Object.fromEntries(nodes.map(n => [n.id, null]));
    key[startId] = 0;
    const heap = new MinHeap();
    nodes.forEach(n => heap.insert(n.id, n.id === startId ? 0 : Infinity));
    steps.push({ type: 'init', inMST: new Set(inMST), mstEdges: new Set(), current: startId, highlight: [] });
    while (!heap.isEmpty()) {
      const { id: u } = heap.extractMin();
      if (inMST.has(u) && u !== startId) continue;
      inMST.add(u);
      if (edgeTo[u]) mstEdges.add(edgeTo[u]);
      steps.push({ type: 'add', inMST: new Set(inMST), mstEdges: new Set(mstEdges), current: u, highlight: edgeTo[u] ? [{ eid: edgeTo[u] }] : [] });
      for (const { to: v, w, eid } of (adj[u] || [])) {
        if (!inMST.has(v) && w < key[v]) {
          key[v] = w; edgeTo[v] = eid;
          if (heap.has(v)) heap.decreaseKey(v, w);
          steps.push({ type: 'relax', inMST: new Set(inMST), mstEdges: new Set(mstEdges), current: u, highlight: [{ from: u, to: v }] });
        }
      }
    }
    steps.push({ type: 'done', inMST: new Set(inMST), mstEdges: new Set(mstEdges), current: null, highlight: [] });
    return steps;
  },

  kruskal(nodes, edges) {
    const steps = [];
    const sorted = [...edges].sort((a, b) => a.weight - b.weight);
    const uf = new UnionFind(nodes.map(n => n.id));
    const mstEdges = new Set();
    steps.push({ type: 'init', mstEdges: new Set(), current: null, highlight: [] });
    for (const e of sorted) {
      steps.push({ type: 'consider', mstEdges: new Set(mstEdges), current: null, highlight: [{ from: e.from, to: e.to }], edge: e });
      if (uf.union(e.from, e.to)) {
        mstEdges.add(e.id);
        steps.push({ type: 'add', mstEdges: new Set(mstEdges), current: null, highlight: [{ eid: e.id }] });
      } else {
        steps.push({ type: 'reject', mstEdges: new Set(mstEdges), current: null, highlight: [], edge: e });
      }
    }
    steps.push({ type: 'done', mstEdges: new Set(mstEdges), current: null, highlight: [] });
    return steps;
  },

  bellmanFord(nodes, edges, startId) {
    const steps = [];
    const dist = Object.fromEntries(nodes.map(n => [n.id, Infinity]));
    const prev = Object.fromEntries(nodes.map(n => [n.id, null]));
    dist[startId] = 0;
    steps.push({ type: 'init', dist: { ...dist }, current: startId, highlight: [], negCycle: false });
    for (let i = 0; i < nodes.length - 1; i++) {
      let updated = false;
      for (const e of edges) {
        steps.push({ type: 'relax', dist: { ...dist }, current: e.from, highlight: [{ from: e.from, to: e.to }], iter: i });
        if (dist[e.from] !== Infinity && dist[e.from] + e.weight < dist[e.to]) {
          dist[e.to] = dist[e.from] + e.weight; prev[e.to] = e.from; updated = true;
          steps.push({ type: 'update', dist: { ...dist }, current: e.to, highlight: [{ from: e.from, to: e.to }], iter: i });
        }
        if (!e.directed && dist[e.to] !== Infinity && dist[e.to] + e.weight < dist[e.from]) {
          dist[e.from] = dist[e.to] + e.weight; prev[e.from] = e.to; updated = true;
          steps.push({ type: 'update', dist: { ...dist }, current: e.from, highlight: [{ from: e.to, to: e.from }], iter: i });
        }
      }
      if (!updated) break;
    }
    let negCycle = false;
    for (const e of edges) {
      if (dist[e.from] !== Infinity && dist[e.from] + e.weight < dist[e.to]) { negCycle = true; break; }
    }
    steps.push({ type: 'done', dist: { ...dist }, prev, current: null, highlight: [], negCycle });
    return steps;
  }
};

// ─── Graph Generators ─────────────────────────────────────────────────────────
let _eid = 0;
const eid = () => `e${_eid++}`;
const Generators = {
  random(nodeCount = 8, edgeDensity = 0.3) {
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `n${i}`, label: `${i}`,
      x: 80 + Math.random() * 640, y: 80 + Math.random() * 440
    }));
    const edges = [];
    for (let i = 0; i < nodeCount; i++)
      for (let j = i + 1; j < nodeCount; j++)
        if (Math.random() < edgeDensity)
          edges.push({ id: eid(), from: `n${i}`, to: `n${j}`, weight: Math.floor(Math.random() * 19) + 1, directed: false });
    return { nodes, edges };
  },
  dense(n = 10) { return Generators.random(n, 0.7); },
  sparse(n = 12) { return Generators.random(n, 0.15); },
  grid(rows = 4, cols = 4) {
    const nodes = [], edges = [];
    const id = (r, c) => `n${r * cols + c}`;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        nodes.push({ id: id(r, c), label: `${r * cols + c}`, x: 80 + c * 130, y: 80 + r * 120 });
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (c + 1 < cols) edges.push({ id: eid(), from: id(r, c), to: id(r, c + 1), weight: Math.floor(Math.random() * 9) + 1, directed: false });
        if (r + 1 < rows) edges.push({ id: eid(), from: id(r, c), to: id(r + 1, c), weight: Math.floor(Math.random() * 9) + 1, directed: false });
      }
    return { nodes, edges };
  },
  tree(n = 10) {
    const nodes = [{ id: 'n0', label: '0', x: 400, y: 60 }];
    const edges = [];
    const levelW = [400], levelY = [60];
    for (let i = 1; i < n; i++) {
      const parent = Math.floor((i - 1) / 2);
      const isLeft = (i - 1) % 2 === 0;
      const px = nodes[parent].x, py = nodes[parent].y;
      const spread = 200 / (Math.floor(Math.log2(i)) + 1);
      const x = px + (isLeft ? -spread : spread);
      const y = py + 100;
      nodes.push({ id: `n${i}`, label: `${i}`, x, y });
      edges.push({ id: eid(), from: `n${parent}`, to: `n${i}`, weight: Math.floor(Math.random() * 9) + 1, directed: false });
    }
    return { nodes, edges };
  },
  scaleFree(n = 12) {
    const nodes = [
      { id: 'n0', label: '0', x: 400, y: 300 },
      { id: 'n1', label: '1', x: 500, y: 300 }
    ];
    const edges = [{ id: eid(), from: 'n0', to: 'n1', weight: Math.floor(Math.random() * 9) + 1, directed: false }];
    const deg = { n0: 1, n1: 1 };
    for (let i = 2; i < n; i++) {
      const id = `n${i}`;
      const angle = (i / n) * Math.PI * 2;
      const r = 80 + Math.random() * 200;
      nodes.push({ id, label: `${i}`, x: 400 + Math.cos(angle) * r, y: 300 + Math.sin(angle) * r });
      deg[id] = 0;
      const totalDeg = Object.values(deg).reduce((a, b) => a + b, 0);
      const m = Math.min(2, nodes.length - 1);
      const chosen = new Set();
      let attempts = 0;
      while (chosen.size < m && attempts < 100) {
        let r2 = Math.random() * totalDeg, cum = 0;
        for (const [nid, d] of Object.entries(deg)) {
          if (nid === id) continue;
          cum += d;
          if (r2 <= cum && !chosen.has(nid)) { chosen.add(nid); break; }
        }
        attempts++;
      }
      for (const target of chosen) {
        edges.push({ id: eid(), from: id, to: target, weight: Math.floor(Math.random() * 9) + 1, directed: false });
        deg[id]++; deg[target]++;
      }
    }
    return { nodes, edges };
  }
};

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  bg: '#050810', panel: '#0a0f1e', card: '#0d1426',
  border: '#1a2540', borderHi: '#2a3a60',
  accent: '#00d4ff', accent2: '#7c3aed', accent3: '#10b981',
  warn: '#f59e0b', danger: '#ef4444',
  nodeDefault: '#1e2d4a', nodeVisited: '#0d3d2e', nodeCurrent: '#7c3aed',
  nodeInMST: '#0d4a2e', nodeStart: '#1a3a5c',
  edgeDefault: '#1a2540', edgeHighlight: '#00d4ff', edgeMST: '#10b981',
  edgeReject: '#ef4444', text: '#e2e8f0', textDim: '#64748b', textBright: '#f8fafc'
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AlgorithmVisualizer() {
  const [graph, setGraph] = useState(() => Generators.random(8, 0.35));
  const [algo, setAlgo] = useState('dijkstra');
  const [startNode, setStartNode] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [mode, setMode] = useState('select'); // select | addNode | addEdge | delete
  const [edgeFrom, setEdgeFrom] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dragNode, setDragNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showJSON, setShowJSON] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [newEdgeWeight, setNewEdgeWeight] = useState(5);
  const [directed, setDirected] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [animTick, setAnimTick] = useState(0);
  const svgRef = useRef(null);
  const playRef = useRef(null);
  const animRef = useRef(null);

  // Pulse animation tick
  useEffect(() => {
    animRef.current = setInterval(() => setAnimTick(t => t + 1), 100);
    return () => clearInterval(animRef.current);
  }, []);

  const currentStep = steps[stepIdx] || null;

  // Compute metrics
  const metrics = useMemo(() => {
    const deg = LA.degreeVector(graph.nodes, graph.edges);
    const degs = Object.values(deg);
    const avgDeg = degs.length ? (degs.reduce((a, b) => a + b, 0) / degs.length).toFixed(2) : 0;
    const maxDeg = degs.length ? Math.max(...degs) : 0;
    const density = graph.nodes.length > 1
      ? (graph.edges.length / (graph.nodes.length * (graph.nodes.length - 1) / 2)).toFixed(3) : '0';
    return { nodes: graph.nodes.length, edges: graph.edges.length, avgDeg, maxDeg, density };
  }, [graph]);

  // Auto-play
  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setStepIdx(i => {
          if (i >= steps.length - 1) { setPlaying(false); return i; }
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
      if (algo === 'dijkstra') s = Algorithms.dijkstra(graph.nodes, graph.edges, src);
      else if (algo === 'bfs') s = Algorithms.bfs(graph.nodes, graph.edges, src);
      else if (algo === 'dfs') s = Algorithms.dfs(graph.nodes, graph.edges, src);
      else if (algo === 'prim') s = Algorithms.prim(graph.nodes, graph.edges, src);
      else if (algo === 'kruskal') s = Algorithms.kruskal(graph.nodes, graph.edges);
      else if (algo === 'bellmanFord') s = Algorithms.bellmanFord(graph.nodes, graph.edges, src);
    } catch (e) { console.error(e); }
    setSteps(s);
    setStepIdx(0);
    setPlaying(false);
  }, [algo, graph, startNode]);

  // Derive visual state from step
  const getNodeState = useCallback((nid) => {
    if (!currentStep) return 'default';
    if (currentStep.current === nid) return 'current';
    if (currentStep.inMST?.has(nid)) return 'mst';
    if (currentStep.visited?.has(nid)) return 'visited';
    return 'default';
  }, [currentStep]);

  const getEdgeState = useCallback((edge) => {
    if (!currentStep) return 'default';
    if (currentStep.mstEdges?.has(edge.id)) return 'mst';
    const hl = currentStep.highlight || [];
    for (const h of hl) {
      if (h.eid === edge.id) return 'highlight';
      if ((h.from === edge.from && h.to === edge.to) || (!edge.directed && h.from === edge.to && h.to === edge.from)) return 'highlight';
    }
    return 'default';
  }, [currentStep]);

  // SVG interaction
  const getSVGPos = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleSVGClick = (e) => {
    if (dragNode) return;
    const pos = getSVGPos(e);
    if (mode === 'addNode') {
      const id = `n${Date.now()}`;
      setGraph(g => ({ ...g, nodes: [...g.nodes, { id, label: `${g.nodes.length}`, x: pos.x, y: pos.y }] }));
    }
  };

  const handleNodeClick = (e, nid) => {
    e.stopPropagation();
    if (mode === 'select') { setSelectedNode(nid); setStartNode(nid); }
    else if (mode === 'addEdge') {
      if (!edgeFrom) { setEdgeFrom(nid); }
      else if (edgeFrom !== nid) {
        setGraph(g => ({ ...g, edges: [...g.edges, { id: eid(), from: edgeFrom, to: nid, weight: newEdgeWeight, directed }] }));
        setEdgeFrom(null);
      } else { setEdgeFrom(null); }
    }
    else if (mode === 'delete') {
      setGraph(g => ({ nodes: g.nodes.filter(n => n.id !== nid), edges: g.edges.filter(e => e.from !== nid && e.to !== nid) }));
    }
  };

  const handleEdgeClick = (e, eid2) => {
    e.stopPropagation();
    if (mode === 'delete') setGraph(g => ({ ...g, edges: g.edges.filter(e => e.id !== eid2) }));
  };

  const handleNodeMouseDown = (e, nid) => {
    if (mode !== 'select') return;
    e.stopPropagation();
    const pos = getSVGPos(e);
    const node = graph.nodes.find(n => n.id === nid);
    setDragNode(nid);
    setDragOffset({ x: pos.x - node.x, y: pos.y - node.y });
  };

  const handleMouseMove = (e) => {
    if (!dragNode) return;
    const pos = getSVGPos(e);
    setGraph(g => ({ ...g, nodes: g.nodes.map(n => n.id === dragNode ? { ...n, x: pos.x - dragOffset.x, y: pos.y - dragOffset.y } : n) }));
  };

  const handleMouseUp = () => setDragNode(null);

  const importJSON = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (!data.nodes || !data.edges) throw new Error('Must have nodes and edges arrays');
      setGraph(data); setJsonError(''); setShowJSON(false); setSteps([]); setStepIdx(0);
    } catch (err) { setJsonError(err.message); }
  };

  const loadPreset = (preset) => {
    _eid = Date.now();
    let g;
    if (preset === 'dense') g = Generators.dense();
    else if (preset === 'sparse') g = Generators.sparse();
    else if (preset === 'grid') g = Generators.grid(4, 4);
    else if (preset === 'tree') g = Generators.tree(12);
    else if (preset === 'scaleFree') g = Generators.scaleFree(14);
    else g = Generators.random(8, 0.35);
    setGraph(g); setSteps([]); setStepIdx(0); setStartNode(g.nodes[0]?.id || null); setSelectedNode(null);
  };

  const nodeMap = useMemo(() => Object.fromEntries(graph.nodes.map(n => [n.id, n])), [graph.nodes]);

  const getNodeColor = (state) => {
    if (state === 'current') return C.accent2;
    if (state === 'mst') return C.accent3;
    if (state === 'visited') return '#0f4c35';
    return C.nodeDefault;
  };

  const getEdgeColor = (state) => {
    if (state === 'highlight') return C.accent;
    if (state === 'mst') return C.accent3;
    return C.edgeDefault;
  };

  const algoInfo = {
    dijkstra: { name: "Dijkstra's", complexity: 'O((V+E) log V)', type: 'Shortest Path', desc: 'Greedy shortest-path using min-heap with locators' },
    bfs: { name: 'BFS', complexity: 'O(V+E)', type: 'Graph Traversal', desc: 'Level-by-level traversal using a queue' },
    dfs: { name: 'DFS', complexity: 'O(V+E)', type: 'Graph Traversal', desc: 'Depth-first traversal using recursion/stack' },
    prim: { name: "Prim's", complexity: 'O(E log V)', type: 'Min Spanning Tree', desc: 'Greedy MST growing from a start vertex' },
    kruskal: { name: "Kruskal's", complexity: 'O(E log E)', type: 'Min Spanning Tree', desc: 'Edge-sorted MST using Union-Find' },
    bellmanFord: { name: 'Bellman-Ford', complexity: 'O(VE)', type: 'Shortest Path', desc: 'Handles negative weights, detects negative cycles' }
  };

  const stepDesc = currentStep ? ({
    init: '⚡ Initializing algorithm...', visit: `📍 Visiting node ${currentStep.current}`,
    relax: `🔍 Relaxing edge...`, update: `✅ Distance updated for ${currentStep.current}`,
    discover: `🔭 Discovered ${currentStep.highlight?.[0]?.to}`, backtrack: `↩ Backtracking from ${currentStep.current}`,
    add: `✅ Added to MST`, consider: `🤔 Considering edge...`, reject: `❌ Rejected (would form cycle)`,
    explore: `➡ Exploring edge...`, done: currentStep.negCycle ? '⚠️ Negative cycle detected!' : '🏁 Algorithm complete!'
  }[currentStep.type] || '') : '';

  const pulse = animTick % 10 < 5;

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", background: C.bg, minHeight: '100vh', color: C.text, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Orbitron:wght@400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${C.panel}; } ::-webkit-scrollbar-thumb { background: ${C.borderHi}; border-radius: 2px; }
        .btn { border: 1px solid ${C.border}; background: ${C.card}; color: ${C.text}; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 11px; transition: all 0.15s; letter-spacing: 0.5px; }
        .btn:hover { border-color: ${C.accent}; color: ${C.accent}; background: rgba(0,212,255,0.05); }
        .btn.active { border-color: ${C.accent}; color: ${C.accent}; background: rgba(0,212,255,0.1); box-shadow: 0 0 8px rgba(0,212,255,0.2); }
        .btn.accent { border-color: ${C.accent}; color: ${C.accent}; }
        .btn.danger { border-color: ${C.danger}; color: ${C.danger}; }
        .btn.success { border-color: ${C.accent3}; color: ${C.accent3}; }
        .btn.purple { border-color: ${C.accent2}; color: ${C.accent2}; }
        select, input[type=range], input[type=number] { background: ${C.card}; border: 1px solid ${C.border}; color: ${C.text}; padding: 5px 8px; border-radius: 4px; font-family: inherit; font-size: 11px; }
        select:focus, input:focus { outline: none; border-color: ${C.accent}; }
        textarea { background: ${C.card}; border: 1px solid ${C.border}; color: ${C.text}; padding: 8px; border-radius: 4px; font-family: inherit; font-size: 11px; resize: vertical; width: 100%; }
        .chip { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; letter-spacing: 0.8px; font-weight: 700; }
        .node-circle { transition: fill 0.3s, stroke 0.3s; cursor: pointer; }
        .edge-line { transition: stroke 0.2s, stroke-width 0.2s; cursor: pointer; }
        .glow { filter: drop-shadow(0 0 6px rgba(0,212,255,0.5)); }
        .pulse { animation: pulse 1s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes slideIn { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }
        .slide-in { animation: slideIn 0.2s ease; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: ${C.border}; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${C.accent}; cursor: pointer; }
      `}</style>

      {/* Header */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(135deg, #00d4ff22, #7c3aed44)', border: `1px solid ${C.borderHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⬡</div>
          <div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 900, color: C.accent, letterSpacing: 2 }}>GRAPH<span style={{ color: C.accent2 }}>LAB</span></div>
            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5 }}>ALGORITHM VISUALIZER v2.0</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.entries(algoInfo).map(([key, info]) => (
            <button key={key} className={`btn ${algo === key ? 'active' : ''}`} onClick={() => { setAlgo(key); setSteps([]); setStepIdx(0); }}>
              <span style={{ fontSize: 9, color: C.textDim, display: 'block', letterSpacing: 1 }}>{info.type}</span>
              {info.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: C.textDim }}>DIRECTED</span>
          <div onClick={() => setDirected(d => !d)} style={{ width: 36, height: 20, borderRadius: 10, background: directed ? C.accent2 : C.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: 2, left: directed ? 18 : 2, width: 16, height: 16, borderRadius: 50, background: '#fff', transition: 'left 0.2s' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Left Panel */}
        <div style={{ width: 220, background: C.panel, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: 12, gap: 12, flexShrink: 0 }}>
          {/* Algorithm info */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10 }}>
            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 6 }}>SELECTED ALGORITHM</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 2 }}>{algoInfo[algo].name}</div>
            <div style={{ fontSize: 9, color: C.accent3, marginBottom: 6 }}>{algoInfo[algo].complexity}</div>
            <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.5 }}>{algoInfo[algo].desc}</div>
          </div>

          {/* Edit Mode */}
          <div>
            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 6 }}>EDIT MODE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[['select', '↖ Select / Move'], ['addNode', '⊕ Add Node'], ['addEdge', '— Add Edge'], ['delete', '✕ Delete']].map(([m, label]) => (
                <button key={m} className={`btn ${mode === m ? 'active' : ''}`} onClick={() => { setMode(m); setEdgeFrom(null); }}>{label}</button>
              ))}
            </div>
            {mode === 'addEdge' && (
              <div style={{ marginTop: 8, padding: 8, background: C.bg, borderRadius: 4, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.textDim, marginBottom: 4 }}>Edge weight: {newEdgeWeight}</div>
                <input type="range" min="1" max="20" value={newEdgeWeight} onChange={e => setNewEdgeWeight(+e.target.value)} style={{ width: '100%' }} />
                {edgeFrom && <div style={{ marginTop: 6, fontSize: 10, color: C.accent }}className="pulse">Click target node...</div>}
              </div>
            )}
          </div>

          {/* Presets */}
          <div>
            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 6 }}>GRAPH PRESETS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[['random', '🎲 Random'], ['dense', '🕸 Dense'], ['sparse', '⬡ Sparse'], ['grid', '⊞ Grid'], ['tree', '🌲 Tree'], ['scaleFree', '🌐 Scale-Free']].map(([p, label]) => (
                <button key={p} className="btn" onClick={() => loadPreset(p)}>{label}</button>
              ))}
            </div>
          </div>

          {/* JSON Import */}
          <div>
            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 6 }}>IMPORT / EXPORT</div>
            <button className="btn accent" style={{ width: '100%', marginBottom: 4 }} onClick={() => setShowJSON(v => !v)}>
              {showJSON ? '✕ Close' : '{ } Import JSON'}
            </button>
            <button className="btn" style={{ width: '100%' }} onClick={() => {
              const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
              a.download = 'graph.json'; a.click();
            }}>⬇ Export JSON</button>
          </div>

          {showJSON && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 8 }} className="slide-in">
              <textarea rows={8} value={jsonInput} onChange={e => setJsonInput(e.target.value)} placeholder={'{\n  "nodes": [{"id":"n0","x":100,"y":100,"label":"0"}],\n  "edges": [{"id":"e0","from":"n0","to":"n1","weight":5,"directed":false}]\n}'} />
              {jsonError && <div style={{ fontSize: 10, color: C.danger, marginTop: 4 }}>{jsonError}</div>}
              <button className="btn success" style={{ width: '100%', marginTop: 6 }} onClick={importJSON}>⬆ Import</button>
            </div>
          )}

          {/* Metrics */}
          {showMetrics && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10 }}>
              <div style={{ fontSize: 9, color: C.textDim, letterSpacing: 1.5, marginBottom: 8 }}>GRAPH METRICS</div>
              {[['Nodes', metrics.nodes], ['Edges', metrics.edges], ['Avg Degree', metrics.avgDeg], ['Max Degree', metrics.maxDeg], ['Density', metrics.density]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: C.textDim }}>{k}</span>
                  <span style={{ color: C.accent, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Canvas toolbar */}
          <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn purple" onClick={runAlgo}>▶ Run {algoInfo[algo].name}</button>
              <button className={`btn ${playing ? 'accent' : ''}`} onClick={() => steps.length && setPlaying(p => !p)}>{playing ? '⏸ Pause' : '▷ Play'}</button>
              <button className="btn" onClick={() => { setStepIdx(0); setPlaying(false); }}>⏮ Reset</button>
              <button className="btn" disabled={stepIdx <= 0} onClick={() => setStepIdx(i => Math.max(0, i - 1))}>◀ Step</button>
              <button className="btn" disabled={stepIdx >= steps.length - 1} onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))}>Step ▶</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: C.textDim }}>SPEED</span>
              <input type="range" min="50" max="1500" step="50" value={1550 - speed} onChange={e => setSpeed(1550 - +e.target.value)} style={{ width: 80 }} />
            </div>
            {steps.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 10, color: C.textDim }}>STEP</div>
                <div style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>{stepIdx + 1} / {steps.length}</div>
                <div style={{ width: 100, height: 4, background: C.border, borderRadius: 2 }}>
                  <div style={{ width: `${((stepIdx + 1) / steps.length) * 100}%`, height: '100%', background: C.accent, borderRadius: 2, transition: 'width 0.2s' }} />
                </div>
              </div>
            )}
            {startNode && <div style={{ fontSize: 10 }}>Start: <span style={{ color: C.accent2, fontWeight: 700 }}>node {graph.nodes.find(n => n.id === startNode)?.label}</span></div>}
            <div style={{ marginLeft: 'auto', fontSize: 11, color: stepDesc.includes('complete') ? C.accent3 : stepDesc.includes('⚠') ? C.warn : C.textDim }}>
              {stepDesc || (steps.length === 0 ? '← Configure and click Run' : '')}
            </div>
          </div>

          {/* SVG Canvas */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <svg ref={svgRef} width="100%" height="100%"
              style={{ cursor: mode === 'addNode' ? 'crosshair' : mode === 'delete' ? 'not-allowed' : 'default', background: C.bg }}
              onClick={handleSVGClick} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={C.accent} />
                </marker>
                <marker id="arrow-mst" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={C.accent3} />
                </marker>
                <filter id="glow-filter">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <radialGradient id="node-grad-current" cx="50%" cy="30%">
                  <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#7c3aed" />
                </radialGradient>
                <radialGradient id="node-grad-visited" cx="50%" cy="30%">
                  <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" />
                </radialGradient>
                <radialGradient id="node-grad-mst" cx="50%" cy="30%">
                  <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#065f46" />
                </radialGradient>
                <radialGradient id="node-grad-default" cx="50%" cy="30%">
                  <stop offset="0%" stopColor="#2d4a7a" /><stop offset="100%" stopColor="#1e2d4a" />
                </radialGradient>
              </defs>

              {/* Grid background */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.border} strokeWidth="0.5" opacity="0.3" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Edges */}
              {graph.edges.map(edge => {
                const from = nodeMap[edge.from], to = nodeMap[edge.to];
                if (!from || !to) return null;
                const state = getEdgeState(edge);
                const color = getEdgeColor(state);
                const isHighlit = state !== 'default';
                const dx = to.x - from.x, dy = to.y - from.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const r = 20;
                const x1 = from.x + (dx / len) * r, y1 = from.y + (dy / len) * r;
                const x2 = to.x - (dx / len) * (r + (directed ? 8 : 0));
                const y2 = to.y - (dy / len) * (r + (directed ? 8 : 0));
                const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
                return (
                  <g key={edge.id} onClick={e => handleEdgeClick(e, edge.id)}>
                    {isHighlit && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={10} opacity={0.15} />}
                    <line className="edge-line" x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={color} strokeWidth={isHighlit ? 2.5 : 1.5}
                      opacity={isHighlit ? 1 : 0.5}
                      markerEnd={directed ? `url(#arrow${state === 'mst' ? '-mst' : ''})` : undefined}
                      filter={isHighlit ? 'url(#glow-filter)' : undefined}
                      style={{ cursor: mode === 'delete' ? 'pointer' : 'default' }} />
                    <text x={mx} y={my - 6} textAnchor="middle" fontSize="10" fill={isHighlit ? color : C.textDim} fontFamily="inherit" fontWeight={isHighlit ? 700 : 400}>
                      {edge.weight}
                    </text>
                  </g>
                );
              })}

              {/* Edge-from indicator */}
              {edgeFrom && nodeMap[edgeFrom] && (
                <circle cx={nodeMap[edgeFrom].x} cy={nodeMap[edgeFrom].y} r={28} fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="4 4" opacity={pulse ? 1 : 0.3} />
              )}

              {/* Nodes */}
              {graph.nodes.map(node => {
                const state = getNodeState(node.id);
                const isStart = node.id === startNode;
                const isSelected = node.id === selectedNode;
                const isEdgeFrom = node.id === edgeFrom;
                const dist = currentStep?.dist?.[node.id];
                const gradId = state === 'current' ? 'node-grad-current' : state === 'mst' ? 'node-grad-mst' : state === 'visited' ? 'node-grad-visited' : 'node-grad-default';
                return (
                  <g key={node.id} transform={`translate(${node.x},${node.y})`}
                    onClick={e => handleNodeClick(e, node.id)}
                    onMouseDown={e => handleNodeMouseDown(e, node.id)}
                    onMouseEnter={e => setTooltip({ id: node.id, x: node.x, y: node.y, dist, label: node.label })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: mode === 'select' ? 'move' : mode === 'delete' ? 'pointer' : 'pointer' }}>
                    {/* Outer glow rings */}
                    {state === 'current' && <circle r={30} fill="none" stroke={C.accent2} strokeWidth={1} opacity={pulse ? 0.6 : 0.2} />}
                    {isStart && <circle r={26} fill="none" stroke={C.accent} strokeWidth={1} strokeDasharray="3 3" opacity={0.6} />}
                    {isSelected && <circle r={24} fill="none" stroke={C.warn} strokeWidth={2} opacity={0.8} />}
                    {/* Main circle */}
                    <circle className="node-circle" r={20}
                      fill={`url(#${gradId})`}
                      stroke={state === 'current' ? C.accent2 : isStart ? C.accent : C.borderHi}
                      strokeWidth={state === 'current' || isStart ? 2 : 1}
                      filter={state === 'current' ? 'url(#glow-filter)' : undefined} />
                    {/* Label */}
                    <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fill={C.textBright} fontFamily="inherit">{node.label}</text>
                    {/* Distance badge */}
                    {dist !== undefined && dist !== Infinity && (
                      <g transform="translate(12,-12)">
                        <circle r={10} fill={C.card} stroke={C.accent} strokeWidth={1} />
                        <text textAnchor="middle" dy="4" fontSize="9" fill={C.accent} fontWeight="700" fontFamily="inherit">{dist}</text>
                      </g>
                    )}
                    {dist === Infinity && currentStep && (
                      <g transform="translate(12,-12)">
                        <circle r={10} fill={C.card} stroke={C.textDim} strokeWidth={1} />
                        <text textAnchor="middle" dy="4" fontSize="8" fill={C.textDim} fontFamily="inherit">∞</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Tooltip */}
              {tooltip && (
                <g transform={`translate(${tooltip.x + 25},${tooltip.y - 25})`}>
                  <rect rx={4} ry={4} width={80} height={32} fill={C.card} stroke={C.borderHi} />
                  <text x={8} y={14} fontSize={10} fill={C.accent} fontFamily="inherit" fontWeight={700}>Node {tooltip.label}</text>
                  {tooltip.dist !== undefined && <text x={8} y={26} fontSize={9} fill={C.textDim} fontFamily="inherit">d={tooltip.dist === Infinity ? '∞' : tooltip.dist}</text>}
                </g>
              )}
            </svg>

            {/* Mode indicator */}
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 10px', fontSize: 10, color: C.textDim }}>
              MODE: <span style={{ color: C.accent, fontWeight: 700 }}>{mode.toUpperCase()}</span>
              {mode === 'addNode' && ' · Click canvas to place node'}
              {mode === 'addEdge' && (edgeFrom ? ` · Now click target (from: ${graph.nodes.find(n=>n.id===edgeFrom)?.label})` : ' · Click source node')}
              {mode === 'delete' && ' · Click node or edge to delete'}
            </div>

            {/* Legend */}
            <div style={{ position: 'absolute', bottom: 12, right: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                [C.accent2, '●', 'Current node'],
                [C.accent3, '●', 'Visited / MST'],
                [C.accent, '—', 'Active edge'],
                [C.accent3, '—', 'MST edge'],
                [C.accent, '○', 'Start node'],
              ].map(([color, sym, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                  <span style={{ color, fontWeight: 700 }}>{sym}</span>
                  <span style={{ color: C.textDim }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel – Step Info */}
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
            <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.7 }}>
              {algo === 'dijkstra' && '• Min-Heap w/ Locators\n• Adjacency List\n• Distance Array'}
              {algo === 'bfs' && '• Queue (FIFO)\n• Adjacency List\n• Visited Set'}
              {algo === 'dfs' && '• Call Stack\n• Adjacency List\n• Visited Set'}
              {algo === 'prim' && '• Min-Heap w/ Locators\n• Adjacency List\n• Key Array'}
              {algo === 'kruskal' && '• Union-Find\n• Sorted Edge List\n• MST Edge Set'}
              {algo === 'bellmanFord' && '• Edge List\n• Distance Array\n• Predecessor Map'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div style={{ background: C.panel, borderTop: `1px solid ${C.border}`, padding: '4px 16px', display: 'flex', gap: 16, alignItems: 'center', fontSize: 10, color: C.textDim }}>
        <span style={{ color: C.accent }}>●</span>
        <span>NODES: <strong style={{ color: C.text }}>{metrics.nodes}</strong></span>
        <span>EDGES: <strong style={{ color: C.text }}>{metrics.edges}</strong></span>
        <span>DENSITY: <strong style={{ color: C.text }}>{metrics.density}</strong></span>
        <span>MAX DEG: <strong style={{ color: C.text }}>{metrics.maxDeg}</strong></span>
        {startNode && <span>START: <strong style={{ color: C.accent2 }}>n{graph.nodes.find(n => n.id === startNode)?.label}</strong></span>}
        <span style={{ marginLeft: 'auto' }}>Linear Algebra · Min-Heap · Union-Find · Adjacency Lists</span>
        <span style={{ color: C.accent }}>GRAPHLAB v2.0</span>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> eae6cd526ced7abcecc811aeb915961c318ccbff
