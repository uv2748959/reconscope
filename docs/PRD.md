# ReconScope — Product Requirements Document

*Authorized Reconnaissance Workspace for a Fictional Small Company*

| **Field**        | **Value**                                                         |
|------------------|-------------------------------------------------------------------|
| Assignment       | Create and upload a web app for the Recon phase                   |
| Prepared by      | Ulises Valdivia                                                   |
| Course           | Pentesting and Ethical Hacking                                    |
| Version / Date   | v1.1 • September 7, 2026                                          |
| Status           | Proposed MVP                                                      |
| Build method     | AI-assisted implementation (Claude Code in VS Code)               |
| Intended readers | Course instructor and the AI coding agent that will build the app |

> **Product decision**
>
> Build a beginner-friendly web application that organizes passive and explicitly authorized reconnaissance. The MVP demonstrates the Recon phase without crossing into port scanning, vulnerability assessment, exploitation, or persistence.

> **How to use this document**
>
> Sections 1–13 describe what the product is and why, and are written for a human reader. Sections 14–16 are the implementation contract: every open decision there has been closed so that an AI coding agent produces the same architecture on every session. If the two ever conflict, Section 15 wins for code and Section 7 wins for behavior.

## 1. Executive Summary

ReconScope is a web application for an ethical-hacking student conducting an authorized reconnaissance exercise against a fictional small company. It creates a structured workspace for defining scope, collecting public-facing information, recording evidence, connecting related assets, and exporting a professional reconnaissance summary.

Because the assignment does not yet prescribe a textbook, toolset, or detailed rubric, this PRD favors a small, demonstrable product over a broad automated scanner. The app can be shown reliably with a fictional dataset and can optionally accept user-entered results from approved public sources.

This document is also the build specification. It is written to be handed directly to an AI coding agent, which means requirements are stated as decidable rules rather than as preferences, and every architectural choice is pinned rather than suggested.

## 2. Problem Statement

Reconnaissance produces a large volume of small, low-context facts: a subdomain here, a job title there, a technology fingerprint from a page header. Those facts arrive through different tools and land in different places — browser tabs, screenshots, terminal scrollback, handwritten notes — so nothing carries its source or its collection time with it. By the time the engagement is written up, the analyst can no longer prove where a given fact came from, and unverified leads are indistinguishable from confirmed findings.

A second failure compounds the first. Without an explicit phase boundary, a beginner slides from reading public information into actively probing a host, because both feel like "looking things up." The distinction that matters legally and ethically is invisible in the workflow.

ReconScope addresses both: every observation is stored with its source, method, timestamp, and confidence, and the application deliberately contains no capability that belongs to a later phase.

## 3. Goals and Success Measures

| **Goal**                     | **MVP success measure**                                                                                                |
|------------------------------|------------------------------------------------------------------------------------------------------------------------|
| Keep activity authorized     | A project cannot be activated until scope and authorization acknowledgment are recorded.                               |
| Organize recon evidence      | Every saved observation contains a category, source, timestamp, method, confidence, and analyst note.                  |
| Show the public footprint    | The dashboard summarizes discovered domains, IPs, DNS records, technologies, people/roles, and sources.                |
| Separate Recon from Scanning | No port scan, vulnerability scan, credential test, exploit, or persistence function exists in the codebase.            |
| Produce a useful deliverable | A user can generate a print-ready report from stored project data and save it as PDF through the browser print dialog. |

## 4. Users and Primary Scenario

### Primary user

A beginning ethical-hacking student who needs a safe, understandable way to conduct and document reconnaissance for an authorized classroom exercise.

### Primary scenario

1. The student creates a project for a fictional company and records the approved domain and boundaries.

2. The student reviews the authorization notice and confirms that only permitted targets will be used.

3. The student loads the fictional demo dataset or manually enters data found through approved reconnaissance sources.

4. The app organizes the results into assets, evidence, and observations, then displays a footprint summary.

5. The student reviews unknowns and recommended follow-up items for the later Scanning phase.

6. The student exports a reconnaissance report for submission.

## 5. Assumptions

- All companies, domains, employees, systems, and findings used in the submitted demonstration are fictional or instructor-provided.

- The student has written classroom authorization for any instructor-provided target.

