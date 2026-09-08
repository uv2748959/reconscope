import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProvider } from "../state/AppContext";
import { createEmptyData, saveData } from "../storage";
import ObservationForm from "./ObservationForm";
import type { Project, Scope } from "../types";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";

function seed() {
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
    ipRanges: [],
    exclusions: [],
    authorizationConfirmed: true,
    authorizationNote: "",
    acknowledgedAt: "2026-01-01T00:00:00.000Z",
  };
  saveData({ ...createEmptyData(), projects: [project], scopes: [scope] });
}

function renderForm() {
  return render(
    <AppProvider>
      <ObservationForm
        projectId={PROJECT_ID}
        onCancel={() => {}}
        onSaved={() => {}}
      />
    </AppProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("ObservationForm — FR-07/FR-13 asset derivation", () => {
  it("creates a matching, scope-checked asset and links the observation to it", () => {
    seed();
    renderForm();

    fireEvent.change(screen.getByLabelText(/^category$/i), {
      target: { value: "subdomain" },
    });
    fireEvent.change(screen.getByLabelText(/^value$/i), {
      target: { value: "shop.northstar-bicycle.example" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /add observation/i }),
    );

    const stored = JSON.parse(localStorage.getItem("reconscope.v1")!);
    expect(stored.assets).toHaveLength(1);
    expect(stored.assets[0]).toMatchObject({
      projectId: PROJECT_ID,
      type: "subdomain",
      value: "shop.northstar-bicycle.example",
      parentAssetId: null,
      scopeStatus: "in_scope",
    });
    expect(stored.observations[0].assetId).toBe(stored.assets[0].id);
  });

  it("reuses an existing asset for the same type and value instead of duplicating", () => {
    seed();
    const { unmount } = renderForm();

    fireEvent.change(screen.getByLabelText(/^category$/i), {
      target: { value: "ip" },
    });
    fireEvent.change(screen.getByLabelText(/^value$/i), {
      target: { value: "198.51.100.14" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /add observation/i }),
    );
    unmount();

    renderForm();
    fireEvent.change(screen.getByLabelText(/^category$/i), {
      target: { value: "ip" },
    });
    fireEvent.change(screen.getByLabelText(/^value$/i), {
      target: { value: "198.51.100.14" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /add observation/i }),
    );

    const stored = JSON.parse(localStorage.getItem("reconscope.v1")!);
    expect(stored.assets).toHaveLength(1);
    expect(stored.assets[0].scopeStatus).toBe("out_of_scope");
    expect(stored.observations).toHaveLength(2);
    expect(stored.observations[0].assetId).toBe(stored.assets[0].id);
    expect(stored.observations[1].assetId).toBe(stored.assets[0].id);
  });

  it("nests a subdomain asset under an existing domain asset", () => {
    seed();
    const { unmount } = renderForm();

    fireEvent.change(screen.getByLabelText(/^category$/i), {
      target: { value: "domain" },
    });
    fireEvent.change(screen.getByLabelText(/^value$/i), {
      target: { value: "northstar-bicycle.example" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /add observation/i }),
    );
    unmount();

    renderForm();
    fireEvent.change(screen.getByLabelText(/^category$/i), {
      target: { value: "subdomain" },
    });
    fireEvent.change(screen.getByLabelText(/^value$/i), {
      target: { value: "shop.northstar-bicycle.example" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /add observation/i }),
    );

    const stored = JSON.parse(localStorage.getItem("reconscope.v1")!);
    const domainAsset = stored.assets.find((a: { type: string }) => a.type === "domain");
    const subdomainAsset = stored.assets.find(
      (a: { type: string }) => a.type === "subdomain",
    );
    expect(subdomainAsset.parentAssetId).toBe(domainAsset.id);
  });

  it("does not create an asset for a note observation", () => {
    seed();
    renderForm();

    fireEvent.change(screen.getByLabelText(/^category$/i), {
      target: { value: "note" },
    });
    fireEvent.change(screen.getByLabelText(/^value$/i), {
      target: { value: "General reconnaissance note." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /add observation/i }),
    );

    const stored = JSON.parse(localStorage.getItem("reconscope.v1")!);
    expect(stored.assets).toHaveLength(0);
    expect(stored.observations[0].assetId).toBeNull();
  });
});
