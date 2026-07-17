// ─── Graph Generators ─────────────────────────────────────────────────────────
let _eid = 0;
export const eid = () => `e${_eid++}`;
export const resetEidCounter = (seed = Date.now()) => {
  _eid = seed;
};

export const Generators = {
  random(nodeCount = 8, edgeDensity = 0.3) {
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `n${i}`,
      label: `${i}`,
      x: 80 + Math.random() * 640,
      y: 80 + Math.random() * 440,
    }));
    const edges = [];
    for (let i = 0; i < nodeCount; i++)
      for (let j = i + 1; j < nodeCount; j++)
        if (Math.random() < edgeDensity)
          edges.push({
            id: eid(),
            from: `n${i}`,
            to: `n${j}`,
            weight: Math.floor(Math.random() * 19) + 1,
            directed: false,
          });
    return { nodes, edges };
  },
  dense(n = 10) {
    return Generators.random(n, 0.7);
  },
  sparse(n = 12) {
    return Generators.random(n, 0.15);
  },
  grid(rows = 4, cols = 4) {
    const nodes = [],
      edges = [];
    const id = (r, c) => `n${r * cols + c}`;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        nodes.push({
          id: id(r, c),
          label: `${r * cols + c}`,
          x: 80 + c * 130,
          y: 80 + r * 120,
        });
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (c + 1 < cols)
          edges.push({
            id: eid(),
            from: id(r, c),
            to: id(r, c + 1),
            weight: Math.floor(Math.random() * 9) + 1,
            directed: false,
          });
        if (r + 1 < rows)
          edges.push({
            id: eid(),
            from: id(r, c),
            to: id(r + 1, c),
            weight: Math.floor(Math.random() * 9) + 1,
            directed: false,
          });
      }
    return { nodes, edges };
  },
  tree(n = 10) {
    const nodes = [{ id: "n0", label: "0", x: 400, y: 60 }];
    const edges = [];
    for (let i = 1; i < n; i++) {
      const parent = Math.floor((i - 1) / 2);
      const isLeft = (i - 1) % 2 === 0;
      const px = nodes[parent].x,
        py = nodes[parent].y;
      const spread = 200 / (Math.floor(Math.log2(i)) + 1);
      const x = px + (isLeft ? -spread : spread);
      const y = py + 100;
      nodes.push({ id: `n${i}`, label: `${i}`, x, y });
      edges.push({
        id: eid(),
        from: `n${parent}`,
        to: `n${i}`,
        weight: Math.floor(Math.random() * 9) + 1,
        directed: false,
      });
    }
    return { nodes, edges };
  },
  scaleFree(n = 12) {
    const nodes = [
      { id: "n0", label: "0", x: 400, y: 300 },
      { id: "n1", label: "1", x: 500, y: 300 },
    ];
    const edges = [
      {
        id: eid(),
        from: "n0",
        to: "n1",
        weight: Math.floor(Math.random() * 9) + 1,
        directed: false,
      },
    ];
    const deg = { n0: 1, n1: 1 };
    for (let i = 2; i < n; i++) {
      const id = `n${i}`;
      const angle = (i / n) * Math.PI * 2;
      const r = 80 + Math.random() * 200;
      nodes.push({
        id,
        label: `${i}`,
        x: 400 + Math.cos(angle) * r,
        y: 300 + Math.sin(angle) * r,
      });
      deg[id] = 0;
      const totalDeg = Object.values(deg).reduce((a, b) => a + b, 0);
      const m = Math.min(2, nodes.length - 1);
      const chosen = new Set();
      let attempts = 0;
      while (chosen.size < m && attempts < 100) {
        let r2 = Math.random() * totalDeg,
          cum = 0;
        for (const [nid, d] of Object.entries(deg)) {
          if (nid === id) continue;
          cum += d;
          if (r2 <= cum && !chosen.has(nid)) {
            chosen.add(nid);
            break;
          }
        }
        attempts++;
      }
      for (const target of chosen) {
        edges.push({
          id: eid(),
          from: id,
          to: target,
          weight: Math.floor(Math.random() * 9) + 1,
          directed: false,
        });
        deg[id]++;
        deg[target]++;
      }
    }
    return { nodes, edges };
  },
};
