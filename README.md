# AI‑Powered Interview Assistant

A modern, privacy‑first interview experience for candidates and interviewers. Built with a dark **Green Mist** theme, fast UX, and fully local persistence.

---

## ✨ Highlights

- **Dynamic Interviews:** **Questions** generated during the Interview (2 Easy → 2 Medium → 2 Hard), tailored to the resume context or Full Stack Development.
- **Per‑Question Timers:** Easy 20s, Medium 60s, Hard 120s with live countdown, auto‑advance, and auto‑submit at 0.
- **Smart Resume Intake:** PDF/DOCX parsed in the browser; AI extracts **Name, Email, Phone**; candidate confirms or completes missing details before starting.
- **Scoring & Summary:** Server‑side AI produces a final score (0–100), per‑question notes, and a concise hiring summary.
- **Interviewer Dashboard:** Ranked candidate list, search & sort, detail drawer with full Q/A, resume text, summary, and one‑click JSON export.
- **Persistence & Recovery:** Answers, timers, and progress persist locally (IndexedDB). “Welcome Back” modal restores an unfinished interview.
- **Fast, Accessible UI:** Next.js App Router with shadcn/ui and Tailwind v4 for a sleek, keyboard‑friendly, responsive design.

---

## 🧱 Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **AI Runtime:** Vercel AI SDK with Google (Gemini) provider — server‑side only
- **State:** Redux Toolkit + redux‑persist with **localForage** (IndexedDB)
- **Parsing:** pdf.js for PDF text, Mammoth for DOCX text
- **Validation:** Zod, validator, libphonenumber‑js
- **Routing & Guarding:** Next.js Middleware/ Proxy

---

## 🔐 Environment

Create a local environment file and provide your Gemini API key:

- `GOOGLE_GENERATIVE_AI_API_KEY` — used by the server‑side AI routes only.

---

## 🧭 User Flows

### Candidate

1. **Upload Resume** (PDF or DOCX). The app extracts raw text locally.
2. **AI Profile Extraction** finds **Name, Email, Phone** from the text and shows them for confirmation.
3. **Complete Missing Details** if anything couldn’t be parsed.
4. **Interview Preparation**: The app prepares for Interview based on the resume or Full Stack Development.
5. **Timed Interview**: Each question displays its dedicated timer and a text box for the answer. Timeouts auto‑submit and move forward.
6. **Finish & Review**: After Q6, the server calculates a **final score**, per‑question notes, and a **short summary**.
7. **Resilience**: If the tab closes or you come back later, a **Welcome Back** modal lets you **Resume** or **Discard**.

### Interviewer (Dashboard)

1. **Ranked List**: All completed candidates are listed by score (highest first).
2. **Search & Sort**: Filter by name or decision; sort by score or date.
3. **Detail View**: Open a drawer to see candidate profile, resume text, Q/A transcript, and AI notes.
4. **Export**: Download a single‑file JSON of any candidate record.
5. **Persistence**: The roster survives refresh and reopen via IndexedDB.

---

## 🏗️ Architecture Overview

- **UI Layer:** Next.js App Router pages for Candidate, Test, Result, and Dashboard.
- **Server AI:** Route Handlers generate all questions at once and compute scoring & summary at the end.
- **State & Persistence:** Redux Toolkit slices for candidate, interview, and roster; redux‑persist + localForage ensure durable client storage.
- **Guards:** Middleware redirects to Candidate if details aren’t complete (`/candidate?detail=required`).

---

## ▶️ Getting Started (High‑Level)

1. Ensure a modern Node.js runtime (20.9+ recommended).
2. Install project dependencies with your preferred package manager.
3. Create a `.env.local` file and set `GOOGLE_GENERATIVE_AI_API_KEY`.
4. Start the dev server and open the app in your browser.

---

## 📁 Primary Screens

- `Candidate` — resume upload → AI extraction → confirm details → pre‑generate questions → start
- `Test` — timed MCQ‑style free‑text answers (per question timers, autosubmit, auto‑advance)
- `Result` — total score, per‑question notes, recommendation, summary
- `Dashboard` — ranked list, search/sort, detail drawer, JSON export

---

## ✅ What’s Implemented

- Dynamic 6‑question interview with fixed timers per difficulty
- AI‑assisted resume field extraction and verification
- Cookie‑based gating and route protection
- Server‑side AI for content generation and scoring (no client keys)
- Durable local persistence with resume/recovery UX
- Admin dashboard for ranking, review, and export

