import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProvider } from "../state/AppContext";
import { createEmptyData, saveData } from "../storage";
import AssetsScreen from "./AssetsScreen";
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

function renderAssetsScreen() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[`/projects/${PROJECT_ID}/assets`]}>
        <Routes>
          <Route path="/projects/:id/assets" element={<AssetsScreen />} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("AssetsScreen", () => {
  it("shows an empty state with a link to add an observation", () => {
    saveData({
      ...createEmptyData(),
      projects: [makeProject()],
      scopes: [makeScope()],
    });
    renderAssetsScreen();

    expect(screen.getByText(/no assets yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /add observation/i }),
    ).toHaveAttribute("href", `/projects/${PROJECT_ID}/evidence`);
  });

  it("nests a subdomain under its parent domain in the tree", () => {
    const domain = makeAsset({ id: "domain-1", type: "domain" });
    const subdomain = makeAsset({
      id: "sub-1",
      type: "subdomain",
      value: "shop.northstar-bicycle.example",
      parentAssetId: "domain-1",
    });
    saveData({
      ...createEmptyData(),
      projects: [makeProject()],
      scopes: [makeScope()],
      assets: [domain, subdomain],
    });
    renderAssetsScreen();

    const domainRow = screen
      .getByText("northstar-bicycle.example")
      .closest("li")!;
    expect(
      within(domainRow).getByText("shop.northstar-bicycle.example"),
    ).toBeInTheDocument();
  });

  it("flags an out-of-scope asset and shows its linked evidence on selection", () => {
    const asset = makeAsset({
      id: "ip-1",
      type: "ip",
      value: "198.51.100.14",
      scopeStatus: "out_of_scope",
    });
    const observation = makeObservation({
      id: "obs-1",
      assetId: "ip-1",
      category: "ip",
      value: "198.51.100.14",
      notes: "Found on an external scan report.",
    });
    saveData({
      ...createEmptyData(),
      projects: [makeProject()],
      scopes: [makeScope()],
      assets: [asset],
      observations: [observation],
    });
    renderAssetsScreen();

    expect(screen.getByText(/⚠\s*out of scope/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("198.51.100.14"));

    expect(
      screen.getByText(/found on an external scan report/i),
    ).toBeInTheDocument();
  });
});
