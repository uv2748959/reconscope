import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY, loadData, resetData, saveData } from "./storage";
import type { StorageData } from "./storage";
import type { Project } from "./types";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Test Project",
    companyAlias: "Northstar Bicycle Repair",
    description: "",
    startDate: null,
    endDate: null,
    isActive: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("loadData", () => {
  it("returns an empty store when nothing has been saved", () => {
    const data = loadData();
    expect(data).toEqual({
      schemaVersion: 1,
      projects: [],
      scopes: [],
      assets: [],
      observations: [],
      sources: [],
      tags: [],
      reports: [],
    });
  });

  it("throws a StorageError when the stored JSON is corrupted", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(() => loadData()).toThrow("corrupted");
  });

  it("throws a StorageError when the schema version is missing", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects: [] }));
    expect(() => loadData()).toThrow("schema version");
  });

  it("refuses to parse a schema version newer than supported", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 2, projects: [] }),
    );
    expect(() => loadData()).toThrow(/newer/);
  });
});

describe("saveData", () => {
  it("round-trips data written through saveData", () => {
    const project = makeProject();
    const data: StorageData = {
      schemaVersion: 1,
      projects: [project],
      scopes: [],
      assets: [],
      observations: [],
      sources: [],
      tags: [],
      reports: [],
    };

    saveData(data);
    expect(loadData()).toEqual(data);
  });

  it("surfaces a QuotaExceededError as a StorageError instead of failing silently", () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("quota exceeded", "QuotaExceededError");
      });

    const data: StorageData = {
      schemaVersion: 1,
      projects: [],
      scopes: [],
      assets: [],
      observations: [],
      sources: [],
      tags: [],
      reports: [],
    };

    expect(() => saveData(data)).toThrow(/storage is full/i);

    setItemSpy.mockRestore();
  });
});

describe("resetData", () => {
  it("clears stored data and returns a fresh empty store", () => {
    saveData({
      schemaVersion: 1,
      projects: [makeProject()],
      scopes: [],
      assets: [],
      observations: [],
      sources: [],
      tags: [],
      reports: [],
    });

    const result = resetData();

    expect(result.projects).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadData().projects).toEqual([]);
  });
});
