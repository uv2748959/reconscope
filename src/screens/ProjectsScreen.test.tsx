import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProvider } from "../state/AppContext";
import { saveData, STORAGE_KEY, createEmptyData } from "../storage";
import ProjectsScreen from "./ProjectsScreen";
import type { Project, Scope } from "../types";

function seedProject(overrides: Partial<Project> = {}): {
  project: Project;
  scope: Scope;
} {
  const project: Project = {
    id: "11111111-1111-4111-8111-111111111111",
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
  const scope: Scope = {
    projectId: project.id,
    rootDomains: ["northstar-bicycle.example"],
    subdomains: [],
    ipRanges: [],
    exclusions: [],
    authorizationConfirmed: true,
    authorizationNote: "",
    acknowledgedAt: "2026-01-01T00:00:00.000Z",
  };

  saveData({ ...createEmptyData(), projects: [project], scopes: [scope] });
  return { project, scope };
}

function renderProjectsScreen() {
  return render(
    <AppProvider>
      <MemoryRouter>
        <ProjectsScreen />
      </MemoryRouter>
    </AppProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("ProjectsScreen", () => {
  it("shows an empty state when there are no projects", () => {
    renderProjectsScreen();
    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
  });

  it("lists a seeded project with an Authorized badge and an Open link", () => {
    seedProject();
    renderProjectsScreen();

    expect(screen.getByText("Recon Exercise")).toBeInTheDocument();
    expect(screen.getByText("Northstar Bicycle Repair")).toBeInTheDocument();
    expect(screen.getByText("Authorized")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open/i })).toHaveAttribute(
      "href",
      "/projects/11111111-1111-4111-8111-111111111111",
    );
  });

  it("shows Incomplete for a project without a confirmed scope", () => {
    saveData({
      ...createEmptyData(),
      projects: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          name: "Draft Project",
          companyAlias: "Northstar Bicycle Repair",
          description: "",
          startDate: null,
          endDate: null,
          isActive: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      scopes: [],
    });
    renderProjectsScreen();

    expect(screen.getByText("Incomplete")).toBeInTheDocument();
  });

  it("renames a project", () => {
    seedProject();
    renderProjectsScreen();

    fireEvent.click(screen.getByRole("button", { name: /rename/i }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Renamed Recon" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(screen.getByText("Renamed Recon")).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.projects[0].name).toBe("Renamed Recon");
  });

  it("requires confirmation before deleting a project", () => {
    seedProject();
    renderProjectsScreen();

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(screen.getByText(/delete this project/i)).toBeInTheDocument();
    expect(screen.getByText("Recon Exercise")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /confirm delete/i }));

    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.projects).toHaveLength(0);
    expect(stored.scopes).toHaveLength(0);
  });
});

describe("ProjectsScreen — FR-04 demo data", () => {
  it("loads the fictional demo when none exists yet", () => {
    renderProjectsScreen();

    const [loadButton] = screen.getAllByRole("button", {
      name: /load fictional demo/i,
    });
    fireEvent.click(loadButton);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.projects).toHaveLength(1);
    expect(stored.projects[0].companyAlias).toBe("Northstar Bicycle Repair");
    expect(stored.observations.length).toBeGreaterThan(0);
  });

  it("offers Reset demo data once a demo project exists, and requires confirmation", () => {
    seedProject();
    renderProjectsScreen();

    expect(
      screen.getByRole("button", { name: /reset demo data/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /load fictional demo/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset demo data/i }));
    expect(
      screen.getByText(/discard demo changes and reload/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /confirm reset/i }));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.projects).toHaveLength(1);
    expect(stored.projects[0].id).not.toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(stored.projects[0].companyAlias).toBe("Northstar Bicycle Repair");
  });
});

describe("ProjectsScreen — FR-11 import", () => {
  it("reconstructs a project with identical counts from an exported JSON file", async () => {
    renderProjectsScreen();

    const exported = {
      schemaVersion: 1,
      projects: [
        {
          id: "imported-project",
          name: "Imported Recon",
          companyAlias: "Northstar Bicycle Repair",
          description: "",
          startDate: null,
          endDate: null,
          isActive: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      scopes: [
        {
          projectId: "imported-project",
          rootDomains: ["northstar-bicycle.example"],
          subdomains: [],
          ipRanges: [],
          exclusions: [],
          authorizationConfirmed: true,
          authorizationNote: "",
          acknowledgedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      assets: [],
      observations: [
        {
          id: "obs-1",
          projectId: "imported-project",
          assetId: null,
          category: "domain",
          value: "northstar-bicycle.example",
          method: "manual",
          confidence: "high",
          status: "verified",
          sourceId: null,
          tagIds: [],
          notes: "",
          collectedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      sources: [],
      tags: [],
      reports: [],
    };
    const file = new File([JSON.stringify(exported)], "export.json", {
      type: "application/json",
    });

    const input = screen.getByLabelText(/import project json file/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.projects).toHaveLength(1);
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.projects[0].name).toBe("Imported Recon");
    expect(stored.observations).toHaveLength(1);
    expect(screen.getByText("Imported Recon")).toBeInTheDocument();
  });

  it("shows an error for a file that isn't valid ReconScope data", async () => {
    renderProjectsScreen();

    const file = new File(["not valid json"], "export.json", {
      type: "application/json",
    });
    const input = screen.getByLabelText(/import project json file/i);
    fireEvent.change(input, { target: { files: [file] } });

    expect(
      await screen.findByText(/corrupted|could not be imported/i),
    ).toBeInTheDocument();
  });
});
