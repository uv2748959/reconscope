// Fictional demo dataset, per PRD Section 16. Every value here must fall
// inside RFC 2606 (the .example TLD) or RFC 5737 (192.0.2.0/24,
// 198.51.100.0/24, 203.0.113.0/24) reserved space — no real company,
// domain, or IP address.

import { isInScope } from "./scopeCheck";
import { findMatchingAsset, inferParentAssetId } from "./utils/assets";
import { TAG_COLOR_PALETTE } from "./constants";
import type {
  Asset,
  Confidence,
  ObsStatus,
  Observation,
  ObservationCategory,
  Project,
  Scope,
  Source,
  Tag,
} from "./types";

export const DEMO_COMPANY_ALIAS = "Northstar Bicycle Repair";

export interface DemoBundle {
  project: Project;
  scope: Scope;
  assets: Asset[];
  observations: Observation[];
  sources: Source[];
  tags: Tag[];
}

interface SeedObservationInput {
  category: ObservationCategory;
  value: string;
  confidence: Confidence;
  status: ObsStatus;
  sourceIndex: number | null;
  tagIds: string[];
  notes: string;
  daysAgo: number;
}

/** Builds a fresh, fully self-consistent demo project — new random ids
 * every time, so "load" and "reset" both just produce a brand-new bundle. */
