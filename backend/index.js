const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── Identity (replace with your real details) ─────────────────────────────────
const USER_ID = "rishitmathur_10102005";
const EMAIL_ID = "rm8238@srmist.edu.in";
const COLLEGE_ROLL_NUMBER = "RA2311003010670";
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a single entry.
 * Returns the trimmed entry if valid, or null if invalid.
 * Rules:
 *   - Trim first
 *   - Must match /^[A-Z]->[A-Z]$/
 *   - A->A is invalid (self-loop)
 */
function isValidEntry(raw) {
  const entry = raw.trim();
  if (!/^[A-Z]->[A-Z]$/.test(entry)) return null;
  const [parent, child] = entry.split("->");
  if (parent === child) return null; // self-loop
  return entry;
}

/**
 * Build the nested tree object for a given root using the children map.
 * Uses iterative DFS to avoid stack overflows on large inputs.
 */
function buildTree(root, childrenMap) {
  const result = {};
  const stack = [{ node: root, ref: result }];

  while (stack.length > 0) {
    const { node, ref } = stack.pop();
    ref[node] = {};
    const kids = childrenMap[node] || [];
    for (const child of kids) {
      stack.push({ node: child, ref: ref[node] });
    }
  }

  return result;
}

/**
 * Calculate depth (longest root-to-leaf node count) of a nested tree object.
 */
function calcDepth(treeObj, root) {
  const node = treeObj[root];
  if (!node || Object.keys(node).length === 0) return 1;

  let max = 0;
  for (const child of Object.keys(node)) {
    max = Math.max(max, calcDepth(node, child));
  }
  return 1 + max;
}

/**
 * Detect cycle in a group of nodes using DFS.
 * childrenMap: { node: [children] }
 * groupNodes: Set of nodes in this group
 */
function hasCycle(groupNodes, childrenMap) {
  const visited = new Set();
  const recStack = new Set();

  function dfs(node) {
    visited.add(node);
    recStack.add(node);
    const kids = childrenMap[node] || [];
    for (const child of kids) {
      if (!groupNodes.has(child)) continue;
      if (!visited.has(child)) {
        if (dfs(child)) return true;
      } else if (recStack.has(child)) {
        return true;
      }
    }
    recStack.delete(node);
    return false;
  }

  for (const node of groupNodes) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }
  return false;
}

/**
 * Find connected components (undirected) from all group nodes and edges.
 */
function findConnectedComponents(allNodes, edges) {
  const parent = {};
  for (const n of allNodes) parent[n] = n;

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(a, b) {
    parent[find(a)] = find(b);
  }

  for (const [p, c] of edges) {
    union(p, c);
  }

  const groups = {};
  for (const n of allNodes) {
    const root = find(n);
    if (!groups[root]) groups[root] = new Set();
    groups[root].add(n);
  }

  return Object.values(groups);
}

app.post("/bfhl", (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: "data must be an array" });
  }

  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const validEdges = []; // [parent, child]
  const childrenMap = {}; // parent -> [children]
  const parentCount = {}; // child -> number of accepted parents

  for (const raw of data) {
    const entry = typeof raw === "string" ? isValidEntry(raw) : null;

    if (entry === null) {
      invalidEntries.push(typeof raw === "string" ? raw : String(raw));
      continue;
    }

    if (seenEdges.has(entry)) {
      // Push duplicate only once (first repeat)
      if (!duplicateEdges.includes(entry)) {
        duplicateEdges.push(entry);
      }
      continue;
    }

    seenEdges.add(entry);

    const [parent, child] = entry.split("->");

    // Diamond / multi-parent: first-encountered parent wins
    if (parentCount[child] && parentCount[child] >= 1) {
      // silently discard
      continue;
    }

    parentCount[child] = (parentCount[child] || 0) + 1;

    if (!childrenMap[parent]) childrenMap[parent] = [];
    childrenMap[parent].push(child);

    validEdges.push([parent, child]);
  }

  // Collect all unique nodes from valid edges
  const allNodes = new Set();
  for (const [p, c] of validEdges) {
    allNodes.add(p);
    allNodes.add(c);
  }

  // Find connected components (undirected graph)
  const components = findConnectedComponents(allNodes, validEdges);

  // All child nodes (have a parent)
  const childNodes = new Set(validEdges.map(([, c]) => c));

  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;

  for (const groupSet of components) {
    const groupNodes = groupSet;

    // Determine root(s) in this group: nodes not appearing as a child
    const roots = [...groupNodes].filter((n) => !childNodes.has(n));

    // If no root exists (pure cycle), pick lexicographically smallest
    const root =
      roots.length > 0
        ? roots.sort()[0]
        : [...groupNodes].sort()[0];

    const cycle = hasCycle(groupNodes, childrenMap);

    if (cycle) {
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });
      totalCycles++;
    } else {
      const tree = buildTree(root, childrenMap);
      const depth = calcDepth(tree, root);
      hierarchies.push({
        root,
        tree,
        depth,
      });
      totalTrees++;
    }
  }

  // Sort hierarchies: non-cyclic trees first by root alpha, then cyclic
  hierarchies.sort((a, b) => {
    if (a.has_cycle && !b.has_cycle) return 1;
    if (!a.has_cycle && b.has_cycle) return -1;
    return a.root.localeCompare(b.root);
  });

  // Summary: largest_tree_root — greatest depth; tiebreak lexicographically smaller root
  const nonCyclic = hierarchies.filter((h) => !h.has_cycle);
  let largestTreeRoot = "";

  if (nonCyclic.length > 0) {
    const sorted = [...nonCyclic].sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return a.root.localeCompare(b.root);
    });
    largestTreeRoot = sorted[0].root;
  }

  return res.json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  });
});

// Health check
app.get("/", (req, res) => res.json({ status: "ok", message: "BFHL API running" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BFHL API running on port ${PORT}`));
