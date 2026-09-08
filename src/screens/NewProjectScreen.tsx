import { useId, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../state/AppContext";
import { parseList } from "../utils/parseList";
import type { Project, Scope } from "../types";

export default function NewProjectScreen() {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [companyAlias, setCompanyAlias] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rootDomains, setRootDomains] = useState("");
  const [subdomains, setSubdomains] = useState("");
  const [ipRanges, setIpRanges] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [authorizationNote, setAuthorizationNote] = useState("");
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);

  const nameId = useId();
  const aliasId = useId();
  const descriptionId = useId();
  const startId = useId();
  const endId = useId();
  const rootId = useId();
  const subId = useId();
  const ipId = useId();
  const exclusionsId = useId();
  const noteId = useId();
  const ackId = useId();

  const trimmedName = name.trim();
  const trimmedAlias = companyAlias.trim();
  const parsedRootDomains = parseList(rootDomains).map((d) => d.toLowerCase());

  const hasRequiredFields =
    trimmedName.length > 0 &&
    trimmedName.length <= 80 &&
    trimmedAlias.length > 0 &&
    parsedRootDomains.length > 0;
  const canSave = hasRequiredFields && authorizationConfirmed;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    const now = new Date().toISOString();
    const projectId = crypto.randomUUID();

    const project: Project = {
      id: projectId,
      name: trimmedName,
      companyAlias: trimmedAlias,
      description: description.trim().slice(0, 500),
      startDate: startDate || null,
      endDate: endDate || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const scope: Scope = {
      projectId,
      rootDomains: parsedRootDomains,
      subdomains: parseList(subdomains).map((d) => d.toLowerCase()),
      ipRanges: parseList(ipRanges),
      exclusions: parseList(exclusions).map((e) => e.toLowerCase()),
      authorizationConfirmed: true,
      authorizationNote: authorizationNote.trim(),
      acknowledgedAt: now,
    };

    dispatch({ type: "CREATE_PROJECT", project, scope });
    navigate(`/projects/${projectId}`);
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">New Project / Scope</h1>
      <p className="mt-2 text-slate-600">
        Record the authorized target and the boundaries of this
        reconnaissance exercise before any evidence is collected.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-lg font-medium">Project</legend>

          <div>
            <label htmlFor={nameId} className="block text-sm font-medium">
              Project name
            </label>
            <input
              id={nameId}
              type="text"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor={aliasId} className="block text-sm font-medium">
              Company alias
            </label>
            <p className="text-sm text-slate-500">
              A fictional name only. Do not name a real company.
            </p>
            <input
              id={aliasId}
              type="text"
              required
              value={companyAlias}
              onChange={(e) => setCompanyAlias(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor={descriptionId}
              className="block text-sm font-medium"
            >
              Description (optional)
            </label>
            <textarea
              id={descriptionId}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor={startId} className="block text-sm font-medium">
                Start date (optional)
              </label>
              <input
                id={startId}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <label htmlFor={endId} className="block text-sm font-medium">
                End date (optional)
              </label>
              <input
                id={endId}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-medium">Scope</legend>

          <div>
            <label htmlFor={rootId} className="block text-sm font-medium">
              Authorized root domain(s)
            </label>
            <p className="text-sm text-slate-500">
              One per line. Use a reserved example domain, e.g.
              northstar-bicycle.example.
            </p>
            <textarea
              id={rootId}
              required
              rows={2}
              value={rootDomains}
              onChange={(e) => setRootDomains(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor={subId} className="block text-sm font-medium">
              Allowed subdomains (optional)
            </label>
            <textarea
              id={subId}
              rows={2}
              value={subdomains}
              onChange={(e) => setSubdomains(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor={ipId} className="block text-sm font-medium">
              Allowed IP ranges (optional)
            </label>
            <p className="text-sm text-slate-500">
              CIDR notation, one per line, e.g. 192.0.2.0/24.
            </p>
            <textarea
              id={ipId}
              rows={2}
              value={ipRanges}
              onChange={(e) => setIpRanges(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>

          <div>
            <label
              htmlFor={exclusionsId}
              className="block text-sm font-medium"
            >
              Exclusions (optional)
            </label>
            <p className="text-sm text-slate-500">
              Domains or CIDRs excluded from an otherwise allowed range.
            </p>
            <textarea
              id={exclusionsId}
              rows={2}
              value={exclusions}
              onChange={(e) => setExclusions(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded border border-amber-300 bg-amber-50 p-4">
          <legend className="text-lg font-medium">Authorization</legend>

          <div>
            <label htmlFor={noteId} className="block text-sm font-medium">
              Authorization note (optional)
            </label>
            <p className="text-sm text-slate-500">
              E.g. a reference to the classroom authorization.
            </p>
            <textarea
              id={noteId}
              rows={2}
              value={authorizationNote}
              onChange={(e) => setAuthorizationNote(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              id={ackId}
              type="checkbox"
              checked={authorizationConfirmed}
              onChange={(e) => setAuthorizationConfirmed(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor={ackId} className="text-sm">
              I confirm that only the authorized targets listed above will be
              used, and that this reconnaissance is explicitly permitted.
            </label>
          </div>
        </fieldset>

        <div>
          <button
            type="submit"
            disabled={!canSave}
            className="rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Save and activate project
          </button>
          {!canSave && (
            <p className="mt-2 text-sm text-slate-600" role="status">
              {!hasRequiredFields
                ? "Enter a project name, company alias, and at least one authorized root domain."
                : "You must confirm authorization before this project can be activated."}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
