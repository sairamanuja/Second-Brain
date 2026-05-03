# Second Brain

A full-stack app to save, organise, and query your content using AI. Save YouTube videos, tweets, and web articles — the app auto-generates summaries and tags, embeds everything into a vector database, and lets you ask questions about your saved content in natural language.

---

## Features

- **Save content** — YouTube videos, tweets, web articles
- **Auto-summary** — Gemini generates a 2-3 sentence summary for every saved item
- **Auto-tagging** — Gemini generates 2-3 topic tags per item; tags are clickable filters on the dashboard
- **RAG pipeline** — content is chunked, embedded with Gemini, stored in Pinecone, and retrieved semantically
- **Ask Brain** — chat panel that answers questions using your saved content as context
- **Chrome extension** — right-click any page or click "Add this page" to save without opening the app
- **Share brain** — generate a public read-only link to your saved content
- **Collapsible sidebar** — filter by content type, collapse to full-width view

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, TypeScript, Tailwind CSS v4, Vite |
| Backend | Express, TypeScript, Node.js |
| Database | MongoDB (Mongoose) |
| Vector DB | Pinecone (serverless, 1024-dim, cosine) |
| AI | Google Gemini (`gemini-embedding-001` for embeddings, `gemini-2.5-flash` for generation) |
| Auth | JWT + bcrypt |
| Extension | Vanilla JS, Chrome Manifest V3 |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
Second-Brain/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── card.tsx          # Content card with summary + tag pills
│   │   │   ├── AskBrain.tsx      # Chat panel (RAG query UI)
│   │   │   ├── SideBar.tsx       # Collapsible sidebar with type filters
│   │   │   ├── CreateContentModal.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Input.tsx
│   │   ├── pages/
│   │   │   ├── DashBoard.tsx     # Main dashboard with tag filtering
│   │   │   ├── Signin.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── SharedContent.tsx
│   │   ├── hooks/
│   │   │   └── useContent.tsx    # Fetch + refresh content
│   │   └── config.ts             # BACKEND_URL from env
│   └── .env                      # VITE_BACKEND_URL
│
├── server/                   # Express backend
│   ├── src/
│   │   ├── index.ts              # All routes
│   │   ├── DB.ts                 # Mongoose models
│   │   ├── middleware.ts         # JWT auth
│   │   ├── config.ts
│   │   └── services/
│   │       ├── embedding.ts      # Gemini embed + Pinecone upsert/query (raw fetch)
│   │       ├── extractor.ts      # YouTube transcript + article scraping
│   │       └── ai.ts             # Gemini summary + tag generation
│   └── .env
│
└── extension/                # Chrome extension (no build step)
    ├── manifest.json
    ├── background.js             # Context menu save
    ├── popup.html
    ├── popup.js                  # Login + add current page
    └── icon.png
```

---

## Environment Variables

### Backend (`server/.env`)

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_HOST=your-index-host.svc.pinecone.io
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (`client/.env`)

```env
VITE_BACKEND_URL=https://your-backend.onrender.com
```

---

## Pinecone Index Setup

Create a serverless index in the Pinecone dashboard:

| Setting | Value |
|---------|-------|
| Index name | `second-brain` |
| Dimensions | `1024` |
| Metric | `cosine` |
| Cloud | AWS |
| Region | us-east-1 |

Copy the **Host** URL (not the full URL — just the host without `https://`) into `PINECONE_INDEX_HOST`.

---

## Running Locally

### Backend

```bash
cd server
npm install
# create server/.env with the vars above
npm run dev        # compiles TS then runs with node
```

### Frontend

```bash
cd client
npm install
# create client/.env with VITE_BACKEND_URL=http://localhost:3000
npm run dev        # starts Vite on http://localhost:5173
```

### Chrome Extension

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** → select the `extension/` folder
4. Click the extension icon → log in with your account
5. Right-click any page → **Save to Second Brain**, or click **+ Add this page** in the popup

---

## Deployment

### Backend → Render

1. New **Web Service** → connect GitHub repo → Root Directory: `server`
2. Build command: `npm run build`
3. Start command: `node build/index.js`
4. Add all env vars from `server/.env` in the Render dashboard

### Frontend → Vercel

1. Import repo on vercel.com → Root Directory: `client`
2. Add env var: `VITE_BACKEND_URL=https://your-backend.onrender.com`
3. Deploy — Vercel auto-detects Vite

After deploying both, update `FRONTEND_URL` in the Render env vars to your Vercel URL and redeploy the backend.

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/signup` | — | Register |
| POST | `/api/v1/signin` | — | Login, returns JWT |
| POST | `/api/v1/content` | ✓ | Save content (triggers embed pipeline) |
| GET | `/api/v1/content` | ✓ | Fetch all saved content |
| DELETE | `/api/v1/content` | ✓ | Delete by contentId |
| POST | `/api/v1/reindex` | ✓ | Re-embed all un-embedded content |
| POST | `/api/v1/brain/query` | ✓ | RAG query → answer + sources |
| POST | `/api/v1/brain/share` | ✓ | Generate/remove public share link |
| GET | `/api/v1/brain/share/:hash` | — | Fetch shared content |

---

## How the RAG Pipeline Works

```
User saves URL
     ↓
Extract text (YouTube transcript / article scrape)
     ↓
Gemini: generate summary + tags  →  save to MongoDB
     ↓
Chunk text (500 chars, 100 overlap, word boundary snap)
     ↓
Gemini embedding-001 (1024-dim) per chunk
     ↓
Upsert to Pinecone with userId metadata
     ↓
Mark content as embedded: true in MongoDB

User asks a question
     ↓
Embed query (Gemini embedding-001)
     ↓
Query Pinecone (top-5, filtered by userId)
     ↓
Gemini 2.5-flash generates answer from retrieved chunks
     ↓
Return answer + source titles/links
```

---

## Notes

- Text is capped at **8000 chars** per item before chunking to keep memory usage low
- Embeddings are upserted **one chunk at a time** (not batched) to avoid heap pressure
- Summary/tag generation is **best-effort** — if Gemini fails, content still saves
- The extension only saves `http://https` URLs — `chrome://` and `devtools://` pages are blocked
- Pinecone free tier doesn't support prefix delete, so deleting content from MongoDB does **not** remove its vectors
