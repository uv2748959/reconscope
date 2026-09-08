import { describe, expect, it } from "vitest";
import { findMatchingAsset, inferParentAssetId } from "./assets";
import type { Asset } from "../types";

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "asset-1",
    projectId: "project-1",
    type: "domain",
    value: "northstar-bicycle.example",
    parentAssetId: null,
    firstSeen: "2026-01-01T00:00:00.000Z",
    lastSeen: "2026-01-01T00:00:00.000Z",
    scopeStatus: "in_scope",
    ...overrides,
  };
}

describe("findMatchingAsset", () => {
  it("matches on project, type, and case-insensitive value", () => {
    const asset = makeAsset();
    const found = findMatchingAsset(
      [asset],
      "project-1",
      "domain",
      "NORTHSTAR-BICYCLE.EXAMPLE",
    );
    expect(found).toBe(asset);
  });

  it("does not match a different type", () => {
    const asset = makeAsset({ type: "domain" });
    const found = findMatchingAsset(
      [asset],
      "project-1",
      "subdomain",
      "northstar-bicycle.example",
    );
    expect(found).toBeUndefined();
  });

  it("does not match a different project", () => {
    const asset = makeAsset({ projectId: "project-1" });
    const found = findMatchingAsset(
      [asset],
      "project-2",
      "domain",
      "northstar-bicycle.example",
    );
    expect(found).toBeUndefined();
  });
});

describe("inferParentAssetId", () => {
  it("nests a subdomain under its matching domain asset", () => {
    const domain = makeAsset({ id: "domain-1", type: "domain" });
    const parentId = inferParentAssetId(
      [domain],
      "project-1",
      "subdomain",
      "shop.northstar-bicycle.example",
    );
    expect(parentId).toBe("domain-1");
  });

  it("picks the longest matching domain when more than one matches", () => {
    const shortDomain = makeAsset({
      id: "short",
      type: "domain",
      value: "example",
    });
    const longDomain = makeAsset({
      id: "long",
      type: "domain",
      value: "northstar-bicycle.example",
    });
    const parentId = inferParentAssetId(
      [shortDomain, longDomain],
      "project-1",
      "subdomain",
      "shop.northstar-bicycle.example",
    );
    expect(parentId).toBe("long");
  });

  it("returns null when no domain asset matches", () => {
    const domain = makeAsset({ id: "domain-1", value: "other.example" });
    const parentId = inferParentAssetId(
      [domain],
      "project-1",
      "subdomain",
      "shop.northstar-bicycle.example",
    );
    expect(parentId).toBeNull();
  });

  it("returns null for non-subdomain types", () => {
    const domain = makeAsset({ id: "domain-1" });
    const parentId = inferParentAssetId(
      [domain],
      "project-1",
      "ip",
      "192.0.2.10",
    );
    expect(parentId).toBeNull();
  });

  it("ignores domain assets from other projects", () => {
    const domain = makeAsset({ id: "domain-1", projectId: "other-project" });
    const parentId = inferParentAssetId(
      [domain],
      "project-1",
      "subdomain",
      "shop.northstar-bicycle.example",
    );
    expect(parentId).toBeNull();
  });
});
