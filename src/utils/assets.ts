import type { Asset, AssetType } from "../types";

/** Finds the existing asset this project already has for a given type and
 * value, so repeated observations about the same thing don't create
 * duplicate assets. */
export function findMatchingAsset(
  assets: Asset[],
  projectId: string,
  type: AssetType,
  value: string,
): Asset | undefined {
  const key = value.trim().toLowerCase();
  return assets.find(
    (asset) =>
      asset.projectId === projectId &&
      asset.type === type &&
      asset.value.trim().toLowerCase() === key,
  );
}

/**
 * A subdomain nests under the longest-matching "domain" asset already known
 * for the project; every other asset type is root-level. This is the only
 * parent/child relationship a bare value lets us infer reliably — anything
 * more (e.g. guessing that a technology belongs to a particular host) would
 * be a guess, not a fact from the data.
 */
export function inferParentAssetId(
  assets: Asset[],
  projectId: string,
  type: AssetType,
  value: string,
): string | null {
  if (type !== "subdomain") return null;

  const host = value.trim().toLowerCase();
  let best: Asset | null = null;

  for (const asset of assets) {
    if (asset.projectId !== projectId || asset.type !== "domain") continue;
    const domain = asset.value.trim().toLowerCase();
    const matches = host === domain || host.endsWith(`.${domain}`);
    if (matches && (!best || domain.length > best.value.trim().length)) {
      best = asset;
    }
  }

  return best?.id ?? null;
}
