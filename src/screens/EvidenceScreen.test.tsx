import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProvider } from "../state/AppContext";
import { createEmptyData, saveData } from "../storage";
import EvidenceScreen from "./EvidenceScreen";
import type { Observation, Project, Scope } from "../types";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";

function seed(observations: Observation[] = []) {
  const project: Project = {
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
  const scope: Scope = {
    projectId: PROJECT_ID,
    rootDomains: ["northstar-bicycle.example"],
    subdomains: [],
    ipRanges: ["192.0.2.0/24"],
    exclusions: [],
    authorizationConfirmed: true,
    authorizationNote: "",
    acknowledgedAt: "2026-01-01T00:00:00.000Z",
  };

  saveData({
    ...createEmptyData(),
    projects: [project],
    scopes: [scope],
    observations,
  });
}

function makeObservation(overrides: Partial<Observation> = {}): Observation {
  return {
    id: crypto.randomUUID(),
    projectId: PROJECT_ID,
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

function renderEvidenceScreen() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[`/projects/${PROJECT_ID}/evidence`]}>
        <Routes>
          <Route
            path="/projects/:id/evidence"
            element={<EvidenceScreen />}
          />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("EvidenceScreen — FR-05/FR-06 create", () => {
  it("adds an observation with category, value, confidence, and notes", () => {
    seed();
    renderEvidenceScreen();

    fireEvent.click(screen.getByRole("button", { name: /add observation/i }));

    fireEvent.change(screen.getByLabelText(/^category$/i), {
      target: { value: "ip" },
    });
    fireEvent.change(screen.getByLabelText(/^value$/i), {
      target: { value: "192.0.2.10" },
    });
    fireEvent.change(screen.getByLabelText(/^confidence$/i), {
      target: { value: "high" },
    });
    fireEvent.change(screen.getByLabelText(/analyst notes/i), {
      target: { value: "Found via passive DNS lookup." },
    });

    fireEvent.click(screen.getByRole("button", { name: /add observation/i }));

    expect(screen.getByText("192.0.2.10")).toBeInTheDocument();
    expect(screen.getByText(/found via passive dns lookup/i)).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem("reconscope.v1")!);
    expect(stored.observations).toHaveLength(1);
    expect(stored.observations[0]).toMatchObject({
      category: "ip",
      value: "192.0.2.10",
      confidence: "high",
      method: "manual",
      status: "unverified",
    });
  });
});

describe("EvidenceScreen — FR-13 scope warnings", () => {
  it("flags an out-of-scope value and does not flag an undetermined one", () => {
    seed([
      makeObservation({ id: "in-range", value: "198.51.100.14", category: "ip" }),
      makeObservation({ id: "tech", value: "nginx", category: "technology" }),
    ]);
    renderEvidenceScreen();

    // "Out of scope" is also a valid status option in every row's quick-
    // status <select>, so match on the warning badge's distinguishing icon
    // text instead of the bare phrase.
    expect(screen.getByText(/⚠\s*out of scope/i)).toBeInTheDocument();
    expect(screen.queryByText("nginx")).toBeInTheDocument();
    // The technology observation must never get a red/out-of-scope badge.
    const techCard = screen.getByText("nginx").closest("li")!;
    expect(
      within(techCard).queryByText(/⚠\s*out of scope/i),
    ).not.toBeInTheDocument();
  });
});

describe("EvidenceScreen — FR-09 status", () => {
  it("changes an observation's status from the row control", () => {
    seed([makeObservation({ id: "obs-1" })]);
    renderEvidenceScreen();

    const card = screen
      .getByText("shop.northstar-bicycle.example")
      .closest("li")!;
    const statusSelect = within(card).getByLabelText(/^status$/i);
    fireEvent.change(statusSelect, { target: { value: "verified" } });

    const stored = JSON.parse(localStorage.getItem("reconscope.v1")!);
    expect(stored.observations[0].status).toBe("verified");
  });
});

describe("EvidenceScreen — FR-12 edit and delete", () => {
  it("edits an observation's value", () => {
    seed([makeObservation({ id: "obs-1", value: "old-value.example" })]);
    renderEvidenceScreen();

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    const valueField = screen.getByLabelText(/^value$/i);
    fireEvent.change(valueField, { target: { value: "new-value.example" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(screen.getByText("new-value.example")).toBeInTheDocument();
    expect(screen.queryByText("old-value.example")).not.toBeInTheDocument();
  });

  it("requires confirmation before deleting an observation", () => {
    seed([makeObservation({ id: "obs-1", value: "delete-me.example" })]);
    renderEvidenceScreen();

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(screen.getByText(/delete this observation/i)).toBeInTheDocument();
    expect(screen.getByText("delete-me.example")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /confirm delete/i }));

    expect(
      screen.getByText(/no observations yet/i),
    ).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem("reconscope.v1")!);
    expect(stored.observations).toHaveLength(0);
  });
});

describe("EvidenceScreen — FR-08 filter and search", () => {
  it("filters by category and shows only matching records with active filters visible", () => {
    seed([
      makeObservation({ id: "obs-domain", value: "shop.northstar-bicycle.example", category: "domain" }),
      makeObservation({ id: "obs-tech", value: "nginx", category: "technology" }),
    ]);
    renderEvidenceScreen();

    expect(screen.getByText("shop.northstar-bicycle.example")).toBeInTheDocument();
    expect(screen.getByText("nginx")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/filter by category/i), {
      target: { value: "technology" },
    });

    expect(screen.queryByText("shop.northstar-bicycle.example")).not.toBeInTheDocument();
    expect(screen.getByText("nginx")).toBeInTheDocument();
    expect(screen.getByText(/active filters/i)).toBeInTheDocument();
  });

  it("filters by confidence", () => {
    seed([
      makeObservation({ id: "obs-low", value: "low-conf.example", confidence: "low" }),
      makeObservation({ id: "obs-high", value: "high-conf.example", confidence: "high" }),
    ]);
    renderEvidenceScreen();

    fireEvent.change(screen.getByLabelText(/filter by confidence/i), {
      target: { value: "high" },
    });

    expect(screen.queryByText("low-conf.example")).not.toBeInTheDocument();
    expect(screen.getByText("high-conf.example")).toBeInTheDocument();
  });

  it("filters by status", () => {
    seed([
      makeObservation({ id: "obs-unverified", value: "unverified.example", status: "unverified" }),
      makeObservation({ id: "obs-verified", value: "verified.example", status: "verified" }),
    ]);
    renderEvidenceScreen();

    fireEvent.change(screen.getByLabelText(/filter by status/i), {
      target: { value: "verified" },
    });

    expect(screen.queryByText("unverified.example")).not.toBeInTheDocument();
    expect(screen.getByText("verified.example")).toBeInTheDocument();
  });

  it("searches by value text", () => {
    seed([
      makeObservation({ id: "obs-a", value: "alpha.northstar-bicycle.example" }),
      makeObservation({ id: "obs-b", value: "beta.northstar-bicycle.example" }),
    ]);
    renderEvidenceScreen();

    fireEvent.change(screen.getByLabelText(/^search$/i), {
      target: { value: "alpha" },
    });

    expect(screen.getByText("alpha.northstar-bicycle.example")).toBeInTheDocument();
    expect(screen.queryByText("beta.northstar-bicycle.example")).not.toBeInTheDocument();
  });
});
