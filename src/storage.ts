// Single storage module for ReconScope. All reads and writes to
// localStorage go through this file — no component touches localStorage
// directly. Data lives under one key, "reconscope.v1", per PRD Section 15.

import type {
  Project,
  Scope,
  Asset,
  Observation,
  Source,
  Tag,
  Report,
} from "./types";

export const STORAGE_KEY = "reconscope.v1";
const CURRENT_SCHEMA_VERSION = 1;

export interface StorageData {
  schemaVersion: number;
  projects: Project[];
  scopes: Scope[];
  assets: Asset[];
  observations: Observation[];
  sources: Source[];
  tags: Tag[];
  reports: Report[];
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

export function createEmptyData(): StorageData {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    projects: [],
    scopes: [],
    assets: [],
    observations: [],
    sources: [],
    tags: [],
    reports: [],
  };
}

function isQuotaExceeded(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" ||
      err.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

/** Parses and validates a JSON string as a StorageData document — shared by
 * loadData() (reading localStorage) and the JSON import feature (reading a
 * user-selected file), so both go through the same validation. Throws
 * StorageError if the JSON is corrupted or was written by a newer,
 * incompatible schema version. */
export function parseStorageData(raw: string): StorageData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new StorageError(
      "This file is corrupted and could not be parsed as JSON.",
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { schemaVersion?: unknown }).schemaVersion !== "number"
  ) {
    throw new StorageError(
      "This file is missing a valid ReconScope schema version.",
    );
  }

  const data = parsed as StorageData;
  if (data.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new StorageError(
      `This file uses schema version ${data.schemaVersion}, which is newer than the version this app supports (${CURRENT_SCHEMA_VERSION}).`,
    );
  }

  return {
    schemaVersion: data.schemaVersion,
    projects: data.projects ?? [],
    scopes: data.scopes ?? [],
    assets: data.assets ?? [],
    observations: data.observations ?? [],
    sources: data.sources ?? [],
    tags: data.tags ?? [],
    reports: data.reports ?? [],
  };
}

/** Reads and validates stored data. Returns an empty store if nothing has
 * been saved yet. Throws StorageError if the stored data is corrupted or
 * was written by a newer, incompatible schema version. */
export function loadData(): StorageData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    return createEmptyData();
  }
  return parseStorageData(raw);
}

/** Persists the full store. Throws StorageError (instead of failing
 * silently) if the browser storage quota is exceeded or the write
 * otherwise fails, so callers can surface a visible error state. */
export function saveData(data: StorageData): void {
  let serialized: string;
  try {
    serialized = JSON.stringify(data);
  } catch {
    throw new StorageError(
      "ReconScope data could not be serialized for storage.",
    );
  }

  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    if (isQuotaExceeded(err)) {
      throw new StorageError(
        "Browser storage is full. Free up space or export your project before continuing.",
      );
    }
    throw new StorageError(
      "ReconScope data could not be saved to browser storage.",
    );
  }
}

/** Clears all stored data and returns a fresh empty store. */
export function resetData(): StorageData {
  localStorage.removeItem(STORAGE_KEY);
  return createEmptyData();
}
