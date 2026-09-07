# ReconScope — agent instructions

Read `docs/PRD.md` before writing any code. It is the source of truth.

## Rules

- **Section 15 is a contract, not a suggestion.** Do not substitute a different
  framework, state library, storage mechanism, or UI approach. Do not install a
  dependency that is not listed there. If something in Section 15 seems wrong,
  say so and stop — do not route around it.
- **Runtime dependencies are exactly three:** `react`, `react-dom`,
  `react-router-dom`. Everything else is a dev dependency.
- **Build one chunk at a time**, in the order given in Section 15. Do not start
  the next chunk until the current one compiles, runs, and is committed.
- **Types come from Section 9 verbatim.** Store the exact string literals listed
  for each enum. Do not invent additional members or rename fields.
- **Seed data comes from Section 16 verbatim.** Do not invent company names,
  domains, or IP addresses. Every value must fall inside RFC 2606 or RFC 5737
  reserved space.

## Hard exclusions

This app is a documentation and organization tool for the reconnaissance phase
of an authorized classroom exercise. It must never contain:

- Port scanning, service enumeration, or host discovery
- Vulnerability scanning or exploit code
- Credential testing, password attacks, or phishing content
- Persistence, evasion, or log-tampering functionality
- Any outbound network request at runtime

FR-15 (live passive lookups) is deliberately unbuilt. Do not implement it, and
do not add it speculatively because it looks easy.

## Definition of done for any chunk

`npm run build` succeeds, `npm run test` passes, the app runs with the network
disabled, and no new runtime dependency was added.