- The assignment evaluates understanding of the Recon phase and the quality of the web app, not the volume of collected data.

- The deployed front end may not have reliable access to WHOIS, DNS, certificate-transparency, or other third-party APIs because of authentication, rate limits, or browser CORS restrictions.

- Therefore, demo mode and manual evidence entry are required; live integrations are deferred out of this release entirely.

- The application is single-user and requires no account, login, or server-side state.

## 6. Scope

| **In scope for MVP**                                                              | **Out of scope**                                                         |
|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| Project setup, target scope, authorization acknowledgment                         | Port scanning or service enumeration                                     |
| Passive OSINT and user-entered authorized observations                            | Vulnerability scanning or CVE exploitation                               |
| Domain, DNS, certificate, IP, technology, public contact/role, and source records | Password attacks, credential validation, phishing, or social engineering |
| Evidence notes, timestamps, source URLs, and confidence labels                    | Malware, shells, persistence, lateral movement, or covering tracks       |
| Dashboard, relationships, filtering, and report export                            | Automatic collection of personal sensitive data                          |
| Fictional demo dataset                                                            | Testing any target outside the documented scope                          |
| Local-only browser storage                                                        | Any outbound network request from the application at runtime             |

## 7. Functional Requirements

Priorities use MoSCoW. "Must" requirements are the graded MVP; "Won't" items are explicitly excluded from this release and must not be implemented speculatively.

| **ID** | **Requirement**                                                                                                                                                                                                   | **Priority**         |
|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|
| FR-01  | Create, rename, open, and delete a reconnaissance project.                                                                                                                                                        | Must                 |
| FR-02  | Record company alias, authorized root domain, allowed subdomains/IP ranges, exclusions, engagement dates, and authorization acknowledgment.                                                                       | Must                 |
| FR-03  | Block project activation until the user checks an authorization statement. Store the acknowledgment timestamp.                                                                                                    | Must                 |
| FR-04  | Provide a fictional demo project populated with the seed data defined in Section 16.                                                                                                                              | Must                 |
| FR-05  | Add observations manually by category: domain, DNS, certificate, IP, technology, public contact/role, social presence, document metadata, or note.                                                                | Must                 |
| FR-06  | For each observation, record value, source, collection time, method, confidence, tags, and analyst notes.                                                                                                         | Must                 |
| FR-07  | Display summary cards and a relationship view connecting the company, domains, hosts/IPs, technologies, and evidence.                                                                                             | Must                 |
| FR-08  | Search and filter observations by category, tag, confidence, status, and date range.                                                                                                                              | Must                 |
| FR-09  | Mark an observation as unverified, verified, duplicate, or out of scope.                                                                                                                                          | Must                 |
| FR-10  | Generate a report containing scope, methods, footprint summary, evidence, limitations, and next-step recommendations.                                                                                             | Must                 |
| FR-11  | Export project data as a JSON file and re-import a previously exported file.                                                                                                                                      | Should               |
| FR-12  | Edit and delete an existing observation, with a confirmation step before deletion.                                                                                                                                | Must                 |
| FR-13  | Evaluate every saved asset or observation value against the project scope and label it in scope, out of scope, or undetermined. Display a warning on out-of-scope records and exclude them from footprint counts. | Must                 |
| FR-14  | Provide a Methodology screen explaining passive versus active reconnaissance and the boundary between Recon and Scanning.                                                                                         | Must                 |
| FR-15  | Query live passive data sources through a backend adapter.                                                                                                                                                        | Won’t (this release) |

## 8. Information Architecture and Screens

| **Screen**           | **Route**              | **Purpose**                                                                      |
|----------------------|------------------------|----------------------------------------------------------------------------------|
| Projects             | /                      | List projects and launch the fictional demo.                                     |
| New Project / Scope  | /projects/new          | Capture authorization, allowed targets, exclusions, and dates.                   |
| Dashboard            | /projects/:id          | Show counts, categories, recent evidence, scope status, and unresolved items.    |
| Assets               | /projects/:id/assets   | Browse domains, DNS records, IPs, technologies, people/roles, and relationships. |
| Evidence Log         | /projects/:id/evidence | Create, edit, delete, filter, verify, and cite observations.                     |
| Report               | /projects/:id/report   | Preview, print, and export the reconnaissance summary.                           |
| Safety & Methodology | /methodology           | Explain passive vs. active reconnaissance and the boundary before Scanning.      |

