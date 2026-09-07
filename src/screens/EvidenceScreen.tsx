import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../state/AppContext";
import { CONFIDENCE_LEVELS, OBSERVATION_CATEGORIES, OBS_STATUSES, categoryLabel } from "../constants";
import ObservationForm from "../components/ObservationForm";
import ObservationCard from "../components/ObservationCard";
import type { Confidence, ObsStatus, ObservationCategory } from "../types";

type CategoryFilter = "all" | ObservationCategory;
type ConfidenceFilter = "all" | Confidence;
type StatusFilter = "all" | ObsStatus;

type FormMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; id: string };

function inDateRange(collectedAt: string, from: string, to: string): boolean {
  const collected = new Date(collectedAt).getTime();
  if (from && collected < new Date(`${from}T00:00:00.000Z`).getTime()) {
    return false;
  }
  if (to && collected > new Date(`${to}T23:59:59.999Z`).getTime()) {
    return false;
  }
  return true;
}

export default function EvidenceScreen() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useApp();

  const [formMode, setFormMode] = useState<FormMode>({ type: "closed" });
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [confidenceFilter, setConfidenceFilter] =
    useState<ConfidenceFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const project = state.projects.find((p) => p.id === id);
  const scope = state.scopes.find((s) => s.projectId === id);

  const projectObservations = useMemo(
    () => state.observations.filter((o) => o.projectId === id),
    [state.observations, id],
  );

  const tagsInProject = useMemo(() => {
    const usedIds = new Set(projectObservations.flatMap((o) => o.tagIds));
    return state.tags.filter((t) => usedIds.has(t.id));
  }, [projectObservations, state.tags]);

  const filtered = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    return projectObservations.filter((o) => {
      if (categoryFilter !== "all" && o.category !== categoryFilter) {
        return false;
      }
      if (confidenceFilter !== "all" && o.confidence !== confidenceFilter) {
        return false;
      }
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (tagFilter !== "all" && !o.tagIds.includes(tagFilter)) return false;
      if (!inDateRange(o.collectedAt, dateFrom, dateTo)) return false;
      if (
        needle &&
        !o.value.toLowerCase().includes(needle) &&
        !o.notes.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [
    projectObservations,
    categoryFilter,
    confidenceFilter,
    statusFilter,
    tagFilter,
    dateFrom,
    dateTo,
    searchText,
  ]);

  const hasActiveFilters =
    searchText.trim() !== "" ||
    categoryFilter !== "all" ||
    confidenceFilter !== "all" ||
    statusFilter !== "all" ||
    tagFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  function clearFilters() {
    setSearchText("");
    setCategoryFilter("all");
    setConfidenceFilter("all");
    setStatusFilter("all");
    setTagFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  if (!id || !project) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">Evidence Log</h1>
        <p className="mt-2 text-slate-600">
          Project not found.{" "}
          <Link to="/" className="underline">
            Back to Projects
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          Evidence Log — {project.name}
        </h1>
        {formMode.type === "closed" && (
          <button
            type="button"
            onClick={() => setFormMode({ type: "create" })}
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            Add observation
          </button>
        )}
      </div>

      {formMode.type === "create" && (
        <div className="mt-4">
          <ObservationForm
            projectId={id}
            onCancel={() => setFormMode({ type: "closed" })}
            onSaved={() => setFormMode({ type: "closed" })}
          />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded border border-slate-200 bg-white p-4">
        <div>
          <label
            htmlFor="evidence-search"
            className="block text-sm font-medium"
          >
            Search
          </label>
          <input
            id="evidence-search"
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search value or notes"
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="evidence-category-filter"
            className="block text-sm font-medium"
          >
            Filter by category
          </label>
          <select
            id="evidence-category-filter"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as CategoryFilter)
            }
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          >
            <option value="all">All categories</option>
            {OBSERVATION_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="evidence-confidence-filter"
            className="block text-sm font-medium"
          >
            Filter by confidence
          </label>
          <select
            id="evidence-confidence-filter"
            value={confidenceFilter}
            onChange={(e) =>
              setConfidenceFilter(e.target.value as ConfidenceFilter)
            }
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          >
            <option value="all">All confidence levels</option>
            {CONFIDENCE_LEVELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="evidence-status-filter"
            className="block text-sm font-medium"
          >
            Filter by status
          </label>
          <select
            id="evidence-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          >
            <option value="all">All statuses</option>
            {OBS_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="evidence-tag-filter"
            className="block text-sm font-medium"
          >
            Filter by tag
          </label>
          <select
            id="evidence-tag-filter"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          >
            <option value="all">All tags</option>
            {tagsInProject.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="evidence-date-from"
            className="block text-sm font-medium"
          >
            From
          </label>
          <input
            id="evidence-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="evidence-date-to"
            className="block text-sm font-medium"
          >
            To
          </label>
          <input
            id="evidence-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="mt-1 rounded border border-slate-300 px-3 py-2"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <p className="mt-2 text-sm text-slate-600" role="status">
          Active filters:{" "}
          {[
            searchText.trim() && `search "${searchText.trim()}"`,
            categoryFilter !== "all" &&
              `category ${categoryLabel(categoryFilter)}`,
            confidenceFilter !== "all" && `confidence ${confidenceFilter}`,
            statusFilter !== "all" && `status ${statusFilter}`,
            tagFilter !== "all" &&
              `tag ${
                state.tags.find((t) => t.id === tagFilter)?.label ?? tagFilter
              }`,
            dateFrom && `from ${dateFrom}`,
            dateTo && `to ${dateTo}`,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}

      <p className="mt-4 text-sm text-slate-600">
        Showing {filtered.length} of {projectObservations.length}{" "}
        observations.
      </p>

      {projectObservations.length === 0 ? (
        <div className="mt-4 rounded border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-600">
            No observations yet. Add an observation to start building this
            project's evidence log.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-4 rounded border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-600">
            No observations match the current filters.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {filtered.map((observation) => (
            <ObservationCard
              key={observation.id}
              observation={observation}
              scope={scope}
              projectId={id}
              isEditing={
                formMode.type === "edit" && formMode.id === observation.id
              }
              onEdit={() => setFormMode({ type: "edit", id: observation.id })}
              onCancelEdit={() => setFormMode({ type: "closed" })}
              onSaved={() => setFormMode({ type: "closed" })}
              confirmingDelete={confirmingDeleteId === observation.id}
              onRequestDelete={() => setConfirmingDeleteId(observation.id)}
              onCancelDelete={() => setConfirmingDeleteId(null)}
              onConfirmDelete={() => {
                dispatch({ type: "DELETE_OBSERVATION", id: observation.id });
                setConfirmingDeleteId(null);
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