export function buildDemoBundle(): DemoBundle {
  const now = new Date();
  const daysAgoIso = (days: number): string => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString();
  };
  const nowIso = now.toISOString();

  const projectId = crypto.randomUUID();

  const project: Project = {
    id: projectId,
    name: "Northstar Bicycle Repair — Demo",
    companyAlias: DEMO_COMPANY_ALIAS,
    description:
      "Fictional demo project for the Recon phase. Uses only reserved example domains and documentation IP ranges.",
    startDate: daysAgoIso(14).slice(0, 10),
    endDate: null,
    isActive: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const scope: Scope = {
    projectId,
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
    authorizationNote:
      "Classroom authorization on file for this fictional demo exercise.",
    acknowledgedAt: nowIso,
  };

  const sources: Source[] = [
    {
      id: crypto.randomUUID(),
      name: "Northstar Bicycle Repair — public website",
      url: "https://northstar-bicycle.example",
      sourceType: "website",
      accessedAt: daysAgoIso(10),
    },
    {
      id: crypto.randomUUID(),
      name: "WHOIS record for northstar-bicycle.example",
      url: null,
      sourceType: "whois",
      accessedAt: daysAgoIso(10),
    },
    {
      id: crypto.randomUUID(),
      name: "Passive DNS records",
      url: null,
      sourceType: "dns",
      accessedAt: daysAgoIso(9),
    },
    {
      id: crypto.randomUUID(),
      name: "Certificate transparency log search",
      url: null,
      sourceType: "cert_transparency",
      accessedAt: daysAgoIso(9),
    },
    {
      id: crypto.randomUUID(),
      name: "General web search results",
      url: null,
      sourceType: "search_engine",
      accessedAt: daysAgoIso(8),
    },
    {
      id: crypto.randomUUID(),
      name: "Company social media profile",
      url: null,
      sourceType: "social",
      accessedAt: daysAgoIso(7),
    },
  ];

  const tags: Tag[] = [
    { id: crypto.randomUUID(), label: "verified-lead", color: TAG_COLOR_PALETTE[3] },
    { id: crypto.randomUUID(), label: "needs-followup", color: TAG_COLOR_PALETTE[0] },
    { id: crypto.randomUUID(), label: "public-facing", color: TAG_COLOR_PALETTE[5] },
  ];
  const [verifiedTag, followupTag, publicTag] = tags;

  const inputs: SeedObservationInput[] = [
    {
      category: "domain",
      value: "northstar-bicycle.example",
      confidence: "high",
      status: "verified",
      sourceIndex: 0,
      tagIds: [publicTag.id],
      notes: "Root domain confirmed via WHOIS and the live site.",
      daysAgo: 10,
    },
    {
      category: "subdomain",
      value: "www.northstar-bicycle.example",
      confidence: "high",
      status: "verified",
      sourceIndex: 0,
      tagIds: [],
      notes: "Redirects to the main marketing site.",
      daysAgo: 10,
    },
    {
      category: "subdomain",
      value: "shop.northstar-bicycle.example",
      confidence: "high",
      status: "verified",
      sourceIndex: 0,
      tagIds: [publicTag.id],
      notes: "Online storefront for bicycle parts.",
      daysAgo: 9,
    },
    {
      category: "subdomain",
      value: "mail.northstar-bicycle.example",
      confidence: "medium",
      status: "verified",
      sourceIndex: 2,
      tagIds: [],
      notes: "Referenced in the MX record.",
      daysAgo: 9,
    },
    {
      category: "subdomain",
      value: "vpn.northstar-bicycle.example",
      confidence: "medium",
      status: "unverified",
      sourceIndex: 2,
      tagIds: [followupTag.id],
      notes: "Possible remote-access portal; reachability not yet confirmed.",
      daysAgo: 8,
    },
    {
      category: "ip",
      value: "192.0.2.10",
      confidence: "high",
      status: "verified",
      sourceIndex: 2,
      tagIds: [],
      notes: "Resolves for shop.northstar-bicycle.example.",
      daysAgo: 9,
    },
    {
      category: "ip",
      value: "192.0.2.20",
      confidence: "medium",
      status: "verified",
      sourceIndex: 2,
      tagIds: [],
      notes: "Resolves for mail.northstar-bicycle.example.",
      daysAgo: 9,
    },
    {
      category: "ip",
      value: "198.51.100.14",
      confidence: "low",
      status: "unverified",
      sourceIndex: 4,
      tagIds: [followupTag.id],
      notes:
        "Turned up in a general search result; falls outside the authorized range.",
      daysAgo: 6,
    },
    {
      category: "dns_record",
      value: "MX 10 mail.northstar-bicycle.example",
      confidence: "high",
      status: "verified",
      sourceIndex: 2,
      tagIds: [],
      notes: "Primary mail exchanger.",
      daysAgo: 9,
    },
    {
      category: "dns_record",
      value: 'TXT "v=spf1 include:_spf.northstar-bicycle.example ~all"',
      confidence: "medium",
      status: "verified",
      sourceIndex: 2,
      tagIds: [],
      notes: "SPF record for outbound mail.",
      daysAgo: 9,
    },
    {
      category: "dns_record",
      value: "CNAME www -> northstar-bicycle.example",
      confidence: "medium",
      status: "unverified",
      sourceIndex: 2,
      tagIds: [],
      notes: "Needs confirmation against the live zone.",
      daysAgo: 8,
    },
    {
      category: "certificate",
      value:
        "TLS certificate for shop.northstar-bicycle.example, issued by a public CA",
      confidence: "high",
      status: "verified",
      sourceIndex: 3,
      tagIds: [verifiedTag.id],
      notes: "Valid certificate observed on the storefront.",
      daysAgo: 7,
    },
    {
      category: "technology",
      value: "nginx",
      confidence: "high",
      status: "verified",
      sourceIndex: 0,
      tagIds: [],
      notes: "Server header on the main site.",
      daysAgo: 10,
    },
    {
      category: "technology",
      value: "WordPress",
      confidence: "medium",
      status: "verified",
      sourceIndex: 0,
      tagIds: [],
      notes: "Generator meta tag on the marketing site.",
      daysAgo: 10,
    },
    {
      category: "technology",
      value: "Cloudflare",
      confidence: "high",
      status: "verified",
      sourceIndex: 4,
      tagIds: [],
      notes: "Front-end CDN/WAF observed on all subdomains.",
      daysAgo: 8,
    },
    {
      category: "technology",
      value: "Google Workspace",
      confidence: "medium",
      status: "unverified",
      sourceIndex: 2,
      tagIds: [],
      notes: "Suggested by the MX record pattern; not directly confirmed.",
      daysAgo: 8,
    },
    {
      category: "person_role",
      value:
        "IT Manager — Alex Rivera — alex.rivera@northstar-bicycle.example",
      confidence: "medium",
      status: "unverified",
      sourceIndex: 5,
      tagIds: [followupTag.id],
      notes: 'Listed on the company "About Us" page.',
      daysAgo: 6,
    },
    {
      category: "person_role",
      value:
        "Marketing Coordinator — Jordan Lee — jordan.lee@northstar-bicycle.example",
      confidence: "low",
      status: "unverified",
      sourceIndex: 5,
      tagIds: [],
      notes: "Named in a social media post.",
      daysAgo: 5,
    },
    {
      category: "person_role",
      value: "Store Manager — Sam Patel — sam.patel@northstar-bicycle.example",
      confidence: "medium",
      status: "unverified",
      sourceIndex: 0,
      tagIds: [],
      notes: 'Listed on the company "About Us" page.',
      daysAgo: 6,
    },
    {
      category: "social_profile",
      value: "Company social profile referenced from the main site footer",
      confidence: "low",
      status: "unverified",
      sourceIndex: 5,
      tagIds: [],
      notes: "Link present in the site footer; content not reviewed in depth.",
      daysAgo: 5,
    },
    {
      category: "social_profile",
      value:
        "Employee professional-network profile mentioning Northstar Bicycle Repair",
      confidence: "low",
      status: "unverified",
      sourceIndex: 4,
      tagIds: [],
      notes: "Found via general search; identity not cross-verified.",
      daysAgo: 4,
    },
    {
      category: "document",
      value:
        'PDF spec-sheet metadata lists author "jlee" and producer "a word processor"',
      confidence: "low",
      status: "unverified",
      sourceIndex: 0,
      tagIds: [],
      notes: "Downloaded from the shop subdomain's resources page.",
      daysAgo: 4,
    },
    {
      category: "note",
      value:
        "Company appears to rely on a third-party IT contractor for VPN administration, based on naming conventions.",
      confidence: "low",
      status: "unverified",
      sourceIndex: null,
      tagIds: [],
      notes: "Working theory only; not yet corroborated.",
      daysAgo: 3,
    },
    {
      category: "note",
      value:
        "Marketing Coordinator observation may duplicate the About Us page listing.",
      confidence: "low",
      status: "duplicate",
      sourceIndex: null,
      tagIds: [],
      notes: "Cross-check against the person_role entry before reporting.",
      daysAgo: 2,
    },
  ];

  const assets: Asset[] = [];

  const observations: Observation[] = inputs.map((input) => {
    let assetId: string | null = null;

    if (input.category !== "note") {
      const assetType = input.category;
      const scopeStatus = isInScope(input.value, scope);
      const seenAt = daysAgoIso(input.daysAgo);
      const existing = findMatchingAsset(
        assets,
        projectId,
        assetType,
        input.value,
      );

      if (existing) {
        const index = assets.findIndex((a) => a.id === existing.id);
        assets[index] = { ...existing, lastSeen: seenAt, scopeStatus };
        assetId = existing.id;
      } else {
        const asset: Asset = {
          id: crypto.randomUUID(),
          projectId,
          type: assetType,
          value: input.value,
          parentAssetId: inferParentAssetId(
            assets,
            projectId,
            assetType,
            input.value,
          ),
          firstSeen: seenAt,
          lastSeen: seenAt,
          scopeStatus,
        };
        assets.push(asset);
        assetId = asset.id;
      }
    }

    return {
      id: crypto.randomUUID(),
      projectId,
      assetId,
      category: input.category,
      value: input.value,
      method: "demo",
      confidence: input.confidence,
      status: input.status,
      sourceId: input.sourceIndex === null ? null : sources[input.sourceIndex].id,
      tagIds: input.tagIds,
      notes: input.notes,
      collectedAt: daysAgoIso(input.daysAgo),
    };
  });

  return { project, scope, assets, observations, sources, tags };
}