## 9. Data Model

Field types are TypeScript types. Enum members are the exact string literals to store; do not substitute display labels for stored values. All timestamps are ISO 8601 strings in UTC. All ids are UUID v4 strings generated with crypto.randomUUID().

### Project

| **Field**             | **Type**       | **Notes**                                 |
|-----------------------|----------------|-------------------------------------------|
| id                    | string         | UUID v4                                   |
| name                  | string         | 1–80 characters, required                 |
| companyAlias          | string         | Fictional company name                    |
| description           | string         | 0–500 characters                          |
| startDate / endDate   | string \| null | ISO date (YYYY-MM-DD)                     |
| isActive              | boolean        | False until authorization is acknowledged |
| createdAt / updatedAt | string         | ISO datetime                              |

### Scope

| **Field**              | **Type**       | **Notes**                                                 |
|------------------------|----------------|-----------------------------------------------------------|
| projectId              | string         | One Scope per Project                                     |
| rootDomains            | string\[\]     | Lowercased, no scheme, no trailing dot                    |
| subdomains             | string\[\]     | Fully qualified                                           |
| ipRanges               | string\[\]     | CIDR notation                                             |
| exclusions             | string\[\]     | Domains or CIDRs excluded from an otherwise allowed range |
| authorizationConfirmed | boolean        | Default false                                             |
| authorizationNote      | string         | Free text, e.g. reference to the classroom authorization  |
| acknowledgedAt         | string \| null | ISO datetime, set when confirmed                          |

### Asset

| **Field**            | **Type**       | **Notes**                                                                                                                           |
|----------------------|----------------|-------------------------------------------------------------------------------------------------------------------------------------|
| id / projectId       | string         | UUID v4                                                                                                                             |
| type                 | AssetType      | "domain" \| "subdomain" \| "ip" \| "dns_record" \| "certificate" \| "technology" \| "person_role" \| "social_profile" \| "document" |
| value                | string         | The asset itself, e.g. shop.northstar-bicycle.example                                                                               |
| parentAssetId        | string \| null | Enables the relationship tree; null means root                                                                                      |
| firstSeen / lastSeen | string         | ISO datetime                                                                                                                        |
| scopeStatus          | ScopeStatus    | "in_scope" \| "out_of_scope" \| "undetermined"                                                                                      |

### Observation

| **Field**      | **Type**            | **Notes**                                                                         |
|----------------|---------------------|-----------------------------------------------------------------------------------|
| id / projectId | string              | UUID v4                                                                           |
| assetId        | string \| null      | Null for standalone notes                                                         |
| category       | ObservationCategory | All AssetType members plus "note"                                                 |
| value          | string              | Required, 1–500 characters                                                        |
| method         | Method              | "manual" \| "demo" \| "passive_lookup" — MVP writes only "manual" and "demo"      |
| confidence     | Confidence          | "low" \| "medium" \| "high"                                                       |
| status         | ObsStatus           | "unverified" \| "verified" \| "duplicate" \| "out_of_scope"; default "unverified" |
| sourceId       | string \| null      | References Source                                                                 |
| tagIds         | string\[\]          | References Tag                                                                    |
| notes          | string              | Analyst note, 0–2000 characters                                                   |
| collectedAt    | string              | ISO datetime, user-editable, defaults to now                                      |

### Source, Tag, Report

| **Entity** | **Core fields**                                                                                                                                                      |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Source     | id, name, url (string \| null), sourceType: "website" \| "whois" \| "dns" \| "cert_transparency" \| "search_engine" \| "social" \| "document" \| "other", accessedAt |
| Tag        | id, label (1–24 chars), color (hex string, from a fixed palette of eight)                                                                                            |
| Report     | id, projectId, generatedAt, summary, limitations, recommendations                                                                                                    |

## 10. Safety, Privacy, and Ethical Controls

- Display "Authorized targets only" in project creation and the persistent application header.

- Require exact scope entry and highlight observations that do not match an approved domain or IP range.

