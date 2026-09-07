import { describe, expect, it } from "vitest";
import { appReducer } from "./appReducer";
import { createEmptyData } from "../storage";
import type { Project, Scope } from "../types";

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
  it("removes the project and its scope, leaving other projects intact", () => {
    const project = makeProject();
    const scope = makeScope();
    const other = makeProject({ id: "other-id" });
    const otherScope = makeScope({ projectId: "other-id" });

    const state = {
      ...createEmptyData(),
      projects: [project, other],
      scopes: [scope, otherScope],
    };

    const result = appReducer(state, {
      type: "DELETE_PROJECT",
      id: project.id,
    });

    expect(result.projects).toEqual([other]);
    expect(result.scopes).toEqual([otherScope]);
  });
});
