import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProvider } from "../state/AppContext";
import { createEmptyData, saveData } from "../storage";
import DashboardScreen from "./DashboardScreen";
import type { Asset, Observation, Project, Scope } from "../types";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";

function makeProject(): Project {
  return {
    id: PROJECT_ID,
    name: "Recon Exercise",
    companyAlias: "Northstar Bicycle Repair",
    description: "",
    startDate: null,
    endDate: null,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function makeScope(): Scope {
  return {
    projectId: PROJECT_ID,
    rootDomains: ["northstar-bicycle.example"],
    subdomains: [],
    ipRanges: ["192.0.2.0/24"],
    exclusions: [],
    authorizationConfirmed: true,
    authorizationNote: "",
    acknowledgedAt: "2026-01-01T00:00:00.000Z",
  };
}

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: crypto.randomUUID(),
    projectId: PROJECT_ID,
    type: "domain",
    value: "northstar-bicycle.example",
    parentAssetId: null,
    firstSeen: "2026-01-01T00:00:00.000Z",
    lastSeen: "2026-01-01T00:00:00.000Z",
    scopeStatus: "in_scope",
    ...overrides,
  };
}

function makeObservation(overrides: Partial<Observation> = {}): Observation {
  return {
    id: crypto.randomUUID(),
    projectId: PROJECT_ID,
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

function renderDashboard() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[`/projects/${PROJECT_ID}`]}>
        <Routes>
          <Route path="/projects/:id" element={<DashboardScreen />} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("DashboardScreen", () => {
  it("shows the Authorized scope badge for a confirmed scope", () => {
    saveData({
      ...createEmptyData(),
      projects: [makeProject()],
      scopes: [makeScope()],
    });
    renderDashboard();

    expect(screen.getByText("Authorized")).toBeInTheDocument();
  });

  it("counts assets by category and excludes out-of-scope assets from the footprint", () => {
    const domain = makeAsset({ type: "domain", scopeStatus: "in_scope" });
    const outOfScopeIp = makeAsset({
      type: "ip",
      value: "198.51.100.14",
      scopeStatus: "out_of_scope",
    });
    saveData({
      ...createEmptyData(),
      projects: [makeProject()],
      scopes: [makeScope()],
      assets: [domain, outOfScopeIp],
    });
    renderDashboard();

    const footprintCard = screen
      .getByText(/footprint by category/i)
      .closest("div")!;
    expect(within(footprintCard).getByText("Domain")).toBeInTheDocument();
    expect(within(footprintCard).queryByText("IP address")).not.toBeInTheDocument();
    expect(
      screen.getByText(/1 out-of-scope asset\(s\) excluded/i),
    ).toBeInTheDocument();
  });

  it("shows evidence status totals and lists unresolved (unverified) items", () => {
    saveData({
      ...createEmptyData(),
      projects: [makeProject()],
      scopes: [makeScope()],
      observations: [
        makeObservation({ status: "unverified", value: "unverified.example" }),
        makeObservation({ status: "verified", value: "verified.example" }),
      ],
    });
    renderDashboard();

    const evidenceCard = screen.getByText(/^evidence$/i).closest("div")!;
    expect(within(evidenceCard).getByText("2")).toBeInTheDocument();

    const unresolvedSection = screen
      .getByText(/unresolved items/i)
      .closest("div")!;
    expect(
      within(unresolvedSection).getByText(/unverified\.example/i),
    ).toBeInTheDocument();
    // Match "verified.example" but not "unverified.example" (a substring
    // of it), since a plain regex would match both.
    expect(
      within(unresolvedSection).queryByText(/(?<!un)verified\.example/i),
    ).not.toBeInTheDocument();
  });
});
