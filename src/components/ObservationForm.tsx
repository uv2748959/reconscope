import { useId, useState, type FormEvent } from "react";
import { useApp } from "../state/AppContext";
import {
  CONFIDENCE_LEVELS,
  OBSERVATION_CATEGORIES,
  OBS_STATUSES,
  SOURCE_TYPES,
  TAG_COLOR_PALETTE,
} from "../constants";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "../utils/dateInput";
import { findMatchingAsset, inferParentAssetId } from "../utils/assets";
import { isInScope } from "../scopeCheck";
import type {
  Asset,
  Confidence,
  ObsStatus,
  Observation,
  ObservationCategory,
  Source,
  SourceType,
  Tag,
} from "../types";

interface ObservationFormProps {
  projectId: string;
  initial?: Observation;
  onCancel: () => void;
  onSaved: () => void;
}

const NEW_SOURCE = "__new__";

export default function ObservationForm({
  projectId,
  initial,
  onCancel,
  onSaved,
}: ObservationFormProps) {
  const { state, dispatch } = useApp();

  const [category, setCategory] = useState<ObservationCategory>(
    initial?.category ?? "domain",
  );
  const [value, setValue] = useState(initial?.value ?? "");
  const [confidence, setConfidence] = useState<Confidence>(
    initial?.confidence ?? "medium",
  );
  const [status, setStatus] = useState<ObsStatus>(
    initial?.status ?? "unverified",
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [collectedAt, setCollectedAt] = useState(
    toDatetimeLocalValue(initial?.collectedAt ?? new Date().toISOString()),
  );
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [sourceId, setSourceId] = useState<string>(initial?.sourceId ?? "");

  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceType, setNewSourceType] = useState<SourceType>("website");
  const [newSourceAccessedAt, setNewSourceAccessedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState<string>(TAG_COLOR_PALETTE[0]);

  const valueId = useId();
  const categoryId = useId();
  const confidenceId = useId();
  const statusId = useId();
  const notesId = useId();
  const collectedAtId = useId();
  const sourceSelectId = useId();
  const newSourceNameId = useId();
  const newSourceUrlId = useId();
  const newSourceTypeId = useId();
  const newSourceAccessedAtId = useId();
  const newTagLabelId = useId();

  const trimmedValue = value.trim();
  const isAddingNewSource = sourceId === NEW_SOURCE;
  const trimmedNewSourceName = newSourceName.trim();

  const canSave =
    trimmedValue.length > 0 &&
    trimmedValue.length <= 500 &&
    collectedAt.length > 0 &&
    (!isAddingNewSource || trimmedNewSourceName.length > 0);

  function toggleTag(tagId: string) {
    setTagIds((current) =>
      current.includes(tagId)
        ? current.filter((existing) => existing !== tagId)
        : [...current, tagId],
    );
  }

  function handleAddTag() {
    const label = newTagLabel.trim();
    if (label.length === 0 || label.length > 24) return;
    const tag: Tag = { id: crypto.randomUUID(), label, color: newTagColor };
    dispatch({ type: "CREATE_TAG", tag });
    setTagIds((current) => [...current, tag.id]);
    setNewTagLabel("");
    setShowNewTag(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    const now = new Date().toISOString();

    let finalSourceId: string | null =
      sourceId && !isAddingNewSource ? sourceId : null;

    if (isAddingNewSource) {
      const source: Source = {
        id: crypto.randomUUID(),
        name: trimmedNewSourceName,
        url: newSourceUrl.trim() || null,
        sourceType: newSourceType,
        accessedAt: new Date(
          `${newSourceAccessedAt}T00:00:00.000Z`,
        ).toISOString(),
      };
      dispatch({ type: "CREATE_SOURCE", source });
      finalSourceId = source.id;
    }

    // Every category but "note" tracks a deduplicated Asset, keeping the
    // Assets screen and dashboard footprint counts (FR-07/FR-13) in sync
    // with what Evidence Log records.
    let assetId: string | null = null;
    if (category !== "note") {
      const assetType = category;
      const scope = state.scopes.find((s) => s.projectId === projectId);
      const scopeStatus = scope
        ? isInScope(trimmedValue, scope)
        : "undetermined";
      const existingAsset = findMatchingAsset(
        state.assets,
        projectId,
        assetType,
        trimmedValue,
      );

      if (existingAsset) {
        dispatch({
          type: "UPDATE_ASSET",
          asset: { ...existingAsset, lastSeen: now, scopeStatus },
        });
        assetId = existingAsset.id;
      } else {
        const asset: Asset = {
          id: crypto.randomUUID(),
          projectId,
          type: assetType,
          value: trimmedValue,
          parentAssetId: inferParentAssetId(
            state.assets,
            projectId,
            assetType,
            trimmedValue,
          ),
          firstSeen: now,
          lastSeen: now,
          scopeStatus,
        };
        dispatch({ type: "CREATE_ASSET", asset });
        assetId = asset.id;
      }
    }

    const observation: Observation = {
      id: initial?.id ?? crypto.randomUUID(),
      projectId,
      assetId,
      category,
      value: trimmedValue,
      method: initial?.method ?? "manual",
      confidence,
      status,
      sourceId: finalSourceId,
      tagIds,
      notes: notes.trim().slice(0, 2000),
      collectedAt: fromDatetimeLocalValue(collectedAt),
    };

    if (initial) {
      dispatch({ type: "UPDATE_OBSERVATION", observation });
    } else {
      dispatch({ type: "CREATE_OBSERVATION", observation });
    }
    onSaved();
  }

  const selectedCategoryHint = OBSERVATION_CATEGORIES.find(
    (c) => c.value === category,
  )?.hint;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded border border-slate-300 bg-white p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={categoryId} className="block text-sm font-medium">
            Category
          </label>
          <select
            id={categoryId}
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as ObservationCategory)
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {OBSERVATION_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={confidenceId} className="block text-sm font-medium">
            Confidence
          </label>
          <select
            id={confidenceId}
            value={confidence}
            onChange={(e) => setConfidence(e.target.value as Confidence)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {CONFIDENCE_LEVELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={valueId} className="block text-sm font-medium">
          Value
        </label>
        {selectedCategoryHint && (
          <p className="text-sm text-slate-500">{selectedCategoryHint}</p>
        )}
        <textarea
          id={valueId}
          required
          maxLength={500}
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={statusId} className="block text-sm font-medium">
            Status
          </label>
          <select
            id={statusId}
            value={status}
            onChange={(e) => setStatus(e.target.value as ObsStatus)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {OBS_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={collectedAtId}
            className="block text-sm font-medium"
          >
            Collected at
          </label>
          <input
            id={collectedAtId}
            type="datetime-local"
            required
            value={collectedAt}
            onChange={(e) => setCollectedAt(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor={sourceSelectId} className="block text-sm font-medium">
          Source (optional)
        </label>
        <select
          id={sourceSelectId}
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        >
          <option value="">No source</option>
          {state.sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          <option value={NEW_SOURCE}>+ Add new source…</option>
        </select>

        {isAddingNewSource && (
          <div className="mt-3 space-y-3 rounded border border-slate-200 bg-slate-50 p-3">
            <div>
              <label
                htmlFor={newSourceNameId}
                className="block text-sm font-medium"
              >
                Source name
              </label>
              <input
                id={newSourceNameId}
                type="text"
                required
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label
                htmlFor={newSourceUrlId}
                className="block text-sm font-medium"
              >
                URL (optional)
              </label>
              <input
                id={newSourceUrlId}
                type="text"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={newSourceTypeId}
                  className="block text-sm font-medium"
                >
                  Source type
                </label>
                <select
                  id={newSourceTypeId}
                  value={newSourceType}
                  onChange={(e) =>
                    setNewSourceType(e.target.value as SourceType)
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor={newSourceAccessedAtId}
                  className="block text-sm font-medium"
                >
                  Accessed on
                </label>
                <input
                  id={newSourceAccessedAtId}
                  type="date"
                  required
                  value={newSourceAccessedAt}
                  onChange={(e) => setNewSourceAccessedAt(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <span className="block text-sm font-medium">Tags (optional)</span>
        <div className="mt-1 flex flex-wrap gap-3">
          {state.tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={tagIds.includes(tag.id)}
                onChange={() => toggleTag(tag.id)}
              />
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.label}
            </label>
          ))}
        </div>

        {showNewTag ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label htmlFor={newTagLabelId} className="sr-only">
              New tag label
            </label>
            <input
              id={newTagLabelId}
              type="text"
              maxLength={24}
              value={newTagLabel}
              onChange={(e) => setNewTagLabel(e.target.value)}
              placeholder="Tag label"
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <div className="flex gap-1">
              {TAG_COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Use color ${color}`}
                  aria-pressed={newTagColor === color}
                  onClick={() => setNewTagColor(color)}
                  className={`h-5 w-5 rounded-full border-2 ${
                    newTagColor === color
                      ? "border-slate-900"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              disabled={newTagLabel.trim().length === 0}
              className="rounded bg-slate-900 px-2 py-1 text-sm text-white disabled:bg-slate-300"
            >
              Add tag
            </button>
            <button
              type="button"
              onClick={() => setShowNewTag(false)}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewTag(true)}
            className="mt-2 text-sm font-medium text-slate-700 underline"
          >
            + New tag
          </button>
        )}
      </div>

      <div>
        <label htmlFor={notesId} className="block text-sm font-medium">
          Analyst notes (optional)
        </label>
        <textarea
          id={notesId}
          maxLength={2000}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!canSave}
          className="rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {initial ? "Save changes" : "Add observation"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-slate-300 px-4 py-2"
        >
          Cancel
        </button>
        {!canSave && (
          <p className="text-sm text-slate-600">
            {trimmedValue.length === 0
              ? "Enter a value for this observation."
              : "Enter a name for the new source."}
          </p>
        )}
      </div>
    </form>
  );
}
