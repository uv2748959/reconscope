import { describe, expect, it } from "vitest";
import { buildProjectExportData } from "./projectExport";
import { createEmptyData } from "../storage";
import type {
  Asset,
  Observation,
  Project,
  Scope,
  Source,
  Tag,
} from "../types";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "project-1",
    name: "Recon Exercise",
    companyAlias: "Northstar Bicycle Repair",
    description: "",
    startDate: null,
    endDate: null,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeScope(overrides: Partial<Scope> = {}): Scope {
  return {
    projectId: "project-1",
    rootDomains: ["northstar-bicycle.example"],
    subdomains: [],
    ipRanges: [],
    exclusions: [],
    authorizationConfirmed: true,
    authorizationNote: "",
    acknowledgedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeObservation(overrides: Partial<Observation> = {}): Observation {
  return {
    id: "obs-1",
    projectId: "project-1",
    assetId: null,
    category: "domain",
    value: "northstar-bicycle.example",
    method: "manual",
    confidence: "medium",
    status: "unverified",
    sourceId: null,
    tagIds: [],
    notes: "",
    collectedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildProjectExportData", () => {
  it("includes only the target project's own records", () => {
    const project = makeProject();
    const otherProject = makeProject({ id: "project-2" });
    const scope = makeScope();
    const otherScope = makeScope({ projectId: "project-2" });
    const observation = makeObservation();
    const otherObservation = makeObservation({
      id: "obs-2",
      projectId: "project-2",
    });
    const asset: Asset = {
      id: "asset-1",
      projectId: "project-1",
      type: "domain",
      value: "northstar-bicycle.example",
      parentAssetId: null,
      firstSeen: "2026-01-01T00:00:00.000Z",
      lastSeen: "2026-01-01T00:00:00.000Z",
      scopeStatus: "in_scope",
    };

    const state = {
      ...createEmptyData(),
      projects: [project, otherProject],
      scopes: [scope, otherScope],
      observations: [observation, otherObservation],
      assets: [asset],
    };

    const result = buildProjectExportData(state, "project-1");

    expect(result.projects).toEqual([project]);
    expect(result.scopes).toEqual([scope]);
    expect(result.observations).toEqual([observation]);
    expect(result.assets).toEqual([asset]);
  });

  it("includes only sources and tags actually referenced by the project's observations", () => {
    const usedSource: Source = {
      id: "source-1",
      name: "Used source",
      url: null,
      sourceType: "website",
      accessedAt: "2026-01-01T00:00:00.000Z",
    };
    const unusedSource: Source = {
      id: "source-2",
      name: "Unused source",
      url: null,
      sourceType: "whois",
      accessedAt: "2026-01-01T00:00:00.000Z",
    };
    const usedTag: Tag = { id: "tag-1", label: "used", color: "#3b82f6" };
    const unusedTag: Tag = { id: "tag-2", label: "unused", color: "#ef4444" };

    const observation = makeObservation({
      sourceId: "source-1",
      tagIds: ["tag-1"],
    });

    const state = {
      ...createEmptyData(),
      projects: [makeProject()],
      scopes: [makeScope()],
      observations: [observation],
      sources: [usedSource, unusedSource],
      tags: [usedTag, unusedTag],
    };

    const result = buildProjectExportData(state, "project-1");

    expect(result.sources).toEqual([usedSource]);
    expect(result.tags).toEqual([usedTag]);
  });

  it("throws when the project does not exist", () => {
    expect(() =>
      buildProjectExportData(createEmptyData(), "missing-project"),
    ).toThrow();
  });
});
