# Algorithms Visualiser

Website: https://algorithm-v.netlify.app/

A clean, interactive web application for visualising data structures and algorithms — including stacks, queues, linked lists, binary trees, and search/traversal algorithms like BFS, DFS, linear search, and binary search. Features smooth zoom/pan, step-through execution, and target highlighting.

## Features
- **Data Structures**: Stack, Queue, Linked List, Binary Tree.
- **Algorithms**: BFS, DFS (pre/in/post-order), Linear Search, Binary Search.
- **Interactive Controls**:
  - Load values via comma/space-separated input.
  - Add/remove elements dynamically.
  - Step through algorithms or run continuously.
  - Highlight visited nodes and found targets.
- **Zoom & Pan**: Drag to pan; Ctrl/⌘ + scroll or use +/- buttons to zoom.
- **Responsive Layout**: Works across desktop and tablet screen sizes.

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/algorithms-visualiser.git
cd algorithms-visualiser
```

### 2. Open in browser
Just open `index.html` in your preferred browser — no build step required.

### 3. Deploy to Netlify
- Drag and drop the project folder into [Netlify Drop](https://app.netlify.com/drop), **or**
- Push to GitHub and connect the repo to Netlify.

## File Structure
```
algorithms-visualiser/
├── index.html    # HTML structure
├── styles.css    # Styling for the app
└── app.js        # Logic for rendering and controlling the visualiser
```

## Example Usage
1. Select a data structure (e.g., Binary Tree).
2. Enter values like `5, 3, 8, 1, 4, 7, 9, 0`.
3. Choose BFS, DFS, or a search algorithm.
4. Run or step through the algorithm — watch visited nodes highlight in real time.

## License
This project is licensed under the MIT License — see the LICENSE file for details.
