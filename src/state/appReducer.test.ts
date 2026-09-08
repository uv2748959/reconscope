import { describe, expect, it } from "vitest";
import { appReducer } from "./appReducer";
import { createEmptyData } from "../storage";
import { buildDemoBundle } from "../seedData";
import type {
  Asset,
  Observation,
  Project,
  Report,
  Scope,
  Source,
  Tag,
} from "../types";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Northstar Recon",
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
    projectId: "11111111-1111-4111-8111-111111111111",
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

describe("appReducer — CREATE_PROJECT", () => {
  it("adds the project and its scope", () => {
    const project = makeProject();
    const scope = makeScope();
    const result = appReducer(createEmptyData(), {
      type: "CREATE_PROJECT",
      project,
      scope,
    });

    expect(result.projects).toEqual([project]);
    expect(result.scopes).toEqual([scope]);
  });
});

describe("appReducer — RENAME_PROJECT", () => {
  it("renames only the matching project and bumps updatedAt", () => {
    const project = makeProject();
    const other = makeProject({ id: "other-id", name: "Other Project" });
    const state = {
      ...createEmptyData(),
      projects: [project, other],
    };

    const result = appReducer(state, {
      type: "RENAME_PROJECT",
      id: project.id,
      name: "Renamed Project",
      updatedAt: "2026-02-01T00:00:00.000Z",
    });

    expect(result.projects).toEqual([
      { ...project, name: "Renamed Project", updatedAt: "2026-02-01T00:00:00.000Z" },
      other,
    ]);
  });
});

describe("appReducer — DELETE_PROJECT", () => {
  it("removes the project, its scope, its observations, its assets, and its reports, leaving other projects intact", () => {
    const project = makeProject();
    const scope = makeScope();
    const observation = makeObservation({ projectId: project.id });
    const asset = makeAsset({ projectId: project.id });
    const report = makeReport({ projectId: project.id });
    const other = makeProject({ id: "other-id" });
    const otherScope = makeScope({ projectId: "other-id" });
    const otherObservation = makeObservation({
      id: "other-observation",
      projectId: "other-id",
    });
    const otherAsset = makeAsset({ id: "other-asset", projectId: "other-id" });
    const otherReport = makeReport({
      id: "other-report",
      projectId: "other-id",
    });

    const state = {
      ...createEmptyData(),
      projects: [project, other],
      scopes: [scope, otherScope],
      observations: [observation, otherObservation],
      assets: [asset, otherAsset],
      reports: [report, otherReport],
    };

    const result = appReducer(state, {
      type: "DELETE_PROJECT",
      id: project.id,
    });

    expect(result.projects).toEqual([other]);
    expect(result.scopes).toEqual([otherScope]);
    expect(result.observations).toEqual([otherObservation]);
    expect(result.assets).toEqual([otherAsset]);
    expect(result.reports).toEqual([otherReport]);
  });
});

function makeObservation(overrides: Partial<Observation> = {}): Observation {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    projectId: "11111111-1111-4111-8111-111111111111",
    assetId: null,
    category: "domain",
    value: "shop.northstar-bicycle.example",
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

function makeSource(overrides: Partial<Source> = {}): Source {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Company website",
    url: "https://northstar-bicycle.example",
    sourceType: "website",
    accessedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    label: "verified-lead",
    color: "#3b82f6",
    ...overrides,
  };
}

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "55555555-5555-4555-8555-555555555555",
    projectId: "11111111-1111-4111-8111-111111111111",
    type: "domain",
    value: "northstar-bicycle.example",
    parentAssetId: null,
    firstSeen: "2026-01-01T00:00:00.000Z",
    lastSeen: "2026-01-01T00:00:00.000Z",
    scopeStatus: "in_scope",
    ...overrides,
  };
}

function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    id: "66666666-6666-4666-8666-666666666666",
    projectId: "11111111-1111-4111-8111-111111111111",
    generatedAt: "2026-01-01T00:00:00.000Z",
    summary: "Summary text.",
    limitations: "Limitations text.",
    recommendations: "Recommendations text.",
    ...overrides,
  };
}

describe("appReducer — CREATE_OBSERVATION", () => {
  it("adds the observation", () => {
    const observation = makeObservation();
    const result = appReducer(createEmptyData(), {
      type: "CREATE_OBSERVATION",
      observation,
    });
    expect(result.observations).toEqual([observation]);
  });
});

