import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../state/AppContext";
import { createEmptyData, saveData } from "../storage";
import ReportScreen from "./ReportScreen";
import type { Asset, Observation, Project, Scope, Source } from "../types";

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
    authorizationNote: "Classroom authorization on file.",
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

function renderReportScreen() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[`/projects/${PROJECT_ID}/report`]}>
        <Routes>
          <Route path="/projects/:id/report" element={<ReportScreen />} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("ReportScreen — FR-10 content", () => {
  it("separates confirmed observations from unverified leads and shows scope/footprint/sources", () => {
    const source: Source = {
      id: "source-1",
      name: "Company website",
      url: "https://northstar-bicycle.example",
      sourceType: "website",
      accessedAt: "2026-01-01T00:00:00.000Z",
    };
    saveData({
      ...createEmptyData(),
      projects: [makeProject()],
      scopes: [makeScope()],
      assets: [makeAsset()],
      sources: [source],
      observations: [
        makeObservation({
          value: "Confirmed finding",
          status: "verified",
          sourceId: "source-1",
        }),
        makeObservation({ value: "Unverified lead", status: "unverified" }),
      ],
    });
    renderReportScreen();

    const confirmedHeading = screen.getByRole("heading", {
      level: 4,
      name: /confirmed observations/i,
    });
    const confirmedList = confirmedHeading.nextElementSibling as HTMLElement;
    expect(within(confirmedList).getByText("Confirmed finding")).toBeInTheDocument();
    expect(
      within(confirmedList).queryByText("Unverified lead"),
    ).not.toBeInTheDocument();

    const unverifiedHeading = screen.getByRole("heading", {
      level: 4,
      name: /unverified leads/i,
    });
    const unverifiedList = unverifiedHeading.nextElementSibling as HTMLElement;
    expect(
      within(unverifiedList).getByText("Unverified lead"),
    ).toBeInTheDocument();
    expect(
      within(unverifiedList).queryByText("Confirmed finding"),
    ).not.toBeInTheDocument();

    expect(screen.getByText("Authorized")).toBeInTheDocument();
    expect(screen.getByText(/company website/i)).toBeInTheDocument();
  });

  it("saves report details including the edited limitations text", () => {
    saveData({
      ...createEmptyData(),
      projects: [makeProject()],
      scopes: [makeScope()],
    });
    renderReportScreen();

    const limitationsField = screen.getByLabelText(/^limitations$/i);
    fireEvent.change(limitationsField, {
      target: { value: "Custom limitations text." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /save report details/i }),
    );

    const stored = JSON.parse(localStorage.getItem("reconscope.v1")!);
    expect(stored.reports).toHaveLength(1);
    expect(stored.reports[0].limitations).toBe("Custom limitations text.");
    expect(stored.reports[0].projectId).toBe(PROJECT_ID);
  });
});

describe("ReportScreen — FR-11 export", () => {
  it("triggers a JSON download containing the project's data", () => {
    saveData({
      ...createEmptyData(),
      projects: [makeProject()],
      scopes: [makeScope()],
      observations: [makeObservation()],
    });

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock");
    const revokeObjectURLSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    renderReportScreen();
    fireEvent.click(screen.getByRole("button", { name: /export as json/i }));

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock");

    clickSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});
