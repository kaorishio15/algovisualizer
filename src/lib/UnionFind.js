// ─── Union-Find for Kruskal ───────────────────────────────────────────────────
export class UnionFind {
  constructor(ids) {
    this.parent = Object.fromEntries(ids.map((id) => [id, id]));
    this.rank = Object.fromEntries(ids.map((id) => [id, 0]));
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(x, y) {
    const px = this.find(x),
      py = this.find(y);
    if (px === py) return false;
    if (this.rank[px] < this.rank[py]) this.parent[px] = py;
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    return true;
  }
}
