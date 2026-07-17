import { MinHeap } from "./MinHeap";
import { UnionFind } from "./UnionFind";

// ─── Algorithm Implementations ────────────────────────────────────────────────
// Each function returns an array of "steps" — one snapshot per meaningful
// event — which the UI plays back to animate the algorithm.
export const Algorithms = {
  dijkstra(nodes, edges, startId) {
    const steps = [];
    const dist = Object.fromEntries(nodes.map((n) => [n.id, Infinity]));
    const prev = Object.fromEntries(nodes.map((n) => [n.id, null]));
    dist[startId] = 0;
    const heap = new MinHeap();
    nodes.forEach((n) => heap.insert(n.id, n.id === startId ? 0 : Infinity));
    const visited = new Set();
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach((e) => {
      adj[e.from]?.push({ to: e.to, w: e.weight });
      if (!e.directed) adj[e.to]?.push({ to: e.from, w: e.weight });
    });
    steps.push({
      type: "init",
      dist: { ...dist },
      visited: new Set(),
      current: startId,
      highlight: [],
    });
    while (!heap.isEmpty()) {
      const { id: u } = heap.extractMin();
      if (visited.has(u)) continue;
      visited.add(u);
      steps.push({
        type: "visit",
        dist: { ...dist },
        visited: new Set(visited),
        current: u,
        highlight: [],
      });
      for (const { to: v, w } of adj[u] || []) {
        const nd = dist[u] + w;
        steps.push({
          type: "relax",
          dist: { ...dist },
          visited: new Set(visited),
          current: u,
          highlight: [{ from: u, to: v }],
        });
        if (nd < dist[v]) {
          dist[v] = nd;
          prev[v] = u;
          if (heap.has(v)) heap.decreaseKey(v, nd);
          steps.push({
            type: "update",
            dist: { ...dist },
            visited: new Set(visited),
            current: v,
            highlight: [{ from: u, to: v }],
          });
        }
      }
    }
    steps.push({
      type: "done",
      dist: { ...dist },
      prev,
      visited: new Set(visited),
      current: null,
      highlight: [],
    });
    return steps;
  },

  bfs(nodes, edges, startId) {
    const steps = [];
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach((e) => {
      adj[e.from]?.push(e.to);
      if (!e.directed) adj[e.to]?.push(e.from);
    });
    const visited = new Set([startId]);
    const queue = [startId];
    const dist = Object.fromEntries(
      nodes.map((n) => [n.id, n.id === startId ? 0 : Infinity]),
    );
    steps.push({
      type: "init",
      visited: new Set(visited),
      queue: [...queue],
      current: startId,
      highlight: [],
    });
    while (queue.length) {
      const u = queue.shift();
      steps.push({
        type: "visit",
        visited: new Set(visited),
        queue: [...queue],
        current: u,
        highlight: [],
      });
      for (const v of adj[u] || []) {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
          dist[v] = dist[u] + 1;
          steps.push({
            type: "discover",
            visited: new Set(visited),
            queue: [...queue],
            current: u,
            highlight: [{ from: u, to: v }],
          });
        }
      }
    }
    steps.push({
      type: "done",
      visited: new Set(visited),
      queue: [],
      current: null,
      highlight: [],
      dist,
    });
    return steps;
  },

  dfs(nodes, edges, startId) {
    const steps = [];
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach((e) => {
      adj[e.from]?.push(e.to);
      if (!e.directed) adj[e.to]?.push(e.from);
    });
    const visited = new Set();
    const stack = [];
    const recurse = (u) => {
      visited.add(u);
      stack.push(u);
      steps.push({
        type: "visit",
        visited: new Set(visited),
        stack: [...stack],
        current: u,
        highlight: [],
      });
      for (const v of adj[u] || []) {
        if (!visited.has(v)) {
          steps.push({
            type: "explore",
            visited: new Set(visited),
            stack: [...stack],
            current: u,
            highlight: [{ from: u, to: v }],
          });
          recurse(v);
        }
      }
      stack.pop();
      steps.push({
        type: "backtrack",
        visited: new Set(visited),
        stack: [...stack],
        current: u,
        highlight: [],
      });
    };
    recurse(startId);
    steps.push({
      type: "done",
      visited: new Set(visited),
      stack: [],
      current: null,
      highlight: [],
    });
    return steps;
  },

  prim(nodes, edges, startId) {
    const steps = [];
    const adj = {};
    nodes.forEach((n) => (adj[n.id] = []));
    edges.forEach((e) => {
      adj[e.from]?.push({ to: e.to, w: e.weight, eid: e.id });
      adj[e.to]?.push({ to: e.from, w: e.weight, eid: e.id });
    });
    const inMST = new Set([startId]);
    const mstEdges = new Set();
    const key = Object.fromEntries(nodes.map((n) => [n.id, Infinity]));
    const edgeTo = Object.fromEntries(nodes.map((n) => [n.id, null]));
    key[startId] = 0;
    const heap = new MinHeap();
    nodes.forEach((n) => heap.insert(n.id, n.id === startId ? 0 : Infinity));
    steps.push({
      type: "init",
      inMST: new Set(inMST),
      mstEdges: new Set(),
      current: startId,
      highlight: [],
    });
    while (!heap.isEmpty()) {
      const { id: u } = heap.extractMin();
      if (inMST.has(u) && u !== startId) continue;
      inMST.add(u);
      if (edgeTo[u]) mstEdges.add(edgeTo[u]);
      steps.push({
        type: "add",
        inMST: new Set(inMST),
        mstEdges: new Set(mstEdges),
        current: u,
        highlight: edgeTo[u] ? [{ eid: edgeTo[u] }] : [],
      });
      for (const { to: v, w, eid } of adj[u] || []) {
        if (!inMST.has(v) && w < key[v]) {
          key[v] = w;
          edgeTo[v] = eid;
          if (heap.has(v)) heap.decreaseKey(v, w);
          steps.push({
            type: "relax",
            inMST: new Set(inMST),
            mstEdges: new Set(mstEdges),
            current: u,
            highlight: [{ from: u, to: v }],
          });
        }
      }
    }
    steps.push({
      type: "done",
      inMST: new Set(inMST),
      mstEdges: new Set(mstEdges),
      current: null,
      highlight: [],
    });
    return steps;
  },

  kruskal(nodes, edges) {
    const steps = [];
    const sorted = [...edges].sort((a, b) => a.weight - b.weight);
    const uf = new UnionFind(nodes.map((n) => n.id));
    const mstEdges = new Set();
    steps.push({
      type: "init",
      mstEdges: new Set(),
      current: null,
      highlight: [],
    });
    for (const e of sorted) {
      steps.push({
        type: "consider",
        mstEdges: new Set(mstEdges),
        current: null,
        highlight: [{ from: e.from, to: e.to }],
        edge: e,
      });
      if (uf.union(e.from, e.to)) {
        mstEdges.add(e.id);
        steps.push({
          type: "add",
          mstEdges: new Set(mstEdges),
          current: null,
          highlight: [{ eid: e.id }],
        });
      } else {
        steps.push({
          type: "reject",
          mstEdges: new Set(mstEdges),
          current: null,
          highlight: [],
          edge: e,
        });
      }
    }
    steps.push({
      type: "done",
      mstEdges: new Set(mstEdges),
      current: null,
      highlight: [],
    });
    return steps;
  },

  bellmanFord(nodes, edges, startId) {
    const steps = [];
    const dist = Object.fromEntries(nodes.map((n) => [n.id, Infinity]));
    const prev = Object.fromEntries(nodes.map((n) => [n.id, null]));
    dist[startId] = 0;
    steps.push({
      type: "init",
      dist: { ...dist },
      current: startId,
      highlight: [],
      negCycle: false,
    });
    for (let i = 0; i < nodes.length - 1; i++) {
      let updated = false;
      for (const e of edges) {
        steps.push({
          type: "relax",
          dist: { ...dist },
          current: e.from,
          highlight: [{ from: e.from, to: e.to }],
          iter: i,
        });
        if (dist[e.from] !== Infinity && dist[e.from] + e.weight < dist[e.to]) {
          dist[e.to] = dist[e.from] + e.weight;
          prev[e.to] = e.from;
          updated = true;
          steps.push({
            type: "update",
            dist: { ...dist },
            current: e.to,
            highlight: [{ from: e.from, to: e.to }],
            iter: i,
          });
        }
        if (
          !e.directed &&
          dist[e.to] !== Infinity &&
          dist[e.to] + e.weight < dist[e.from]
        ) {
          dist[e.from] = dist[e.to] + e.weight;
          prev[e.from] = e.to;
          updated = true;
          steps.push({
            type: "update",
            dist: { ...dist },
            current: e.from,
            highlight: [{ from: e.to, to: e.from }],
            iter: i,
          });
        }
      }
      if (!updated) break;
    }
    let negCycle = false;
    for (const e of edges) {
      if (dist[e.from] !== Infinity && dist[e.from] + e.weight < dist[e.to]) {
        negCycle = true;
        break;
      }
    }
    steps.push({
      type: "done",
      dist: { ...dist },
      prev,
      current: null,
      highlight: [],
      negCycle,
    });
    return steps;
  },
};
