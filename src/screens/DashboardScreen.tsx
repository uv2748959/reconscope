import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../state/AppContext";
import { categoryLabel, statusLabel } from "../constants";
import { formatDateTime } from "../utils/dateInput";
import type { AssetType, ObsStatus } from "../types";

const OBS_STATUS_ORDER: ObsStatus[] = [
  "unverified",
  "verified",
  "duplicate",
  "out_of_scope",
];

export default function DashboardScreen() {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();

  const project = state.projects.find((p) => p.id === id);
  const scope = state.scopes.find((s) => s.projectId === id);

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
  const outOfScopeAssetCount = projectAssets.length - inFootprintAssets.length;

  const assetCountsByType = useMemo(() => {
    const counts = new Map<AssetType, number>();
    for (const asset of inFootprintAssets) {
      counts.set(asset.type, (counts.get(asset.type) ?? 0) + 1);
    }
    return counts;
  }, [inFootprintAssets]);

  const statusCounts = useMemo(() => {
    const counts: Record<ObsStatus, number> = {
      unverified: 0,
      verified: 0,
      duplicate: 0,
      out_of_scope: 0,
    };
    for (const observation of projectObservations) {
      counts[observation.status] += 1;
    }
    return counts;
  }, [projectObservations]);

  const sourceCount = useMemo(() => {
    const ids = new Set(
      projectObservations
        .map((o) => o.sourceId)
        .filter((sourceId): sourceId is string => sourceId !== null),
    );
    return ids.size;
  }, [projectObservations]);

  const recentObservations = useMemo(
    () =>
      [...projectObservations]
        .sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))
        .slice(0, 5),
    [projectObservations],
  );

  const unresolvedObservations = useMemo(
    () =>
      projectObservations
        .filter((o) => o.status === "unverified")
        .sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))
        .slice(0, 5),
    [projectObservations],
  );

  const lastUpdated = useMemo(() => {
    const timestamps = [
      project?.updatedAt,
      ...projectObservations.map((o) => o.collectedAt),
      ...projectAssets.map((a) => a.lastSeen),
    ].filter((t): t is string => Boolean(t));
    if (timestamps.length === 0) return null;
    return timestamps.reduce((latest, t) => (t > latest ? t : latest));
  }, [project, projectObservations, projectAssets]);

  if (!id || !project) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
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

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Dashboard — {project.name}</h1>
        {lastUpdated && (
          <p className="text-sm text-slate-600">
            Last updated {formatDateTime(lastUpdated)}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Scope status
          </h2>
          <span
            className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              authorized
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {authorized ? "Authorized" : "Incomplete"}
          </span>
          {scope && (
            <p className="mt-2 text-sm text-slate-600">
              {scope.rootDomains.length} root domain(s),{" "}
              {scope.subdomains.length} subdomain(s), {scope.ipRanges.length}{" "}
              IP range(s)
            </p>
          )}
        </div>

        <div className="rounded border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Footprint by category
          </h2>
          {assetCountsByType.size === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No assets yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {[...assetCountsByType.entries()].map(([type, count]) => (
                <li key={type} className="flex justify-between gap-2">
                  <span>{categoryLabel(type)}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          )}
          {outOfScopeAssetCount > 0 && (
            <p className="mt-2 text-xs text-red-700">
              {outOfScopeAssetCount} out-of-scope asset(s) excluded from this
              count.
            </p>
          )}
        </div>

        <div className="rounded border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Evidence
          </h2>
          <p className="mt-2 text-2xl font-semibold">
            {projectObservations.length}
          </p>
          <p className="text-sm text-slate-600">total observations</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {OBS_STATUS_ORDER.map((status) => (
              <li key={status} className="flex justify-between gap-2">
                <span>{statusLabel(status)}</span>
                <span className="font-medium">{statusCounts[status]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Sources cited
          </h2>
          <p className="mt-2 text-2xl font-semibold">{sourceCount}</p>
          <p className="text-sm text-slate-600">distinct sources</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Recent evidence</h2>
          {recentObservations.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              No observations recorded yet.
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {recentObservations.map((observation) => (
                <li
                  key={observation.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0"
                >
                  <span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {categoryLabel(observation.category)}
                    </span>{" "}
                    {observation.value}
                  </span>
                  <span className="text-slate-500">
                    {formatDateTime(observation.collectedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to={`/projects/${id}/evidence`}
            className="mt-3 inline-block text-sm font-medium underline"
          >
            Open Evidence Log
          </Link>
        </div>

        <div className="rounded border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Unresolved items</h2>
          {unresolvedObservations.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              Nothing unverified right now.
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {unresolvedObservations.map((observation) => (
                <li
                  key={observation.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0"
                >
                  <span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {categoryLabel(observation.category)}
                    </span>{" "}
                    {observation.value}
                  </span>
                  <span className="text-amber-700">Unverified</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to={`/projects/${id}/evidence`}
            className="mt-3 inline-block text-sm font-medium underline"
          >
            Review in Evidence Log
          </Link>
        </div>
      </div>
    </section>
  );
}
