// Data model types. Field names, enum members, and structure are taken
// verbatim from PRD Section 9. All timestamps are ISO 8601 strings in UTC.
// All ids are UUID v4 strings generated with crypto.randomUUID().

export interface Project {
  id: string;
  name: string;
  companyAlias: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Scope {
  projectId: string;
  rootDomains: string[];
  subdomains: string[];
  ipRanges: string[];
  exclusions: string[];
  authorizationConfirmed: boolean;
  authorizationNote: string;
  acknowledgedAt: string | null;
}

export type AssetType =
  | "domain"
  | "subdomain"
  | "ip"
  | "dns_record"
  | "certificate"
  | "technology"
  | "person_role"
  | "social_profile"
  | "document";

export type ScopeStatus = "in_scope" | "out_of_scope" | "undetermined";

export interface Asset {
  id: string;
  projectId: string;
  type: AssetType;
  value: string;
  parentAssetId: string | null;
  firstSeen: string;
  lastSeen: string;
  scopeStatus: ScopeStatus;
}

export type ObservationCategory = AssetType | "note";

export type Method = "manual" | "demo" | "passive_lookup";

export type Confidence = "low" | "medium" | "high";

export type ObsStatus =
  | "unverified"
  | "verified"
  | "duplicate"
  | "out_of_scope";

export interface Observation {
  id: string;
  projectId: string;
  assetId: string | null;
  category: ObservationCategory;
  value: string;
  method: Method;
  confidence: Confidence;
  status: ObsStatus;
  sourceId: string | null;
  tagIds: string[];
  notes: string;
  collectedAt: string;
}

export type SourceType =
  | "website"
  | "whois"
  | "dns"
  | "cert_transparency"
  | "search_engine"
  | "social"
  | "document"
  | "other";

export interface Source {
  id: string;
  name: string;
  url: string | null;
  sourceType: SourceType;
  accessedAt: string;
}

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface Report {
  id: string;
  projectId: string;
  generatedAt: string;
  summary: string;
  limitations: string;
  recommendations: string;
}