- Collect only information relevant to the authorized objective; avoid sensitive personal data and redact it from exports when encountered accidentally.

- Label each record with its method. The MVP writes only "manual" and "demo".

- Do not claim that public availability equals permission to probe a system.

- Do not silently contact a target. The MVP makes no outbound network requests at runtime; any future live integration must identify the source, request confirmation, use rate limits, and log the request.

- Never include features for log deletion, stealth, evasion, credential attacks, exploitation, or persistence.

## 11. Nonfunctional Requirements

| **Area**          | **Requirement**                                                                                                                                                                                               |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Usability         | A first-time user can create a demo project and add one observation without instructions.                                                                                                                     |
| Accessibility     | Keyboard navigation, semantic labels, visible focus, contrast meeting WCAG 2.1 AA, and no color-only status cues — every badge pairs color with text.                                                         |
| Performance       | Dashboard renders within two seconds with 1,000 stored observations on a typical student laptop. Evidence Log virtualizes or paginates above 200 rows.                                                        |
| Reliability       | Core demo and manual-entry workflows function with no network connection at all.                                                                                                                              |
| Security          | Validate inputs, render all user text through React’s default escaping, never use dangerouslySetInnerHTML, avoid storing secrets, and require explicit confirmation before deleting a project or observation. |
| Privacy           | Store projects in browser localStorage only. No analytics, no telemetry, no third-party scripts.                                                                                                              |
| Responsive design | Support current desktop browsers and remain usable at 768px width.                                                                                                                                            |

## 12. User Experience Requirements

The interface should resemble a restrained security analyst workspace rather than a "hacker" movie screen: no terminal-green monospace theme, no animated matrix effects. Use clear terminology, short explanations, and visible scope status. The application should teach while it guides — unfamiliar terms get a tooltip or brief helper text.

| **UI element**    | **Expected behavior**                                                                                                                                                             |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Scope badge       | Green with the label "Authorized" when acknowledgment is recorded; amber "Incomplete" when scope fields are missing; red "Out of scope" on any record that fails the scope check. |
| Dashboard cards   | Show assets by category, evidence count, verified/unverified totals, and last update.                                                                                             |
| Relationship view | A nested, expandable tree built from Asset.parentAssetId. Selecting a node opens its evidence records.                                                                            |
| Evidence form     | Use category-specific fields while preserving a common source, timestamp, confidence, and notes structure.                                                                        |
| Empty states      | Explain what belongs in the section and offer "Load fictional demo" or "Add observation."                                                                                         |
| Report preview    | Clearly separate confirmed observations, unverified leads, limitations, and later-phase recommendations.                                                                          |

## 13. Acceptance Criteria

Each criterion maps to the requirement it verifies.

| **Verifies** | **Criterion**                                                                                                                                                                                                 |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| FR-03        | Given a new project, when authorization is not acknowledged, then the user cannot activate the workspace and the Save button is disabled with an explanatory message.                                         |
| FR-05, FR-07 | Given an active project, when an observation is saved, then it appears in the Evidence Log and the related dashboard count increments.                                                                        |
| FR-13        | Given an asset outside the entered scope, when it is saved, then the app displays an out-of-scope warning, sets scopeStatus to "out_of_scope", and excludes it from footprint counts.                         |
| FR-04        | Given the fictional demo, when it loads, then the dashboard, assets, evidence, and report contain coherent sample information and the browser network tab shows no outbound requests.                         |
| FR-08        | Given saved evidence, when the user filters by category, confidence, or status, then only matching records are displayed and the active filters are visible.                                                  |
| FR-12        | Given an existing observation, when the user deletes it, then a confirmation is required and the dashboard counts update on completion.                                                                       |
| FR-10        | Given a completed project, when the user opens Report, then scope, methods, findings, sources, limitations, and recommendations are present, and the print stylesheet renders them without navigation chrome. |
| FR-11        | Given an exported JSON file, when it is re-imported into an empty browser profile, then the project reconstructs with identical counts.                                                                       |
| Section 6    | The deployed MVP contains no feature that performs scanning, exploitation, credential testing, persistence, or log tampering, and no runtime outbound network call.                                           |

## 14. Recommended Technical Approach

