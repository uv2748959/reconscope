import { createEmptyData, type StorageData } from "../storage";

/**
 * Builds a self-contained StorageData bundle for one project — the project
 * itself, its scope/assets/observations/reports, plus only the Source and
 * Tag records its observations actually reference (Source and Tag have no
 * projectId of their own per Section 9, since they can be shared).
 */
export function buildProjectExportData(
  state: StorageData,
  projectId: string,
): StorageData {
  const project = state.projects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error(`No project found with id "${projectId}".`);
  }

  const scopes = state.scopes.filter((s) => s.projectId === projectId);
  const assets = state.assets.filter((a) => a.projectId === projectId);
  const observations = state.observations.filter(
    (o) => o.projectId === projectId,
  );
  const reports = state.reports.filter((r) => r.projectId === projectId);

  const usedSourceIds = new Set(
    observations
      .map((o) => o.sourceId)
      .filter((sourceId): sourceId is string => sourceId !== null),
  );
  const usedTagIds = new Set(observations.flatMap((o) => o.tagIds));

  const sources = state.sources.filter((s) => usedSourceIds.has(s.id));
  const tags = state.tags.filter((t) => usedTagIds.has(t.id));

  return {
    ...createEmptyData(),
    projects: [project],
    scopes,
    assets,
    observations,
    sources,
    tags,
    reports,
  };
}
