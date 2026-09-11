# LLD Practice Platform

A full-stack MERN application that helps developers practice Object-Oriented Low-Level Design (LLD). Learners pick a problem, submit a solution, and get instant, structured AI-driven feedback — scored against a fixed rubric with evidence, not a black-box "8/10" — with every attempt saved so recurring weaknesses show up across attempts, not just once.

## How It Works

1. **Choose a problem** — pick from the seeded LLD problem set (e.g., Parking Lot, Elevator, Vending Machine — *update with your actual seed list*).
2. **Design a solution** — submit a combination of a written design (requirements, classes, responsibilities), supporting code, and a diagram. <!-- TODO: confirm diagram tool and update Tech Stack below -->
3. **Submit** — the attempt is stored immediately and marked `SUBMITTED`; evaluation runs in the background so the request never blocks on the LLM call.
4. **Get feedback** — Gemini evaluates the submission against a fixed rubric and returns structured, per-criterion feedback (score, evidence, concern, suggestion).
5. **Review history** — past attempts are listed with status, and <!-- TODO: confirm — does this include a rubric-dimension trend across attempts, or just a status list? --> rubric scores are trended across attempts so you can see which dimensions are actually improving.

## 🚀 Features

* **Asynchronous AI Evaluation:** Non-blocking background evaluation flow with frontend polling to handle external LLM API latency smoothly.
* **Design Pattern Implementation:** Uses the Strategy Pattern on the backend so the evaluation engine is fully decoupled from any one provider — a second evaluator (e.g., a rule-based check, or a different LLM) can be added without touching the core practice flow.
* **Attempt Tracking & History:** All submissions and AI rubric results are saved in MongoDB, with a responsive React dashboard for reviewing past attempts.
* **Responsive UI:** Built with React, Vite, and Tailwind CSS, with collapsible feedback sections and clean error handling.

## 🛠️ Tech Stack

**Frontend:**
* React (v19)
* Vite (Build Tool & Dev Server)
* Tailwind CSS (Styling)
* Axios (Network Requests)
* TypeScript
* <!-- TODO: add your diagram library here if diagram submissions are implemented, e.g. React Flow / Excalidraw / Mermaid -->

**Backend:**
* Node.js & Express
* MongoDB (Mongoose)
* Google Gemini API (Generative AI SDK)
* Vitest (Unit & Integration Testing)

## 🏗️ Architecture Highlights

1. **Thin Controllers:** Express controllers strictly handle HTTP requests and responses, delegating business logic and external API calls to dedicated services.
2. **State Machine:** Evaluation records enforce strict state transitions: `SUBMITTED` → `EVALUATING` → `COMPLETED` / `FAILED`.
3. **Structured AI Outputs:** Uses Gemini's JSON schema constraints to guarantee structured rubric feedback without custom parsing.
4. **Swappable Evaluator:** The evaluation engine sits behind a Strategy interface, so a different provider or a deterministic rule-based evaluator can be added as a new implementation rather than a rewrite.

## ⚠️ Limitations

<!-- TODO: replace with your actual limitations, e.g.: -->
* Single LLM evaluator in the MVP; no deterministic/rule-based check yet (see Design note for the planned extension point).
* No retry/backoff on evaluator failure beyond marking the attempt `FAILED`.
* No auth/multi-user support — single learner context for the prototype.

## 📚 Related Docs

* [`RESEARCH.md`](./RESEARCH.md) — learner problem, existing tools researched, product direction

* [`AI_USAGE.md`](./AI_USAGE.md) — meaningful AI-assisted decisions during the build

---

## 💻 Getting Started

### Prerequisites
* Node.js (v18+)
* MongoDB (local instance or Atlas URI)
* Google Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd lld-practice-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the backend directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/lld-practice
   GEMINI_API_KEY=AQ.Ab8RN6KRwCl_IQuQOgKrTZFGho9Tobc5DAWMNPbPyx1sM1-igQ(Expires in 30 days).
   ```

4. Seed the database with the initial LLD problems:
   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd lld-practice-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

---

## 📜 Available Scripts

### Backend

* `npm run dev` — starts the backend server in watch mode using `tsx`.
* `npm run test` — runs the Vitest integration and unit test suites.
* `npm run seed` — populates MongoDB with the default problem set.

### Frontend

* `npm run dev` — starts the Vite development server.
* `npm run build` — compiles TypeScript and builds the frontend for production.

---

## 👨‍💻 Author

**Suyash Rusia**
