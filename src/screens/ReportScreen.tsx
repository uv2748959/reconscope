import { useId, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../state/AppContext";
import {
  categoryLabel,
  sourceTypeLabel,
  statusLabel,
} from "../constants";
import { formatDateTime } from "../utils/dateInput";
import { buildProjectExportData } from "../utils/projectExport";
import { downloadJson, slugify } from "../utils/downloadFile";
import { PASSIVE_METHODOLOGY_SUMMARY } from "../methodologyText";
import type { AssetType, Observation, Report } from "../types";

const DEFAULT_LIMITATIONS =
  "This report reflects only passive, non-intrusive reconnaissance performed within the documented scope. It does not include active scanning, exploitation, or verification of unconfirmed leads. Information sourced from third parties (search results, social media) has not been independently corroborated.";

const DEFAULT_RECOMMENDATIONS =
  "Verify unresolved and unverified leads before treating them as confirmed. Do not test any asset flagged out of scope. If further testing is authorized, proceed to a documented Scanning phase covering only the in-scope hosts identified here.";

function ObservationListItem({ observation }: { observation: Observation }) {
  return (
    <li className="border-b border-slate-100 py-2 last:border-0">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {categoryLabel(observation.category)}
        </span>
        <span className="font-medium">{observation.value}</span>
        <span className="text-sm text-slate-500">
          ({observation.confidence} confidence)
        </span>
      </div>
      {observation.notes && (
        <p className="mt-1 text-sm text-slate-700">{observation.notes}</p>
      )}
    </li>
  );
}

export default function ReportScreen() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useApp();

  const project = state.projects.find((p) => p.id === id);
  const scope = state.scopes.find((s) => s.projectId === id);
  const existingReport = state.reports.find((r) => r.projectId === id);

  const [limitations, setLimitations] = useState(
    existingReport?.limitations ?? DEFAULT_LIMITATIONS,
  );
  const [recommendations, setRecommendations] = useState(
    existingReport?.recommendations ?? DEFAULT_RECOMMENDATIONS,
  );
  const [savedMessage, setSavedMessage] = useState(false);

  const limitationsId = useId();
  const recommendationsId = useId();

  const projectAssets = useMemo(
    () => state.assets.filter((a) => a.projectId === id),
    [state.assets, id],
  );
  const projectObservations = useMemo(
    () => state.observations.filter((o) => o.projectId === id),
    [state.observations, id],
  );

  const inFootprintAssets = useMemo(
    () => projectAssets.filter((a) => a.scopeStatus !== "out_of_scope"),
    [projectAssets],
  );
  const outOfScopeAssets = useMemo(
    () => projectAssets.filter((a) => a.scopeStatus === "out_of_scope"),
    [projectAssets],
  );

  const footprintCounts = useMemo(() => {
    const counts = new Map<AssetType, number>();
    for (const asset of inFootprintAssets) {
      counts.set(asset.type, (counts.get(asset.type) ?? 0) + 1);
    }
    return counts;
  }, [inFootprintAssets]);

  const confirmed = useMemo(
    () => projectObservations.filter((o) => o.status === "verified"),
    [projectObservations],
  );
  const unverified = useMemo(
    () => projectObservations.filter((o) => o.status === "unverified"),
    [projectObservations],
  );
  const otherRecords = useMemo(
    () =>
      projectObservations.filter(
        (o) => o.status === "duplicate" || o.status === "out_of_scope",
      ),
    [projectObservations],
  );

  const projectSources = useMemo(() => {
    const usedIds = new Set(
      projectObservations
        .map((o) => o.sourceId)
        .filter((sourceId): sourceId is string => sourceId !== null),
    );
    return state.sources.filter((s) => usedIds.has(s.id));
  }, [projectObservations, state.sources]);

  if (!id || !project) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">Report</h1>
        <p className="mt-2 text-slate-600">
          Project not found.{" "}
          <Link to="/" className="underline">
            Back to Projects
          </Link>
        </p>
      </section>
    );
  }

  const authorized = scope?.authorizationConfirmed === true;

  function handleSaveReport() {
    const now = new Date().toISOString();
    const summary = `Footprint: ${inFootprintAssets.length} in-scope/undetermined asset(s) across ${footprintCounts.size} categories (${outOfScopeAssets.length} out-of-scope asset(s) excluded). Evidence: ${projectObservations.length} observation(s) — ${confirmed.length} confirmed, ${unverified.length} unverified.`;
    const report: Report = {
      id: existingReport?.id ?? crypto.randomUUID(),
      projectId: id!,
      generatedAt: now,
      summary,
      limitations,
      recommendations,
    };
    dispatch({ type: "SAVE_REPORT", report });
    setSavedMessage(true);
    window.setTimeout(() => setSavedMessage(false), 3000);
  }

  function handleExport() {
    const data = buildProjectExportData(state, id!);
    const filename = `reconscope-${slugify(project!.name)}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    downloadJson(filename, data);
  }

  return (
    <section>
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Report — {project.name}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveReport}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium"
          >
            Save report details
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium"
          >
            Print / Save as PDF
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            Export as JSON
          </button>
        </div>
      </div>
      {savedMessage && (
        <p className="no-print mt-2 text-sm text-green-700" role="status">
          Report details saved.
        </p>
      )}

      <div className="mt-6 space-y-8 rounded border border-slate-200 bg-white p-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Reconnaissance Summary Report
          </p>
          <h2 className="text-xl font-semibold">{project.companyAlias}</h2>
          <p className="text-sm text-slate-600">Project: {project.name}</p>
          {existingReport && (
            <p className="text-sm text-slate-600">
              Last generated {formatDateTime(existingReport.generatedAt)}
            </p>
          )}
        </header>

        <section>
          <h3 className="text-lg font-semibold">Scope</h3>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              authorized
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {authorized ? "Authorized" : "Incomplete"}
          </span>
          {scope ? (
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>
                <strong>Root domains:</strong>{" "}
                {scope.rootDomains.join(", ") || "—"}
              </li>
              <li>
                <strong>Subdomains:</strong>{" "}
                {scope.subdomains.join(", ") || "—"}
              </li>
              <li>
                <strong>IP ranges:</strong> {scope.ipRanges.join(", ") || "—"}
              </li>
              <li>
                <strong>Exclusions:</strong>{" "}
                {scope.exclusions.join(", ") || "—"}
              </li>
              <li>
                <strong>Authorization note:</strong>{" "}
                {scope.authorizationNote || "—"}
              </li>
              <li>
                <strong>Acknowledged:</strong>{" "}
                {scope.acknowledgedAt
                  ? formatDateTime(scope.acknowledgedAt)
                  : "Not yet acknowledged"}
              </li>
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No scope has been recorded for this project.
            </p>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold">Methods</h3>
          <p className="mt-2 text-sm text-slate-700">
            {PASSIVE_METHODOLOGY_SUMMARY}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">Footprint summary</h3>
          {footprintCounts.size === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No assets recorded.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {[...footprintCounts.entries()].map(([type, count]) => (
                <li key={type} className="flex justify-between gap-2">
                  <span>{categoryLabel(type)}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          )}
          {outOfScopeAssets.length > 0 && (
            <p className="mt-2 text-sm text-red-700">
              {outOfScopeAssets.length} out-of-scope asset(s) excluded from
              this footprint:{" "}
              {outOfScopeAssets.map((a) => a.value).join(", ")}.
            </p>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold">Evidence</h3>

          <h4 className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Confirmed observations ({confirmed.length})
          </h4>
          {confirmed.length === 0 ? (
            <p className="mt-1 text-sm text-slate-600">None yet.</p>
          ) : (
            <ul className="mt-1">
              {confirmed.map((o) => (
                <ObservationListItem key={o.id} observation={o} />
              ))}
            </ul>
          )}

          <h4 className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Unverified leads ({unverified.length})
          </h4>
          {unverified.length === 0 ? (
            <p className="mt-1 text-sm text-slate-600">None.</p>
          ) : (
            <ul className="mt-1">
              {unverified.map((o) => (
                <ObservationListItem key={o.id} observation={o} />
              ))}
            </ul>
          )}

          {otherRecords.length > 0 && (
            <>
              <h4 className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Other records ({otherRecords.length})
              </h4>
              <ul className="mt-1">
                {otherRecords.map((o) => (
                  <li
                    key={o.id}
                    className="border-b border-slate-100 py-2 text-sm last:border-0"
                  >
                    <span className="font-medium">{o.value}</span> —{" "}
                    {statusLabel(o.status)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold">Sources</h3>
          {projectSources.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              No sources recorded.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {projectSources.map((source) => (
                <li key={source.id}>
                  {source.name} ({sourceTypeLabel(source.sourceType)})
                  {source.url && ` — ${source.url}`}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold">Limitations</h3>
          <label htmlFor={limitationsId} className="sr-only">
            Limitations
          </label>
          <textarea
            id={limitationsId}
            className="no-print mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            rows={4}
            value={limitations}
            onChange={(e) => setLimitations(e.target.value)}
          />
          <p className="print-only mt-2 text-sm text-slate-700">
            {limitations}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">
            Recommendations for the next phase
          </h3>
          <label htmlFor={recommendationsId} className="sr-only">
            Recommendations
          </label>
          <textarea
            id={recommendationsId}
            className="no-print mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            rows={4}
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
          />
          <p className="print-only mt-2 text-sm text-slate-700">
            {recommendations}
          </p>
        </section>
      </div>
    </section>
  );
}
