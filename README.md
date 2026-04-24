# SRM BFHL — Full Stack Engineering Challenge

## Project Structure

```
srm-bfhl/
├── backend/          ← Express.js REST API
│   ├── index.js
│   └── package.json
└── frontend/         ← Static HTML/CSS/JS frontend
    ├── package.json
    └── public/
        └── index.html
```

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

## ⚠️ Before Deploying — Update Your Details

In `backend/index.js`, replace the identity fields at the top:

```js
const USER_ID = "johndoe_17091999";           // yourname_ddmmyyyy
const EMAIL_ID = "john.doe@srmist.edu.in";    // your college email
const COLLEGE_ROLL_NUMBER = "RA2111003010001"; // your roll number
```

---

## Deploying to Render (Backend)

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → New → Web Service.
3. Connect your GitHub repo.
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Deploy. Copy the URL (e.g. `https://bfhl-api.onrender.com`).

## Deploying Frontend to Netlify

1. Go to [netlify.com](https://netlify.com) → New Site → Deploy manually.
2. Drag and drop the `frontend/public/` folder.
3. After deploy, update the **API Endpoint** field in the UI to your Render URL.

> Or use Vercel / Railway — any Node.js host works for the backend.

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
  "user_id": "johndoe_17091999",
  "email_id": "john.doe@srmist.edu.in",
  "college_roll_number": "RA2111003010001",
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
