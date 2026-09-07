import { fireEvent, render, screen } from "@testing-library/react";
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
