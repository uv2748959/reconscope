# ReconScope

**A browser-based workspace for documenting the passive reconnaissance phase of an authorized security assessment.**

🔗 **Live demo:** https://uv2748959.github.io/reconscope/

> Built as a course project for *Pentesting and Ethical Hacking*. ReconScope is deliberately limited to the **Recon** phase — it contains no port scanning, vulnerability scanning, credential testing, or exploitation code, and it never makes an outbound network request at runtime.

---

## What It Does

Reconnaissance produces a lot of small facts — a subdomain here, a job title there, a technology fingerprint from a page header — collected from scattered sources (browser tabs, notes, terminal scrollback). ReconScope gives those facts one place to live, with the metadata that matters for a professional writeup: **where it came from, when, how confident you are, and whether it's actually in scope.**

With ReconScope you can:

- **Define a project's scope** — root domain(s), subdomains, IP ranges, and exclusions — and explicitly acknowledge authorization before the project activates. A project cannot be used until this is done.
- **Log observations** by category (domain, subdomain, IP, DNS record, certificate, technology, person/role, social profile, document metadata, or a free-form note), each with a source, collection time, confidence level, tags, and analyst notes.
- **Automatically build a footprint** — every observation about a domain/IP/etc. is deduplicated into an asset, and subdomains are automatically nested under their parent domain to form a relationship tree.
- **See scope violations immediately** — any hostname or IP that falls outside your declared scope is flagged **out of scope** in red, everywhere it appears, and excluded from footprint counts.
- **Search, filter, and verify evidence** — by category, tag, confidence, status, or date range — and mark each item unverified, verified, duplicate, or out of scope.
- **View a dashboard** summarizing scope status, footprint by category, evidence totals, recent activity, and unresolved (unverified) leads.
- **Generate a report** — scope, methods, footprint summary, evidence (split into confirmed vs. unverified), sources, limitations, and next-step recommendations — and print it to PDF via the browser's own print dialog.
- **Export/import a project as JSON**, so you can back it up or move it to another browser.
- **Load a fictional demo project** (Northstar Bicycle Repair, a made-up bicycle shop on `northstar-bicycle.example`) pre-populated with realistic sample data, so you can explore every screen without typing anything in first.

## How It Works

ReconScope is a **single-page React app with no backend.** Everything happens in your browser.

- **State lives in `localStorage`**, under one key (`reconscope.v1`), as a single JSON document containing every project, scope, asset, observation, source, tag, and report. There is no server, no account, and no database — closing the tab doesn't lose your data, but clearing site data will.
- **A single reducer (`src/state/appReducer.ts`)** is the only thing allowed to change that data. Every user action — creating a project, saving an observation, loading the demo, importing a file — is a dispatched action, which keeps the data flow predictable and easy to test.
- **A single scope-check function (`src/scopeCheck.ts`)** decides whether a value is `in_scope`, `out_of_scope`, or `undetermined`. It's the only place that logic exists in the whole app, so the same rule applies everywhere a scope badge appears (hostname matching handles subdomains and exclusions; IPs are checked against CIDR ranges; anything that isn't a real hostname or IP — a technology name, a person's role, a note — is `undetermined` and is never flagged red).
- **Assets are derived automatically**, not entered by hand. When you save an observation, the app looks for an existing asset with the same type and value; if none exists, it creates one (and, for subdomains, nests it under the matching domain asset). This is what powers the Assets screen's relationship tree and the Dashboard's footprint counts.
- **The report is printed, not rendered as a PDF file.** There's a print-only stylesheet (`@media print` rules in `src/index.css`) that hides all navigation chrome and turns editable text fields into plain text, and a "Print / Save as PDF" button just calls the browser's native `window.print()`. No PDF library is bundled.
- **Export/import** uses the browser's own `Blob` + download-link mechanism for export, and `FileReader` + the same schema validation `localStorage` loading uses for import — so a re-imported file goes through exactly the same integrity checks as normal data.

### Tech stack

| Layer       | Choice                                                             |
|-------------|---------------------------------------------------------------------|
| Framework   | React 18 + TypeScript, built with Vite                              |
| Styling     | Tailwind CSS (no component library)                                 |
| Routing     | react-router-dom                                                     |
| State       | React Context + `useReducer` (no Redux/Zustand/MobX)                |
| Persistence | `localStorage` only (no IndexedDB, no server)                       |
| Testing     | Vitest + React Testing Library                                      |
| Deployment  | Static build, hosted on GitHub Pages via GitHub Actions             |

Runtime dependencies are intentionally minimal — just `react`, `react-dom`, and `react-router-dom`. Everything else (Tailwind, Vite, Vitest, TypeScript) is a dev/build-time dependency, and the production bundle is a handful of static files with no server-side code at all.

### Project structure

```
src/
├── types.ts              # Every data model (Project, Scope, Asset, Observation, Source, Tag, Report)
├── storage.ts             # The only module that touches localStorage
├── scopeCheck.ts           # The only place in-scope/out-of-scope logic exists
├── seedData.ts             # Builds the fictional demo dataset
├── methodologyText.ts       # Passive-recon explanation, shared by two screens
├── constants.ts            # Shared dropdown options and label lookups
├── state/
│   ├── appReducer.ts        # Every state transition in the app
│   └── AppContext.tsx        # React Context wiring the reducer to localStorage
├── screens/                # One component per route (Projects, Evidence Log, Report, etc.)
├── components/              # Shared UI (app shell/nav, asset tree, observation form/card)
└── utils/                   # Small pure helpers (date formatting, asset matching, JSON export)
```

## How to Install

**Prerequisites:** [Node.js](https://nodejs.org/) 18 or later (includes npm).

```bash
# 1. Clone the repository
git clone https://github.com/uv2748959/reconscope.git
cd reconscope

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Step-by-Step Instructions

1. Open ReconScope using the live demo or run it locally.
2. Create a new reconnaissance project or select **Load fictional demo**.
3. Define the authorized scope, including domains, subdomains, IP ranges, and exclusions.
4. Acknowledge authorization to activate the project.
5. Open the **Evidence Log** and record reconnaissance observations.
6. Review the **Assets** screen to see the footprint derived from the recorded evidence.
7. Use the Dashboard to review scope status, evidence totals, and unresolved leads.
8. Open **Safety & Methodology** to review passive reconnaissance and the boundary between Recon and Scanning.
9. Open the **Report** screen to review confirmed and unverified evidence, sources, limitations, and recommendations.
10. Use **Print / Save as PDF** to create a report, or export the project as JSON for backup.

### Other commands

```bash
npm run build      # Type-check and build a production bundle into dist/
npm run preview    # Serve the production build locally
npm run test       # Run the test suite (Vitest)
```

The app works completely offline once loaded — there's no API key, no environment variable, and no network dependency at runtime.

## Safety Notes

ReconScope is built for **authorized, passive reconnaissance only.** It:

- Never sends a network request to the target it's documenting — everything about a target is entered by hand or loaded from the bundled demo dataset.
- Has no port scanner, vulnerability scanner, credential-testing feature, or exploit code, and never will (see the in-app **Safety & Methodology** page for the reasoning).
- Requires an explicit scope and a recorded authorization acknowledgment before a project can be marked active.
- Ships a demo dataset that only uses domains and IP ranges reserved for documentation (`.example`, and the `192.0.2.0/24` / `198.51.100.0/24` / `203.0.113.0/24` ranges from RFC 2606 and RFC 5737) — it never references a real company, domain, or IP address.
