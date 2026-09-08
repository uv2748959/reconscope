// The single place scope logic exists, per PRD Section 15.

import type { Scope, ScopeStatus } from "./types";

const HOSTNAME_RE =
  /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+\.?$/;

function isIPv4Format(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

function isHostnameFormat(value: string): boolean {
  return HOSTNAME_RE.test(value);
}

const IPV4_ATTEMPT_RE = /^\d+(\.\d+)+$/;

/** True for a value made up only of dot-separated digit groups, e.g.
 * "192.0.2.999" or "192.0.2" — someone clearly meant an IP address, even
 * though it fails IPv4 validation. Such a value must not fall through to
 * hostname matching. */
function looksLikeIPv4Attempt(value: string): boolean {
  return IPV4_ATTEMPT_RE.test(value);
}

function isCidrOrIp(value: string): boolean {
  const [ipPart] = value.split("/");
  return isIPv4Format(ipPart);
}

/** Lowercases, strips a trailing dot, and strips a leading "www.". */
function normalizeHostname(value: string): string {
  let v = value.trim().toLowerCase();
  if (v.endsWith(".")) v = v.slice(0, -1);
  if (v.startsWith("www.")) v = v.slice(4);
  return v;
}

function hostnameMatchesDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function ipToInt(ip: string): number {
  return (
    ip
      .split(".")
      .reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
  );
}

function cidrMask(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

function toCidr(value: string): string {
  return value.includes("/") ? value : `${value}/32`;
}

function ipInCidr(ip: string, cidr: string): boolean {
  const [network, prefixStr] = cidr.split("/");
  if (!isIPv4Format(network)) return false;
  const prefix = Number(prefixStr);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;

  const mask = cidrMask(prefix);
  return (ipToInt(ip) & mask) === (ipToInt(network) & mask);
}

function checkHostname(value: string, scope: Scope): ScopeStatus {
  const host = normalizeHostname(value);

  const isExcluded = scope.exclusions.some((exclusion) => {
    if (isCidrOrIp(exclusion)) return false;
    return hostnameMatchesDomain(host, normalizeHostname(exclusion));
  });
  if (isExcluded) return "out_of_scope";

  const matchesRoot = scope.rootDomains.some((root) =>
    hostnameMatchesDomain(host, normalizeHostname(root)),
  );
  const matchesSubdomain = scope.subdomains.some(
    (sub) => normalizeHostname(sub) === host,
  );

  return matchesRoot || matchesSubdomain ? "in_scope" : "out_of_scope";
}

function checkIp(value: string, scope: Scope): ScopeStatus {
  const isExcluded = scope.exclusions.some(
    (exclusion) => isCidrOrIp(exclusion) && ipInCidr(value, toCidr(exclusion)),
  );
  if (isExcluded) return "out_of_scope";

  const matchesRange = scope.ipRanges.some((range) => ipInCidr(value, range));
  return matchesRange ? "in_scope" : "out_of_scope";
}

/**
 * Returns "in_scope", "out_of_scope", or "undetermined" for a value against
 * a project's scope. Hostnames and IPs get a definite verdict; anything
 * else (technologies, people, notes) is "undetermined" and never flagged
 * red, per PRD Section 15.
 */
export function isInScope(value: string, scope: Scope): ScopeStatus {
  const trimmed = value.trim();

  if (isIPv4Format(trimmed)) {
    return checkIp(trimmed, scope);
  }

  if (looksLikeIPv4Attempt(trimmed)) {
    return "undetermined";
  }

  if (isHostnameFormat(trimmed.toLowerCase())) {
    return checkHostname(trimmed, scope);
  }

  return "undetermined";
}
