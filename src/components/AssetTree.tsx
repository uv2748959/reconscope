import { useMemo, useState } from "react";
import { categoryLabel } from "../constants";
import type { Asset, ScopeStatus } from "../types";

interface AssetTreeProps {
  assets: Asset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SCOPE_BADGES: Partial<
  Record<ScopeStatus, { label: string; className: string }>
> = {
  in_scope: { label: "In scope", className: "bg-green-100 text-green-800" },
  out_of_scope: {
    label: "⚠ Out of scope",
    className: "bg-red-100 text-red-800",
  },
};

function AssetNode({
  asset,
  childrenByParent,
  selectedId,
  onSelect,
}: {
  asset: Asset;
  childrenByParent: Map<string, Asset[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const children = childrenByParent.get(asset.id) ?? [];
  const [expanded, setExpanded] = useState(true);
  const badge = SCOPE_BADGES[asset.scopeStatus];
  const isSelected = selectedId === asset.id;

  return (
    <li>
      <div
        className={`flex flex-wrap items-center gap-2 rounded px-2 py-1 ${
          isSelected ? "bg-slate-200" : "hover:bg-slate-100"
        }`}
      >
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse" : "Expand"}
            className="w-4 text-slate-500"
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="inline-block w-4" aria-hidden="true" />
        )}

        <button
          type="button"
          onClick={() => onSelect(asset.id)}
          className="flex flex-1 flex-wrap items-center gap-2 text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {categoryLabel(asset.type)}
          </span>
          <span className="font-medium">{asset.value}</span>
          {badge && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
          )}
        </button>
      </div>

      {expanded && children.length > 0 && (
        <ul className="ml-6 border-l border-slate-200 pl-3">
          {children.map((child) => (
            <AssetNode
              key={child.id}
              asset={child}
              childrenByParent={childrenByParent}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function AssetTree({
  assets,
  selectedId,
  onSelect,
}: AssetTreeProps) {
  const childrenByParent = useMemo(() => {
    const map = new Map<string, Asset[]>();
    for (const asset of assets) {
      if (!asset.parentAssetId) continue;
      const list = map.get(asset.parentAssetId) ?? [];
      list.push(asset);
      map.set(asset.parentAssetId, list);
    }
    return map;
  }, [assets]);

  const roots = assets.filter((asset) => !asset.parentAssetId);

  if (roots.length === 0) return null;

  return (
    <ul className="space-y-1">
      {roots.map((asset) => (
        <AssetNode
          key={asset.id}
          asset={asset}
          childrenByParent={childrenByParent}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
