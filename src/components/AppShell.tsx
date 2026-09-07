import { NavLink, Outlet, useParams } from "react-router-dom";
import { useApp } from "../state/AppContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm font-medium ${
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-700 hover:bg-slate-200"
  }`;

export default function AppShell() {
  const { storageError, dismissStorageError } = useApp();
  const { id: projectId } = useParams<{ id?: string }>();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <span className="text-lg font-semibold">ReconScope</span>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Projects
            </NavLink>
            <NavLink to="/methodology" className={navLinkClass}>
              Safety &amp; Methodology
            </NavLink>
          </nav>
        </div>
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900">
          Authorized targets only
        </div>
      </header>

      {projectId && (
        <div className="border-b border-slate-200 bg-slate-100">
          <nav className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 py-2">
            <NavLink to={`/projects/${projectId}`} end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink
              to={`/projects/${projectId}/assets`}
              className={navLinkClass}
            >
              Assets
            </NavLink>
            <NavLink
              to={`/projects/${projectId}/evidence`}
              className={navLinkClass}
            >
              Evidence Log
            </NavLink>
            <NavLink
              to={`/projects/${projectId}/report`}
              className={navLinkClass}
            >
              Report
            </NavLink>
          </nav>
        </div>
      )}

      {storageError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 bg-red-100 px-4 py-2 text-sm font-medium text-red-900"
        >
          <span>{storageError}</span>
          <button
            type="button"
            onClick={dismissStorageError}
            className="rounded border border-red-300 px-2 py-1 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