A single-page React application with no backend. All state lives in the browser, which removes accounts, servers, API keys, and CORS from the project entirely and makes the demo reproducible on any machine during grading.

The report is produced with a print stylesheet and window.print(), so the grader saves a PDF through the browser rather than the app bundling a PDF library. JSON export uses a Blob download.

> **Safe sample data**
>
> Use reserved example domains (RFC 2606) and documentation address ranges (RFC 5737): 192.0.2.0/24, 198.51.100.0/24, or 203.0.113.0/24. Do not seed the project with a real small company, and do not use a real registrable domain even if it appears unused.

## 15. Implementation Contract

These decisions are closed. The coding agent must not substitute alternatives, and must not add dependencies not listed here without an explicit instruction.

| **Decision**               | **Pinned choice**                                                                                      |
|----------------------------|--------------------------------------------------------------------------------------------------------|
| Framework                  | React 18 with TypeScript, built with Vite                                                              |
| Styling                    | Tailwind CSS. No component library.                                                                    |
| Routing                    | react-router-dom, using the routes in Section 8                                                        |
| State                      | React context plus useReducer. No Redux, Zustand, or MobX.                                             |
| Persistence                | localStorage under a single key, "reconscope.v1". No IndexedDB, no server.                             |
| Relationship view          | Nested HTML list with CSS. Do not install d3, cytoscape, react-flow, or any graph library.             |
| Report export              | CSS @media print plus window.print(). Do not install jsPDF, html2canvas, or Puppeteer.                 |
| IDs                        | crypto.randomUUID()                                                                                    |
| Dates                      | Native Intl and Date. No moment, dayjs, or date-fns.                                                   |
| Testing                    | Vitest with React Testing Library, covering the scope-check function and the storage layer at minimum. |
| Total runtime dependencies | react, react-dom, react-router-dom. Everything else is a dev dependency.                               |

### Storage shape

One JSON object under localStorage key "reconscope.v1":

| **Key**       | **Value**                                                                  |
|---------------|----------------------------------------------------------------------------|
| schemaVersion | number, currently 1 — read it on load and refuse to parse a higher version |
| projects      | Project\[\]                                                                |
| scopes        | Scope\[\]                                                                  |
| assets        | Asset\[\]                                                                  |
| observations  | Observation\[\]                                                            |
| sources       | Source\[\]                                                                 |
| tags          | Tag\[\]                                                                    |
| reports       | Report\[\]                                                                 |

All reads and writes go through a single storage module. No component touches localStorage directly. Every write is wrapped so that a QuotaExceededError surfaces as a visible error state rather than silent data loss.

### Scope-check rule

A single pure function, isInScope(value, scope), returns "in_scope", "out_of_scope", or "undetermined". It is the only place scope logic exists, and it is unit tested.

- A hostname is in scope if it exactly matches a root domain, is a subdomain of a root domain, or exactly matches a listed subdomain — and does not match any exclusion.

- An IP is in scope if it falls inside a listed CIDR range and not inside an excluded range.

- Values that are not hostnames or IPs — technologies, people, notes — return "undetermined" and are never flagged red.

- Comparison is case-insensitive; trailing dots and leading "www." are normalized before comparison.

- A value that looks like an IP address (dot-separated digit groups, e.g. 192.0.2.999 or 192.0.2) but fails IPv4 octet/format validation is not a valid address, so scope does not apply — it returns "undetermined" rather than falling through to hostname matching.

### Build order

Build in this order, one chunk per working session. Each chunk must compile and run before the next begins.

| **Chunk**                | **Scope of work**                                                                                                                                      |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1\. Skeleton             | Vite + TS + Tailwind + router. All seven routes render placeholder screens. App shell with persistent header and the "Authorized targets only" banner. |
| 2\. Types and storage    | Every type from Section 9 in one types.ts. Storage module with load, save, and reset. Scope-check function with unit tests. No UI yet.                 |
| 3\. Projects and scope   | FR-01, FR-02, FR-03. Project list, creation form, authorization gate.                                                                                  |
| 4\. Evidence             | FR-05, FR-06, FR-08, FR-09, FR-12, FR-13. Evidence Log with create, edit, delete, filter, status, and scope warnings.                                  |
| 5\. Assets and dashboard | FR-07. Asset list, relationship tree, dashboard summary cards.                                                                                         |
| 6\. Demo data            | FR-04. Seed dataset from Section 16, loadable and resettable.                                                                                          |
| 7\. Report and export    | FR-10, FR-11. Report screen, print stylesheet, JSON export and import.                                                                                 |
| 8\. Quality pass         | FR-14, accessibility audit, empty and error states, responsive check, deployment.                                                                      |

