import { useApp } from "../state/AppContext";
import { isInScope } from "../scopeCheck";
import { formatDateTime } from "../utils/dateInput";
import { categoryLabel, OBS_STATUSES } from "../constants";
import ObservationForm from "./ObservationForm";
import type { ObsStatus, Observation, Scope } from "../types";

interface ObservationCardProps {
  observation: Observation;
  scope: Scope | undefined;
  projectId: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaved: () => void;
  confirmingDelete: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

const CONFIDENCE_BADGE_CLASSES: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-indigo-100 text-indigo-800",
};

export default function ObservationCard({
  observation,
  scope,
  projectId,
  isEditing,
  onEdit,
  onCancelEdit,
  onSaved,
  confirmingDelete,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: ObservationCardProps) {
  const { state, dispatch } = useApp();

  if (isEditing) {
    return (
      <li>
        <ObservationForm
          projectId={projectId}
          initial={observation}
          onCancel={onCancelEdit}
          onSaved={onSaved}
        />
      </li>
    );
  }

  const source = state.sources.find((s) => s.id === observation.sourceId);
  const tags = state.tags.filter((t) => observation.tagIds.includes(t.id));
  const scopeStatus = scope
    ? isInScope(observation.value, scope)
    : "undetermined";

  function handleStatusChange(next: ObsStatus) {
    dispatch({
      type: "UPDATE_OBSERVATION",
      observation: { ...observation, status: next },
    });
  }

  return (
    <li className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {categoryLabel(observation.category)}
          </span>
          <p className="whitespace-pre-wrap text-base font-medium">
            {observation.value}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {scopeStatus === "out_of_scope" && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
              ⚠ Out of scope
            </span>
          )}
          {scopeStatus === "in_scope" && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              In scope
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CONFIDENCE_BADGE_CLASSES[observation.confidence]}`}
          >
            {observation.confidence} confidence
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="font-medium">Status</span>
          <select
            value={observation.status}
            onChange={(e) =>
              handleStatusChange(e.target.value as ObsStatus)
            }
            className="rounded border border-slate-300 px-2 py-1"
          >
            {OBS_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <span className="text-slate-600">
          Collected {formatDateTime(observation.collectedAt)}
        </span>
        <span className="text-slate-600">Method: {observation.method}</span>
      </div>

      {(source || tags.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
          {source && (
            <span>
              Source:{" "}
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {source.name}
                </a>
              ) : (
                source.name
              )}
            </span>
          )}
          {tags.map((tag) => (
            <span key={tag.id} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {observation.notes && (
        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
          {observation.notes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm"
        >
          Edit
        </button>

        {confirmingDelete ? (
          <span className="flex items-center gap-2 text-sm">
            Delete this observation?
            <button
              type="button"
              onClick={onConfirmDelete}
              className="rounded bg-red-700 px-3 py-1.5 font-medium text-white"
            >
              Confirm delete
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="rounded border border-slate-300 px-3 py-1.5"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={onRequestDelete}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
