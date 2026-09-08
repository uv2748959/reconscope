import { describe, expect, it } from "vitest";
import { buildDemoBundle, DEMO_COMPANY_ALIAS } from "./seedData";

// RFC 2606 reserved TLD used throughout the fictional company's own
// hostnames, and the three RFC 5737 documentation address blocks.
const RESERVED_HOSTNAME_SUFFIX = ".example";
const RESERVED_IP_PREFIXES = ["192.0.2.", "198.51.100.", "203.0.113."];
const IPV4_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

function collectIpLikeValues(bundle: ReturnType<typeof buildDemoBundle>): string[] {
  const values: string[] = [];
  for (const asset of bundle.assets) {
    if (IPV4_RE.test(asset.value)) values.push(asset.value);
  }
  for (const observation of bundle.observations) {
    if (IPV4_RE.test(observation.value)) values.push(observation.value);
  }
  return values;
}

describe("buildDemoBundle — Section 16 seed dataset", () => {
  it("uses the specified company alias and root domain", () => {
    const bundle = buildDemoBundle();
    expect(bundle.project.companyAlias).toBe(DEMO_COMPANY_ALIAS);
    expect(bundle.scope.rootDomains).toEqual(["northstar-bicycle.example"]);
  });

  it("includes exactly the four specified subdomains", () => {
    const bundle = buildDemoBundle();
    expect(bundle.scope.subdomains.sort()).toEqual(
      [
        "www.northstar-bicycle.example",
        "shop.northstar-bicycle.example",
        "mail.northstar-bicycle.example",
        "vpn.northstar-bicycle.example",
      ].sort(),
    );
  });

  it("declares 192.0.2.0/24 as the in-scope IP range", () => {
    const bundle = buildDemoBundle();
    expect(bundle.scope.ipRanges).toEqual(["192.0.2.0/24"]);
  });

  it("includes the out-of-scope 198.51.100.14 asset, flagged out_of_scope", () => {
    const bundle = buildDemoBundle();
    const asset = bundle.assets.find((a) => a.value === "198.51.100.14");
    expect(asset).toBeDefined();
    expect(asset?.type).toBe("ip");
    expect(asset?.scopeStatus).toBe("out_of_scope");
  });

  it("records the in-scope IPs as in_scope", () => {
    const bundle = buildDemoBundle();
    const inScopeIps = bundle.assets.filter(
      (a) => a.type === "ip" && a.value !== "198.51.100.14",
    );
    expect(inScopeIps.length).toBeGreaterThan(0);
    for (const asset of inScopeIps) {
      expect(asset.scopeStatus).toBe("in_scope");
    }
  });

  it("has between 18 and 25 observations", () => {
    const bundle = buildDemoBundle();
    expect(bundle.observations.length).toBeGreaterThanOrEqual(18);
    expect(bundle.observations.length).toBeLessThanOrEqual(25);
  });

  it("spans at least six distinct categories", () => {
    const bundle = buildDemoBundle();
    const categories = new Set(bundle.observations.map((o) => o.category));
    expect(categories.size).toBeGreaterThanOrEqual(6);
  });

  it("includes at least three unverified observations", () => {
    const bundle = buildDemoBundle();
    const unverified = bundle.observations.filter(
      (o) => o.status === "unverified",
    );
    expect(unverified.length).toBeGreaterThanOrEqual(3);
  });

  it("uses a mix of low, medium, and high confidence", () => {
    const bundle = buildDemoBundle();
    const confidences = new Set(bundle.observations.map((o) => o.confidence));
    expect(confidences).toEqual(new Set(["low", "medium", "high"]));
  });

  it("writes every observation with method \"demo\"", () => {
    const bundle = buildDemoBundle();
    for (const observation of bundle.observations) {
      expect(observation.method).toBe("demo");
    }
  });

  it("includes four to six sources across different sourceType values", () => {
    const bundle = buildDemoBundle();
    expect(bundle.sources.length).toBeGreaterThanOrEqual(4);
    expect(bundle.sources.length).toBeLessThanOrEqual(6);
    const types = new Set(bundle.sources.map((s) => s.sourceType));
    expect(types.size).toBe(bundle.sources.length);
  });

  it("never references a real domain — every hostname-shaped value ends in .example", () => {
    const bundle = buildDemoBundle();
    const hostnameLike = [
      ...bundle.scope.rootDomains,
      ...bundle.scope.subdomains,
      ...bundle.assets
        .filter((a) => a.type === "domain" || a.type === "subdomain")
        .map((a) => a.value),
    ];
    expect(hostnameLike.length).toBeGreaterThan(0);
    for (const value of hostnameLike) {
      expect(value.toLowerCase().endsWith(RESERVED_HOSTNAME_SUFFIX)).toBe(
        true,
      );
    }
  });

  it("never references a real IP — every IPv4-shaped value falls in an RFC 5737 block", () => {
    const bundle = buildDemoBundle();
    const ips = collectIpLikeValues(bundle);
    expect(ips.length).toBeGreaterThan(0);
    for (const ip of ips) {
      expect(RESERVED_IP_PREFIXES.some((prefix) => ip.startsWith(prefix))).toBe(
        true,
      );
    }
  });

  it("gives every observation a valid, self-consistent projectId and asset/source/tag reference", () => {
    const bundle = buildDemoBundle();
    const assetIds = new Set(bundle.assets.map((a) => a.id));
    const sourceIds = new Set(bundle.sources.map((s) => s.id));
    const tagIds = new Set(bundle.tags.map((t) => t.id));

    for (const observation of bundle.observations) {
      expect(observation.projectId).toBe(bundle.project.id);
      if (observation.assetId !== null) {
        expect(assetIds.has(observation.assetId)).toBe(true);
      }
      if (observation.sourceId !== null) {
        expect(sourceIds.has(observation.sourceId)).toBe(true);
      }
      for (const tagId of observation.tagIds) {
        expect(tagIds.has(tagId)).toBe(true);
      }
    }
    for (const asset of bundle.assets) {
      expect(asset.projectId).toBe(bundle.project.id);
    }
  });

  it("does not create an asset for note observations", () => {
    const bundle = buildDemoBundle();
    const noteObservations = bundle.observations.filter(
      (o) => o.category === "note",
    );
    expect(noteObservations.length).toBeGreaterThan(0);
    for (const observation of noteObservations) {
      expect(observation.assetId).toBeNull();
    }
  });

  it("nests subdomain assets under the root domain asset", () => {
    const bundle = buildDemoBundle();
    const domainAsset = bundle.assets.find((a) => a.type === "domain");
    const subdomainAssets = bundle.assets.filter((a) => a.type === "subdomain");
    expect(domainAsset).toBeDefined();
    expect(subdomainAssets.length).toBeGreaterThan(0);
    for (const asset of subdomainAssets) {
      expect(asset.parentAssetId).toBe(domainAsset!.id);
    }
  });

  it("marks the project active with authorization already confirmed", () => {
    const bundle = buildDemoBundle();
    expect(bundle.project.isActive).toBe(true);
    expect(bundle.scope.authorizationConfirmed).toBe(true);
    expect(bundle.scope.acknowledgedAt).not.toBeNull();
  });

  it("produces fresh ids on every call, so loading twice never collides", () => {
    const first = buildDemoBundle();
    const second = buildDemoBundle();
    expect(first.project.id).not.toBe(second.project.id);
  });
});
