import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../state/AppContext";
import AssetTree from "../components/AssetTree";
import { categoryLabel, statusLabel } from "../constants";
import { formatDateTime } from "../utils/dateInput";
import type { AssetType } from "../types";

export default function AssetsScreen() {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const project = state.projects.find((p) => p.id === id);

  const projectAssets = useMemo(
    () => state.assets.filter((a) => a.projectId === id),
    [state.assets, id],
  );

  const countsByType = useMemo(() => {
    const counts = new Map<AssetType, number>();
    for (const asset of projectAssets) {
      counts.set(asset.type, (counts.get(asset.type) ?? 0) + 1);
    }
    return counts;
  }, [projectAssets]);

  const selectedAsset =
    projectAssets.find((a) => a.id === selectedId) ?? null;

  const selectedObservations = useMemo(
    () =>
      selectedAsset
        ? state.observations
            .filter((o) => o.assetId === selectedAsset.id)
            .sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))
        : [],
    [state.observations, selectedAsset],
  );

  if (!id || !project) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">Assets</h1>
        <p className="mt-2 text-slate-600">
          Project not found.{" "}
          <Link to="/" className="underline">
            Back to Projects
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">Assets — {project.name}</h1>
      <p className="mt-2 text-slate-600">
        Assets are created automatically from the Evidence Log and organized
        here into a relationship tree. Select a node to see its evidence.
      </p>

      {projectAssets.length === 0 ? (
        <div className="mt-6 rounded border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-600">
            No assets yet. Assets appear automatically when you add
            observations in the Evidence Log.
          </p>
          <Link
            to={`/projects/${id}/evidence`}
            className="mt-4 inline-block rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            Add observation
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex flex-wrap gap-2 text-sm text-slate-600">
              {[...countsByType.entries()].map(([type, count]) => (
                <span
                  key={type}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5"
                >
                  {categoryLabel(type)}: {count}
                </span>
              ))}
            </div>
            <div className="rounded border border-slate-200 bg-white p-4">
              <AssetTree
                assets={projectAssets}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          </div>

          <div className="rounded border border-slate-200 bg-white p-4">
            {selectedAsset ? (
              <>
                <h2 className="text-lg font-semibold">
                  {categoryLabel(selectedAsset.type)}: {selectedAsset.value}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  First seen {formatDateTime(selectedAsset.firstSeen)} · Last
                  seen {formatDateTime(selectedAsset.lastSeen)}
                </p>

                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Evidence ({selectedObservations.length})
                </h3>
                {selectedObservations.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-600">
                    No observations reference this asset.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {selectedObservations.map((observation) => (
                      <li
                        key={observation.id}
                        className="rounded border border-slate-200 p-2 text-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {observation.confidence} confidence
                          </span>
                          <span className="text-slate-500">
                            {statusLabel(observation.status)}
                          </span>
                          <span className="text-slate-500">
                            {formatDateTime(observation.collectedAt)}
                          </span>
                        </div>
                        {observation.notes && (
                          <p className="mt-1 text-slate-700">
                            {observation.notes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  to={`/projects/${id}/evidence`}
                  className="mt-4 inline-block text-sm font-medium underline"
                >
                  Open Evidence Log
                </Link>
              </>
            ) : (
              <p className="text-slate-600">
                Select an asset from the tree to see its evidence records.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
