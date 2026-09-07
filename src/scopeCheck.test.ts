import { describe, expect, it } from "vitest";
import { isInScope } from "./scopeCheck";
import type { Scope } from "./types";

function makeScope(overrides: Partial<Scope> = {}): Scope {
  return {
    projectId: "test-project",
    rootDomains: ["northstar-bicycle.example"],
    subdomains: [
      "www.northstar-bicycle.example",
      "shop.northstar-bicycle.example",
      "mail.northstar-bicycle.example",
      "vpn.northstar-bicycle.example",
    ],
    ipRanges: ["192.0.2.0/24"],
    exclusions: [],
    authorizationConfirmed: true,
    authorizationNote: "",
    acknowledgedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("isInScope — hostnames", () => {
  it("matches an exact root domain", () => {
    const scope = makeScope();
    expect(isInScope("northstar-bicycle.example", scope)).toBe("in_scope");
  });

  it("matches a subdomain of a root domain not explicitly listed", () => {
    const scope = makeScope();
    expect(isInScope("api.northstar-bicycle.example", scope)).toBe(
      "in_scope",
    );
  });

  it("matches a listed subdomain exactly", () => {
    const scope = makeScope();
    expect(isInScope("shop.northstar-bicycle.example", scope)).toBe(
      "in_scope",
    );
  });

  it("flags a hostname outside every root domain and subdomain", () => {
    const scope = makeScope();
    expect(isInScope("evil.example.com", scope)).toBe("out_of_scope");
  });

  it("flags a hostname that matches a domain exclusion", () => {
    const scope = makeScope({
      exclusions: ["internal.northstar-bicycle.example"],
    });
    expect(
      isInScope("internal.northstar-bicycle.example", scope),
    ).toBe("out_of_scope");
  });

  it("flags a subdomain of an excluded domain", () => {
    const scope = makeScope({
      exclusions: ["internal.northstar-bicycle.example"],
    });
    expect(
      isInScope("staging.internal.northstar-bicycle.example", scope),
    ).toBe("out_of_scope");
  });

  it("is case-insensitive", () => {
    const scope = makeScope();
    expect(isInScope("SHOP.Northstar-Bicycle.EXAMPLE", scope)).toBe(
      "in_scope",
    );
  });

  it("normalizes a trailing dot", () => {
    const scope = makeScope();
    expect(isInScope("shop.northstar-bicycle.example.", scope)).toBe(
      "in_scope",
    );
  });

  it("normalizes a leading www.", () => {
    const scope = makeScope();
    expect(isInScope("www.northstar-bicycle.example", scope)).toBe(
      "in_scope",
    );
  });
});

describe("isInScope — IPs", () => {
  it("matches an IP inside a listed CIDR range", () => {
    const scope = makeScope();
    expect(isInScope("192.0.2.10", scope)).toBe("in_scope");
  });

  it("flags an IP outside every listed CIDR range", () => {
    const scope = makeScope();
    expect(isInScope("198.51.100.14", scope)).toBe("out_of_scope");
  });

  it("flags an IP inside an excluded CIDR range", () => {
    const scope = makeScope({ exclusions: ["192.0.2.128/25"] });
    expect(isInScope("192.0.2.200", scope)).toBe("out_of_scope");
  });

  it("still allows an in-range IP outside the excluded sub-range", () => {
    const scope = makeScope({ exclusions: ["192.0.2.128/25"] });
    expect(isInScope("192.0.2.10", scope)).toBe("in_scope");
  });

  it("flags an exact excluded host IP given without a prefix", () => {
    const scope = makeScope({ exclusions: ["192.0.2.10"] });
    expect(isInScope("192.0.2.10", scope)).toBe("out_of_scope");
  });
});

describe("isInScope — undetermined values", () => {
  it("returns undetermined for a technology name", () => {
    const scope = makeScope();
    expect(isInScope("nginx", scope)).toBe("undetermined");
  });

  it("returns undetermined for a free-text note", () => {
    const scope = makeScope();
    expect(
      isInScope("Found via LinkedIn job posting", scope),
    ).toBe("undetermined");
  });

  it("returns undetermined for a person/role value", () => {
    const scope = makeScope();
    expect(isInScope("IT Manager", scope)).toBe("undetermined");
  });
});

describe("isInScope — edge cases", () => {
  it("flags a hostname and an IP as out_of_scope when no ranges are configured", () => {
    // An empty rootDomains/ipRanges list means nothing can match the "in
    // scope" rules in Section 15, so a real hostname or IP is a definite
    // out_of_scope, not "undetermined" — undetermined is reserved for
    // values that aren't hostnames or IPs at all.
    const scope = makeScope({ rootDomains: [], subdomains: [], ipRanges: [] });
    expect(isInScope("shop.northstar-bicycle.example", scope)).toBe(
      "out_of_scope",
    );
    expect(isInScope("192.0.2.10", scope)).toBe("out_of_scope");
  });

  it("returns undetermined for a malformed IP that fails octet validation", () => {
    const scope = makeScope();
    // 999 is not a valid IPv4 octet (0-255), so "192.0.2.999" is not a
    // real IP — and it is not a hostname anyone would enter either. Per
    // Section 15, a value that is neither a hostname nor an IP must
    // return "undetermined" and must never be flagged red.
    expect(isInScope("192.0.2.999", scope)).toBe("undetermined");
  });
});
