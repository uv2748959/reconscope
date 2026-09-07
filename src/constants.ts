import type {
  Confidence,
  ObsStatus,
  ObservationCategory,
  SourceType,
} from "./types";

export const OBSERVATION_CATEGORIES: {
  value: ObservationCategory;
  label: string;
  hint: string;
}[] = [
  {
    value: "domain",
    label: "Domain",
    hint: "A root domain, e.g. northstar-bicycle.example",
  },
  {
    value: "subdomain",
    label: "Subdomain",
    hint: "A fully qualified subdomain, e.g. shop.northstar-bicycle.example",
  },
  { value: "ip", label: "IP address", hint: "An IPv4 address, e.g. 192.0.2.10" },
  {
    value: "dns_record",
    label: "DNS record",
    hint: "e.g. MX 10 mail.northstar-bicycle.example",
  },
  {
    value: "certificate",
    label: "Certificate",
    hint: "e.g. a certificate transparency log entry",
  },
  {
    value: "technology",
    label: "Technology",
    hint: "e.g. nginx, WordPress, Cloudflare",
  },
  {
    value: "person_role",
    label: "Person / Role",
    hint: "e.g. IT Manager — jsmith@northstar-bicycle.example",
  },
  {
    value: "social_profile",
    label: "Social profile",
    hint: "e.g. a LinkedIn or X profile URL",
  },
  {
    value: "document",
    label: "Document metadata",
    hint: "e.g. author or software found in a document's properties",
  },
  {
    value: "note",
    label: "Note",
    hint: "Any other observation that doesn't fit a category above",
  },
];

export const CONFIDENCE_LEVELS: { value: Confidence; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const OBS_STATUSES: { value: ObsStatus; label: string }[] = [
  { value: "unverified", label: "Unverified" },
  { value: "verified", label: "Verified" },
  { value: "duplicate", label: "Duplicate" },
  { value: "out_of_scope", label: "Out of scope" },
];

export const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "whois", label: "WHOIS" },
  { value: "dns", label: "DNS" },
  { value: "cert_transparency", label: "Certificate transparency" },
  { value: "search_engine", label: "Search engine" },
  { value: "social", label: "Social media" },
  { value: "document", label: "Document" },
  { value: "other", label: "Other" },
];

export const TAG_COLOR_PALETTE: readonly string[] = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function categoryLabel(category: ObservationCategory): string {
  return (
    OBSERVATION_CATEGORIES.find((c) => c.value === category)?.label ??
    category
  );
}

export function statusLabel(status: ObsStatus): string {
  return OBS_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function sourceTypeLabel(type: SourceType): string {
  return SOURCE_TYPES.find((t) => t.value === type)?.label ?? type;
}
