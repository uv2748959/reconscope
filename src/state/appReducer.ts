import type { StorageData } from "../storage";
import type { Project, Scope } from "../types";

export type AppAction =
  | { type: "CREATE_PROJECT"; project: Project; scope: Scope }
  | { type: "RENAME_PROJECT"; id: string; name: string; updatedAt: string }
  | { type: "DELETE_PROJECT"; id: string };

export function appReducer(state: StorageData, action: AppAction): StorageData {
  switch (action.type) {
    case "CREATE_PROJECT":
      return {
        ...state,
        projects: [...state.projects, action.project],
        scopes: [...state.scopes, action.scope],
      };

    case "RENAME_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.id
            ? { ...project, name: action.name, updatedAt: action.updatedAt }
            : project,
        ),
      };

    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.id),
        scopes: state.scopes.filter((scope) => scope.projectId !== action.id),
      };

    default:
      return state;
  }
}
