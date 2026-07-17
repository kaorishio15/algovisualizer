// ─── Color palette ────────────────────────────────────────────────────────────
export const C = {
  bg: "#050810",
  panel: "#0a0f1e",
  card: "#0d1426",
  border: "#1a2540",
  borderHi: "#2a3a60",
  accent: "#00d4ff",
  accent2: "#7c3aed",
  accent3: "#10b981",
  warn: "#f59e0b",
  danger: "#ef4444",
  nodeDefault: "#1e2d4a",
  nodeVisited: "#0d3d2e",
  nodeCurrent: "#7c3aed",
  nodeInMST: "#0d4a2e",
  nodeStart: "#1a3a5c",
  edgeDefault: "#fafbff",
  edgeHighlight: "#00d4ff",
  edgeMST: "#10b981",
  edgeReject: "#ef4444",
  text: "#e2e8f0",
  textDim: "#64748b",
  textBright: "#f8fafc",
};

// ─── Algorithm metadata (name, complexity, description) shown in the UI ──────
export const algoInfo = {
  bfs: {
    name: "BFS",
    complexity: "O(V+E)",
    type: "Graph Traversal",
    desc: "Level-by-level traversal using a queue",
  },
  dfs: {
    name: "DFS",
    complexity: "O(V+E)",
    type: "Graph Traversal",
    desc: "Depth-first traversal using recursion/stack",
  },
  prim: {
    name: "Prim's",
    complexity: "O(E log V)",
    type: "Min Spanning Tree",
    desc: "Greedy MST growing from a start vertex",
  },
  kruskal: {
    name: "Kruskal's",
    complexity: "O(E log E)",
    type: "Min Spanning Tree",
    desc: "Edge-sorted MST using Union-Find",
  },
  bellmanFord: {
    name: "Bellman-Ford",
    complexity: "O(VE)",
    type: "Shortest Path",
    desc: "Handles negative weights, detects negative cycles",
  },
  dijkstra: {
    name: "Dijkstra's",
    complexity: "O((V+E) log V)",
    type: "Shortest Path",
    desc: "Greedy shortest-path using min-heap with locators",
  },
};

// ─── Data structures used per-algorithm, shown in the right panel ────────────
export const dataStructureInfo = {
  dijkstra: "• Min-Heap w/ Locators\n• Adjacency List\n• Distance Array",
  bfs: "• Queue (FIFO)\n• Adjacency List\n• Visited Set",
  dfs: "• Call Stack\n• Adjacency List\n• Visited Set",
  prim: "• Min-Heap w/ Locators\n• Adjacency List\n• Key Array",
  kruskal: "• Union-Find\n• Sorted Edge List\n• MST Edge Set",
  bellmanFord: "• Edge List\n• Distance Array\n• Predecessor Map",
};

export const stepDescriptions = (currentStep) => {
  if (!currentStep) return "";
  return (
    {
      init: "⚡ Initializing algorithm...",
      visit: `📍 Visiting node ${currentStep.current}`,
      relax: `🔍 Relaxing edge...`,
      update: `✅ Distance updated for ${currentStep.current}`,
      discover: `🔭 Discovered ${currentStep.highlight?.[0]?.to}`,
      backtrack: `↩ Backtracking from ${currentStep.current}`,
      add: `✅ Added to MST`,
      consider: `🤔 Considering edge...`,
      reject: `❌ Rejected (would form cycle)`,
      explore: `➡ Exploring edge...`,
      done: currentStep.negCycle
        ? "⚠️ Negative cycle detected!"
        : "🏁 Algorithm complete!",
    }[currentStep.type] || ""
  );
};
