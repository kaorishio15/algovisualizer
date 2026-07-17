# Algovisualizer — Algorithm Visualizer

An interactive graph algorithm visualizer: build/edit a graph, then step through
Dijkstra, BFS, DFS, Prim, Kruskal, or Bellman-Ford and watch the internal
state (heap, queue, stack, MST edges, distances) update live.

## Requirements

- [Node.js](https://nodejs.org/) 18 or newer (includes `npm`)

Check your version:

```bash
node -v
```

## Running it

From the `graphlab/` folder:

```bash
npm install
npm run dev
```

Vite will start a local dev server and print a URL, typically:

```
http://localhost:5173
```

Open that in your browser. The app hot-reloads as you edit files.

### Other commands

```bash
npm run build     # production build, output goes to dist/
npm run preview   # serve the production build locally to sanity-check it
```

## Using the app

- **Presets** (left panel) load a random, dense, sparse, grid, tree, or
  scale-free graph.
- **Edit Mode** (left panel) switches the canvas between selecting/moving
  nodes, adding nodes, adding edges, and deleting.
- Click a node in **Select** mode to set it as the algorithm's start node.
- Pick an algorithm from the header, then **Run** it. Use **Play/Pause**,
  **Step**, or the speed slider to control playback.
- **Import/Export JSON** lets you save a graph or load your own — the shape
  is `{ nodes: [{id,x,y,label}], edges: [{id,from,to,weight,directed}] }`.

## Project structure

```
graphlab/
├── index.html              Vite entry HTML
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx             Mounts <App /> into the page
    ├── App.jsx               Renders <AlgorithmVisualizer />
    ├── lib/                  Pure logic — no React
    │   ├── linearAlgebra.js   Adjacency matrix / degree vector helpers
    │   ├── MinHeap.js         Heap used by Dijkstra & Prim
    │   ├── UnionFind.js       Used by Kruskal
    │   ├── algorithms.js      Dijkstra, BFS, DFS, Prim, Kruskal, Bellman-Ford
    │   └── generators.js      Random/dense/sparse/grid/tree/scale-free graphs
    ├── constants/
    │   └── theme.js           Color palette + algorithm metadata/text
    └── components/
        ├── AlgorithmVisualizer.jsx  Owns state, runs algorithms, composes the rest
        ├── GlobalStyles.jsx         Shared CSS
        ├── Header.jsx               Logo, algorithm picker, directed toggle
        ├── LeftPanel.jsx            Algo info, edit mode, presets, JSON, metrics
        ├── CanvasToolbar.jsx        Run/play/step/speed controls
        ├── GraphCanvas.jsx          The SVG graph itself + interactions
        ├── RightPanel.jsx           Live algorithm state (distances, visited, etc.)
        └── StatusBar.jsx            Bottom metrics bar
```

## Troubleshooting

- **Blank page / console errors about JSX** — make sure you ran `npm install`
  (it needs `@vitejs/plugin-react` to compile `.jsx` files).
- **Port already in use** — Vite will automatically pick the next free port;
  check the terminal output for the actual URL.
- **Node version errors** — Vite 5 requires Node 18+; upgrade Node if `npm run dev` fails immediately.
