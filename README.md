# AlgoVisualizer

AlgoVisualizer is an interactive web application that visualizes graph algorithms in real time.  
The tool allows users to build custom graphs and observe how algorithms execute step-by-step.

The project was built to help better understand core computer science concepts such as graph traversal, shortest path algorithms, and minimum spanning trees through visual simulation.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Supported Algorithms](#supported-algorithms)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Future Improvements](#future-improvements)

---

## Overview

AlgoVisualizer provides an environment where users can experiment with graph algorithms interactively.

Users can:
- create graphs
- modify nodes and edges
- run algorithms
- watch step-by-step visualizations of how the algorithm progresses

> The goal of the project is to make abstract algorithm concepts easier to understand through visualization.

---

## Features

### Interactive Graph Editor

- Add and remove nodes
- Create weighted edges
- Drag nodes to reposition them
- Toggle between directed and undirected graphs
- Modify edge weights dynamically

### Step-By-Step Algorithm Simulation

- Play and pause execution
- Step forward and backward through algorithm steps
- Adjust animation speed
- Track algorithm progress

### Graph Generators

The application includes built-in graph generators:

- Random graphs
- Dense graphs
- Sparse graphs
- Grid graphs
- Tree graphs
- Scale-free networks

### Graph Metrics

The system automatically calculates:

- Total number of nodes
- Total number of edges
- Average node degree
- Maximum node degree
- Graph density

### Import / Export

Graphs can be:

- exported as JSON
- imported from JSON files

---

## Supported Algorithms

### Shortest Path Algorithms

- Dijkstra's Algorithm
- Bellman-Ford Algorithm

### Graph Traversal

- Breadth-First Search (BFS)
- Depth-First Search (DFS)

### Minimum Spanning Tree

- Prim's Algorithm
- Kruskal's Algorithm

During visualization, the system highlights:

- the current node
- explored edges
- visited nodes
- updated distances
- selected MST edges

> [!NOTE]
> All algorithms are implemented manually without using external algorithm libraries.

---

## Technology Stack

### Frontend

- React.js
- JavaScript (ES6)
- HTML5
- CSS3
- SVG rendering for graph visualization

### Data Structures Implemented

- Min Heap (with decrease-key support)
- Union-Find (Disjoint Set)
- Adjacency List graph representation
- Adjacency Matrix utilities

These structures are used internally by algorithms such as Dijkstra, Prim, and Kruskal.

---

## Installation

Clone the repository:
git clone https://github.com/kaorishio15/algovisualizer.git
cd algovisualizer

Install dependencies:
npm install

Run the development server:
npm start

The application will run at: http://localhost:3000


---

## Usage

### 1. Create a Graph

Use the graph editor to add nodes and edges.

### 2. Select an Algorithm

Choose an algorithm from the algorithm panel.

### 3. Run the Visualization

Click **Run Algorithm** to begin the animation.

### 4. Control Execution

Users can:

- pause execution
- step through algorithm states
- adjust animation speed

> [!TIP]
> Try generating a random graph first to quickly experiment with algorithms.

---

## Project Structure
src/
│
├── components/
│ ├── GraphCanvas
│ ├── ControlPanel
│ └── AlgorithmVisualizer
│
├── algorithms/
│ ├── dijkstra.js
│ ├── bfs.js
│ ├── dfs.js
│ ├── prim.js
│ └── kruskal.js
│
├── data-structures/
│ ├── MinHeap.js
│ └── UnionFind.js
│
└── utils/
└── graphHelpers.js


---

## Future Improvements

Potential features for future development:

- A* Search algorithm
- Floyd-Warshall algorithm
- Topological sort visualization
- Path reconstruction display
- Improved performance for large graphs
- Mobile responsiveness

> [!IMPORTANT]
> Future updates will focus on improving scalability for graphs with large numbers of nodes and edges.

