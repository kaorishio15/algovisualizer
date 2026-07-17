// ─── Min-Heap with Locators ───────────────────────────────────────────────────
export class MinHeap {
  constructor() {
    this.heap = [];
    this.locator = new Map();
  }
  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    this.locator.set(this.heap[i].id, i);
    this.locator.set(this.heap[j].id, j);
  }
  _bubbleUp(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[p].key <= this.heap[i].key) break;
      this._swap(i, p);
      i = p;
    }
  }
  _siftDown(i) {
    const n = this.heap.length;
    while (true) {
      let s = i,
        l = 2 * i + 1,
        r = 2 * i + 2;
      if (l < n && this.heap[l].key < this.heap[s].key) s = l;
      if (r < n && this.heap[r].key < this.heap[s].key) s = r;
      if (s === i) break;
      this._swap(i, s);
      i = s;
    }
  }
  insert(id, key) {
    const e = { id, key };
    this.heap.push(e);
    this.locator.set(id, this.heap.length - 1);
    this._bubbleUp(this.heap.length - 1);
  }
  decreaseKey(id, key) {
    const i = this.locator.get(id);
    if (i === undefined) return;
    this.heap[i].key = key;
    this._bubbleUp(i);
  }
  extractMin() {
    if (!this.heap.length) return null;
    this._swap(0, this.heap.length - 1);
    const min = this.heap.pop();
    this.locator.delete(min.id);
    if (this.heap.length) this._siftDown(0);
    return min;
  }
  isEmpty() {
    return this.heap.length === 0;
  }
  has(id) {
    return this.locator.has(id);
  }
}
