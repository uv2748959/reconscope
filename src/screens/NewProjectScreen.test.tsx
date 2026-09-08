import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProvider } from "../state/AppContext";
import NewProjectScreen from "./NewProjectScreen";
import DashboardScreen from "./DashboardScreen";

function renderNewProjectScreen() {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={["/projects/new"]}>
        <Routes>
          <Route path="/projects/new" element={<NewProjectScreen />} />
          <Route path="/projects/:id" element={<DashboardScreen />} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("NewProjectScreen — FR-03 authorization gate", () => {
  it("disables Save until required fields and authorization are provided", () => {
    renderNewProjectScreen();

    const saveButton = screen.getByRole("button", {
      name: /save and activate project/i,
    });
    expect(saveButton).toBeDisabled();
    expect(
      screen.getByText(/enter a project name, company alias/i),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/project name/i), {
      target: { value: "Recon Exercise" },
    });
    fireEvent.change(screen.getByLabelText(/company alias/i), {
      target: { value: "Northstar Bicycle Repair" },
    });
    fireEvent.change(screen.getByLabelText(/authorized root domain/i), {
      target: { value: "northstar-bicycle.example" },
    });

    expect(saveButton).toBeDisabled();
    expect(
      screen.getByText(/must confirm authorization/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByLabelText(/i confirm that only the authorized targets/i),
    );

    expect(saveButton).toBeEnabled();
  });

  it("creates an active, authorized project and scope on submit", async () => {
    renderNewProjectScreen();

    fireEvent.change(screen.getByLabelText(/project name/i), {
      target: { value: "Recon Exercise" },
    });
    fireEvent.change(screen.getByLabelText(/company alias/i), {
      target: { value: "Northstar Bicycle Repair" },
    });
    fireEvent.change(screen.getByLabelText(/authorized root domain/i), {
      target: { value: "northstar-bicycle.example" },
    });
    fireEvent.click(
      screen.getByLabelText(/i confirm that only the authorized targets/i),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /save and activate project/i }),
    );

    expect(
      await screen.findByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem("reconscope.v1")!);
    expect(stored.projects).toHaveLength(1);
    expect(stored.projects[0].isActive).toBe(true);
    expect(stored.scopes).toHaveLength(1);
    expect(stored.scopes[0].authorizationConfirmed).toBe(true);
    expect(stored.scopes[0].rootDomains).toEqual([
      "northstar-bicycle.example",
    ]);
  });
});
