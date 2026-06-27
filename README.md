# Smart Litter Spotter

AI-based litter detection and community cleanup tracker. Detect, Clean, Inspire.

## Architecture

```
Frontend (React) → Node.js (Express) → Python VLM (FastAPI + BLIP) [port 8001]
                         ↓
                    MongoDB (reports)
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Python VLM Service (Image analysis)

```bash
cd python_vlm
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Or from project root: `npm run vlm`

Uses BLIP for captioning and VQA (~2GB models, first run downloads).

### 3. Node.js Backend

```bash
npm run server
```

Runs on port 4000. Requires MongoDB (default: `mongodb://127.0.0.1:27017/smart-litter-spotter`).

### 4. Frontend

```bash
npm run dev
```

Runs on port 5173. API requests are proxied to the Node backend.

## Running the Full Stack

Open 3 terminals:

1. **Python VLM** – `npm run vlm` (port 8001)
2. **Node** – `npm run server` (port 4000)
3. **React** – `npm run dev` (port 5173)

Ensure MongoDB is running, then open http://localhost:5173/demo.

## API

- `POST /api/analyze` – Image → VLM analysis (caption, garbage, person, cleanliness)
- `POST /api/report` – Submit report (items, location, optional image)
- `GET /health` (Python VLM) – Check model status


## 👥 Team - AlgoWarrior

This project was built by **Team AlgoWarrior** as a collaborative effort.

| Name | Role |
|------|------|
| 👑 Saurabh Naulakha | Team Leader & Full Stack Developer |
| 💻 Sumit | Backend Developer |
| 🎨 Anjali | Frontend Developer |
| 🎨 Komal | UI/UX Designer|

---

## 📬 Contact

**Saurabh Naulakha** *(Team Leader)*

- 📧 Email: anjlaijakhad597@gmail.com
- 💼 LinkedIn: https://www.linkedin.com/in/anjali-jakhad-79b6643a4?utm_source=share_via&utm_content=profile&utm_medium=member_android
- 🐙 GitHub:(https://github.com/anjalijakhad597-stack)

---
*Made with ❤️ by Team AlgoWarrior*
