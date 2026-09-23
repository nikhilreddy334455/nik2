# 🧭 CampusFind AI — Smart Campus Lost & Found System

An AI-powered, multimodal Lost & Found platform built for college campuses. It automates the matching of lost and found items by ingesting multimodal data (images and text) and leveraging **Google Gemini 2.5 Flash** reasoning to compute match confidence scores (0-100%) and human-readable explanations.

---

## 🌟 Key Features

* **Multimodal Reporting:** Submit lost or found item reports with images, categories, precise descriptions, timestamps, and campus landmarks.
* **Automated AI Matching Engine:** Powered by `@google/genai` with `gemini-2.5-flash` using structured JSON schema (`responseSchema`).
* **Confidence Scoring & Rationale:** Every match displays a clear confidence percentage (>80% Strong, 50-80% Moderate) with plain-English reasoning detailing visual/textual correspondence.
* **Search & Filter Directory:** Real-time filtering by classification (`Lost` / `Found`), 7 strict campus target domains, and keyword search.
* **Item Match Dashboard (`/item/:id`):** Dedicated page showing item metadata, image preview, and ranked potential matches.
* **Enterprise Security:** Parameterized SQL queries, 5MB body limits, server-side API key isolation, and Zod runtime schema validation.

---

## 🏛️ Target Domain Categories

* `Electronics` (Phones, Laptops, Earbuds, Chargers)
* `Clothing` (Jackets, Hats, Scarves)
* `IDs & Wallets` (Campus IDs, Credit Cards, Purses)
* `Books & Stationery` (Textbooks, Notebooks, Pencil Cases)
* `Keys` (Dorm keys, Car keys)
* `Accessories` (Glasses, Jewelry, Watches)
* `Miscellaneous` (Water bottles, Umbrellas, etc.)

---

## 🛠️ Technology Stack

* **Frontend:** React 18 / 19 (Vite), TypeScript, Tailwind CSS, Lucide React, React Hook Form, Zod.
* **Backend:** Node.js, Express.js, TypeScript.
* **Database:** PostgreSQL (with `pg` connection pool and parameterized queries).
* **AI Model:** Google Gemini 2.5 Flash via `@google/genai` SDK.

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js >= 18.x
* PostgreSQL (Optional: if not configured, the backend automatically uses its resilient storage layer so you can run and evaluate instantly)

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```
Edit `backend/.env`:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/campus_lost_found
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install & Start Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Install & Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/items` | List items with filters (`?type=lost&category=Electronics&search=...`) |
| `GET` | `/api/items/:id` | Fetch single item details by UUID |
| `POST` | `/api/items` | Submit a lost/found report (asynchronously triggers AI matching) |
| `GET` | `/api/items/:id/matches` | Fetch AI matches sorted by confidence score DESC |
| `POST` | `/api/trigger-match/:id` | Manually re-run AI matching algorithm for an item |
| `PATCH` | `/api/items/:id/status` | Mark item as `active` or `resolved` |
| `GET` | `/api/stats` | Retrieve campus metrics (total items, matches, high confidence rate) |
| `POST` | `/api/seed` | Seed realistic campus demo data with computed AI matches |