## 16. Seed Dataset Specification

The demo dataset is part of the specification, not something for the agent to invent. Inventing a plausible small business risks naming a real one.

| **Element**          | **Value**                                                                                                                                     |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| Company alias        | Northstar Bicycle Repair                                                                                                                      |
| Root domain          | northstar-bicycle.example                                                                                                                     |
| Subdomains           | www, shop, mail, vpn — all under northstar-bicycle.example                                                                                    |
| IP range in scope    | 192.0.2.0/24                                                                                                                                  |
| Out-of-scope example | One asset at 198.51.100.14, included specifically so the out-of-scope warning is visible in the demo                                          |
| Technologies         | A small realistic stack, e.g. nginx, WordPress, Cloudflare, Google Workspace                                                                  |
| People / roles       | Three fictional staff with role titles and @northstar-bicycle.example addresses; no real names                                                |
| Observations         | Between 18 and 25 records spread across at least six categories, with a mix of low, medium, and high confidence and at least three unverified |
| Sources              | Four to six fictional sources across different sourceType values                                                                              |

Every value in the seed set must fall inside RFC 2606 or RFC 5737 reserved space. The agent must not generate a seed value outside those ranges.

## 17. Risks and Mitigations

| **Risk**                                                                                                       | **Mitigation**                                                                                                                                                                 |
|----------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Assignment expectations change after the textbook is selected.                                                 | Keep requirements modular and map new instructions to features before expanding scope.                                                                                         |
| Third-party APIs fail or require keys.                                                                         | Removed from this release. Offline demo and manual entry are the only workflows.                                                                                               |
| Recon and scanning become confused.                                                                            | Use in-app phase labels and keep port/service/vulnerability functions out of the codebase entirely.                                                                            |
| The app appears to test real organizations.                                                                    | Use a fictional identity, reserved domains/IPs, visible authorization language, and demo-mode labeling.                                                                        |
| Generated code introduces unsafe input handling.                                                               | Validate fields, rely on React escaping, ban dangerouslySetInnerHTML, and test import/export paths.                                                                            |
| The coding agent drifts across sessions — different state library, different storage, half-finished refactors. | Section 15 pins every architectural decision. Start each session by pointing the agent at this document and the current chunk, and finish each chunk before starting the next. |
| Scope creep during vibe coding, e.g. adding a live lookup because it seems easy.                               | FR-15 is marked "Won’t" rather than omitted, so the exclusion is explicit in the spec the agent reads.                                                                         |

## 18. Open Questions and Working Defaults

Each question is carried with a default so that no answer is required before building. If the instructor answers differently, the affected requirement is revised rather than the whole plan.

| **Question for the instructor**                                                                                           | **Working default until answered**                                       |
|---------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| Is the expected Recon phase passive only, or may the app include authorized active reconnaissance?                        | Passive only. Active capability is out of scope and out of the codebase. |
| Must the web app perform live collection, or is organizing and reporting recon results sufficient?                        | Organizing and reporting. FR-15 stays unbuilt.                           |
| Is a specific framework, hosting platform, database, or courseware lab required?                                          | React + TypeScript, static hosting, no database.                         |
| What evidence must be included in the submission: source code, deployed URL, screenshots, report, or demonstration video? | Prepare all five; they are cheap to produce once the app is done.        |
| Will grading emphasize technical implementation, methodology, UI/UX, documentation, or all four?                          | Assume all four are weighted equally.                                    |

## 19. Definition of Done

The MVP is done when it is deployed or packaged for upload, the fictional demo completes the primary scenario with the network disabled, all Must requirements and acceptance criteria pass, the project clearly documents authorization and scope, and the exported report accurately represents reconnaissance work without claiming that scanning or exploitation occurred.