describe("appReducer — UPDATE_OBSERVATION", () => {
  it("replaces only the matching observation", () => {
    const observation = makeObservation();
    const other = makeObservation({ id: "other-observation" });
    const state = {
      ...createEmptyData(),
      observations: [observation, other],
    };

    const updated = { ...observation, status: "verified" as const };
    const result = appReducer(state, {
      type: "UPDATE_OBSERVATION",
      observation: updated,
    });

    expect(result.observations).toEqual([updated, other]);
  });
});

describe("appReducer — DELETE_OBSERVATION", () => {
  it("removes only the matching observation", () => {
    const observation = makeObservation();
    const other = makeObservation({ id: "other-observation" });
    const state = {
      ...createEmptyData(),
      observations: [observation, other],
    };

    const result = appReducer(state, {
      type: "DELETE_OBSERVATION",
      id: observation.id,
    });

    expect(result.observations).toEqual([other]);
  });
});

describe("appReducer — CREATE_SOURCE", () => {
  it("adds the source", () => {
    const source = makeSource();
    const result = appReducer(createEmptyData(), {
      type: "CREATE_SOURCE",
      source,
    });
    expect(result.sources).toEqual([source]);
  });
});

describe("appReducer — CREATE_TAG", () => {
  it("adds the tag", () => {
    const tag = makeTag();
    const result = appReducer(createEmptyData(), {
      type: "CREATE_TAG",
      tag,
    });
    expect(result.tags).toEqual([tag]);
  });
});

describe("appReducer — CREATE_ASSET", () => {
  it("adds the asset", () => {
    const asset = makeAsset();
    const result = appReducer(createEmptyData(), {
      type: "CREATE_ASSET",
      asset,
    });
    expect(result.assets).toEqual([asset]);
  });
});

describe("appReducer — UPDATE_ASSET", () => {
  it("replaces only the matching asset", () => {
    const asset = makeAsset();
    const other = makeAsset({ id: "other-asset" });
    const state = {
      ...createEmptyData(),
      assets: [asset, other],
    };

    const updated = { ...asset, scopeStatus: "out_of_scope" as const };
    const result = appReducer(state, {
      type: "UPDATE_ASSET",
      asset: updated,
    });

    expect(result.assets).toEqual([updated, other]);
  });
});

describe("appReducer — LOAD_DEMO_DATA", () => {
  it("appends the whole demo bundle in one shot, alongside any existing data", () => {
    const existingProject = makeProject({ id: "existing-project" });
    const state = {
      ...createEmptyData(),
      projects: [existingProject],
    };

    const bundle = buildDemoBundle();
    const result = appReducer(state, { type: "LOAD_DEMO_DATA", bundle });

    expect(result.projects).toEqual([existingProject, bundle.project]);
    expect(result.scopes).toEqual([bundle.scope]);
    expect(result.assets).toEqual(bundle.assets);
    expect(result.observations).toEqual(bundle.observations);
    expect(result.sources).toEqual(bundle.sources);
    expect(result.tags).toEqual(bundle.tags);
  });
});

describe("appReducer — IMPORT_DATA", () => {
  it("appends an imported store's records to the current state", () => {
    const existingProject = makeProject({ id: "existing-project" });
    const state = {
      ...createEmptyData(),
      projects: [existingProject],
    };

    const imported = {
      ...createEmptyData(),
      projects: [makeProject({ id: "imported-project" })],
      scopes: [makeScope({ projectId: "imported-project" })],
    };

    const result = appReducer(state, { type: "IMPORT_DATA", data: imported });

    expect(result.projects).toEqual([existingProject, ...imported.projects]);
    expect(result.scopes).toEqual(imported.scopes);
  });
});

describe("appReducer — SAVE_REPORT", () => {
  it("adds a report when the project has none yet", () => {
    const report = makeReport();
    const result = appReducer(createEmptyData(), {
      type: "SAVE_REPORT",
      report,
    });
    expect(result.reports).toEqual([report]);
  });

  it("replaces the existing report for the same project instead of duplicating it", () => {
    const original = makeReport({ summary: "First draft." });
    const otherProjectReport = makeReport({
      id: "other-report",
      projectId: "other-project",
    });
    const state = {
      ...createEmptyData(),
      reports: [original, otherProjectReport],
    };

    const updated: Report = {
      ...original,
      summary: "Revised draft.",
      generatedAt: "2026-02-01T00:00:00.000Z",
    };
    const result = appReducer(state, { type: "SAVE_REPORT", report: updated });

    expect(result.reports).toEqual([updated, otherProjectReport]);
  });
});
