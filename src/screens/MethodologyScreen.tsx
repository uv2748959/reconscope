import { PASSIVE_METHODOLOGY_SUMMARY } from "../methodologyText";

const PASSIVE_EXAMPLES = [
  "Reading the target's public website, job postings, or press coverage",
  "Looking up WHOIS registration records",
  "Reviewing passive/historical DNS and certificate transparency logs",
  "Searching general search engines and social media for public mentions",
  "Reading document metadata from files the target already published",
];

const ACTIVE_EXAMPLES = [
  "Port scanning or service/version enumeration",
  "Vulnerability scanning or exploit attempts",
  "Password guessing, credential testing, or phishing",
  "Sending crafted or unusual traffic to a host to observe its response",
  "Any request the target's system has to actively process just because you sent it",
];

export default function MethodologyScreen() {
  return (
    <section className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Safety &amp; Methodology</h1>
        <p className="mt-2 text-slate-600">
          Reconnaissance ("Recon") and Scanning are two different phases of
          an authorized security assessment. ReconScope is built for Recon
          only. This page explains the difference, why it matters, and
          exactly where this app draws the line.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold">
          Passive vs. active reconnaissance
        </h2>
        <p className="mt-2 text-slate-700">
          <strong>Passive reconnaissance</strong> collects information that
          is already public, without sending the target system anything it
          has to specifically respond to. <strong>Active reconnaissance</strong>{" "}
          (and everything in the Scanning phase beyond it) involves
          contacting the target directly to see how it reacts — which is a
          different legal and ethical category, even when the target is
          authorized for a later phase.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded border border-green-200 bg-green-50 p-4">
            <h3 className="font-medium text-green-900">
              Passive — what this app is for
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-green-900">
              {PASSIVE_EXAMPLES.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </div>
          <div className="rounded border border-red-200 bg-red-50 p-4">
            <h3 className="font-medium text-red-900">
              Active / Scanning — not in this app
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-900">
              {ACTIVE_EXAMPLES.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">What this app does</h2>
        <p className="mt-2 text-slate-700">{PASSIVE_METHODOLOGY_SUMMARY}</p>
        <p className="mt-2 text-slate-700">
          Every observation you record is labeled with how it was collected
          (manual entry or the fictional demo), when it was collected, and
          how confident you are in it — so a reader can tell a confirmed
          fact from an unverified lead at a glance.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">The boundary before Scanning</h2>
        <p className="mt-2 text-slate-700">
          A beginner can easily slide from "looking things up" into
          "actively probing a host," because both feel similar day to day.
          The distinction matters: passive recon uses only information the
          target already made public, while Scanning sends traffic
          specifically to see how a system responds — and requires its own,
          separate authorization even on a target you're already allowed to
          research.
        </p>
        <p className="mt-2 text-slate-700">
          ReconScope enforces this boundary structurally rather than by
          convention: there is no port scanner, no vulnerability scanner, no
          credential-testing feature, and no code path that sends a request
          to a target at runtime, anywhere in this app. The dashboard's
          "unresolved items" and the report's recommendations exist to flag
          what would need further authorized work in a later Scanning
          phase — they don't perform that work.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Why authorization matters</h2>
        <p className="mt-2 text-slate-700">
          Public availability of information is not the same as permission
          to test a system. Every project in ReconScope requires an explicit
          scope and a recorded authorization acknowledgment before it can be
          activated — that's what the "Authorized targets only" banner and
          the scope badge on each project are for.
        </p>
      </section>
    </section>
  );
}
