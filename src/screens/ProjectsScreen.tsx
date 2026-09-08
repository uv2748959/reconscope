import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../state/AppContext";
import { buildDemoBundle, DEMO_COMPANY_ALIAS } from "../seedData";
import type { Project } from "../types";

function AuthorizationBadge({ authorized }: { authorized: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        authorized
          ? "bg-green-100 text-green-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {authorized ? "Authorized" : "Incomplete"}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { state, dispatch } = useApp();
  const scope = state.scopes.find((s) => s.projectId === project.id);
  const authorized = scope?.authorizationConfirmed === true;

  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(project.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const renameId = useId();

  function saveRename() {
    const trimmed = draftName.trim();
    if (trimmed.length === 0 || trimmed.length > 80) return;
    dispatch({
      type: "RENAME_PROJECT",
      id: project.id,
      name: trimmed,
      updatedAt: new Date().toISOString(),
    });
    setIsRenaming(false);
  }

  function cancelRename() {
    setDraftName(project.name);
    setIsRenaming(false);
  }

  return (
    <li className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <label htmlFor={renameId} className="sr-only">
                Project name
              </label>
              <input
                id={renameId}
                type="text"
                value={draftName}
                maxLength={80}
                autoFocus
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRename();
                  if (e.key === "Escape") cancelRename();
                }}
                className="rounded border border-slate-300 px-2 py-1"
              />
              <button
                type="button"
                onClick={saveRename}
                className="rounded bg-slate-900 px-2 py-1 text-sm text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelRename}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h2 className="text-lg font-semibold">{project.name}</h2>
          )}
          <p className="text-sm text-slate-600">{project.companyAlias}</p>
        </div>
        <AuthorizationBadge authorized={authorized} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          to={`/projects/${project.id}`}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Open
        </Link>

        {!isRenaming && (
          <button
            type="button"
            onClick={() => setIsRenaming(true)}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm"
          >
            Rename
          </button>
        )}

        {confirmingDelete ? (
          <span className="flex items-center gap-2 text-sm">
            Delete this project and its scope?
            <button
              type="button"
              onClick={() => dispatch({ type: "DELETE_PROJECT", id: project.id })}
              className="rounded bg-red-700 px-3 py-1.5 font-medium text-white"
            >
              Confirm delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded border border-slate-300 px-3 py-1.5"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}

function DemoDataButton({ existingDemoId }: { existingDemoId: string | null }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [confirmingReset, setConfirmingReset] = useState(false);

  function loadFreshDemo() {
    const bundle = buildDemoBundle();
    dispatch({ type: "LOAD_DEMO_DATA", bundle });
    navigate(`/projects/${bundle.project.id}`);
  }

  function resetDemo() {
    if (existingDemoId) {
      dispatch({ type: "DELETE_PROJECT", id: existingDemoId });
    }
    loadFreshDemo();
    setConfirmingReset(false);
  }

  if (!existingDemoId) {
    return (
      <button
        type="button"
        onClick={loadFreshDemo}
        className="rounded border border-slate-300 px-3 py-2 text-sm font-medium"
      >
        Load fictional demo
      </button>
    );
  }

  if (confirmingReset) {
    return (
      <span className="flex flex-wrap items-center gap-2 text-sm">
        Discard demo changes and reload fresh sample data?
        <button
          type="button"
          onClick={resetDemo}
          className="rounded bg-red-700 px-3 py-1.5 font-medium text-white"
        >
          Confirm reset
        </button>
        <button
          type="button"
          onClick={() => setConfirmingReset(false)}
          className="rounded border border-slate-300 px-3 py-1.5"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmingReset(true)}
      className="rounded border border-slate-300 px-3 py-2 text-sm font-medium"
    >
      Reset demo data
    </button>
  );
}

export default function ProjectsScreen() {
  const { state } = useApp();
  const existingDemoId =
    state.projects.find((p) => p.companyAlias === DEMO_COMPANY_ALIAS)?.id ??
    null;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="flex flex-wrap items-center gap-3">
          <DemoDataButton existingDemoId={existingDemoId} />
          <Link
            to="/projects/new"
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            New Project
          </Link>
        </div>
      </div>

      {state.projects.length === 0 ? (
        <div className="mt-6 rounded border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-600">
            No projects yet. Create a project to record scope and
            authorization before collecting evidence, or load the fictional
            demo to explore the app with sample data.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/projects/new"
              className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            >
              New Project
            </Link>
            <DemoDataButton existingDemoId={existingDemoId} />
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {state.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ul>
      )}
    </section>
  );
}
