# NodeX — Full Stack Engineering Challenge

## Project Structure

backend/
  ├── index.js        
  ├── package.json    
  ├── package-lock.json 

frontend/
  ├── public/
  │   ├── index.html  
  │   ├── logo.png    
  ├── package.json    

.gitignore            
             

---

## Quick Start (Local)

### Backend

```bash
cd backend
npm install
npm start
# API runs on http://localhost:3001
# POST http://localhost:3001/bfhl
```

### Frontend

Open `frontend/public/index.html` directly in your browser **or** serve it:

```bash
cd frontend
npx serve public -p 3000
# Opens on http://localhost:3000
```

In the frontend, set the **API Endpoint** field to `http://localhost:3001/bfhl`.

---

e.js host works for the backend.

---

## API Reference

### `POST /bfhl`

**Request:**
```json
{
  "data": ["A->B", "A->C", "B->D", "hello", "1->2"]
}
```

**Response:**
```json
{
  "user_id": " ",
  "email_id": "  @srmist.edu.in",
  "college_roll_number": "RA..",
  "hierarchies": [
    { "root": "A", "tree": { "A": { "B": {}, "C": {} } }, "depth": 2 }
  ],
  "invalid_entries": ["hello", "1->2"],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

---

## Processing Rules Implemented

- ✅ Valid format: `X->Y` (single uppercase letters only)
- ✅ Invalid: multi-char nodes, wrong separator, self-loops, empty strings, non-uppercase
- ✅ Whitespace trimmed before validation
- ✅ Duplicate edges: first occurrence used, rest pushed to `duplicate_edges` once
- ✅ Diamond/multi-parent: first-encountered parent wins
- ✅ Cycle detection (DFS)
- ✅ Cyclic group: `has_cycle: true`, `tree: {}`, no `depth`
- ✅ Pure cycles: lexicographically smallest node as root
- ✅ Depth = longest root-to-leaf node count
- ✅ Summary tiebreaker: lexicographically smaller root
- ✅ CORS enabled
