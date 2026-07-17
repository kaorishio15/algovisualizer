// ─── Linear Algebra Utilities ────────────────────────────────────────────────
export const LA = {
  // Adjacency matrix ops
  matMul: (A, B) =>
    A.map((row, i) =>
      B[0].map((_, j) => row.reduce((s, _, k) => s + A[i][k] * B[k][j], 0)),
    ),
  transpose: (M) => M[0].map((_, j) => M.map((row) => row[j])),
  toAdjMatrix: (nodes, edges) => {
    const n = nodes.length,
      idx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));
    const M = Array.from({ length: n }, () => Array(n).fill(Infinity));
    nodes.forEach((_, i) => (M[i][i] = 0));
    edges.forEach((e) => {
      const u = idx[e.from],
        v = idx[e.to];
      if (u !== undefined && v !== undefined) {
        M[u][v] = e.weight;
        if (!e.directed) M[v][u] = e.weight;
      }
    });
    return { M, idx };
  },
  // Degree vector for scale-free metrics
  degreeVector: (nodes, edges) => {
    const deg = Object.fromEntries(nodes.map((n) => [n.id, 0]));
    edges.forEach((e) => {
      if (deg[e.from] !== undefined) deg[e.from]++;
      if (deg[e.to] !== undefined) deg[e.to]++;
    });
    return deg;
  },
};
