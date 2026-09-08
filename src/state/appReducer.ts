import type { StorageData } from "../storage";
import type { DemoBundle } from "../seedData";
import type { Asset, Observation, Project, Scope, Source, Tag } from "../types";

export type AppAction =
  | { type: "CREATE_PROJECT"; project: Project; scope: Scope }
  | { type: "RENAME_PROJECT"; id: string; name: string; updatedAt: string }
  | { type: "DELETE_PROJECT"; id: string }
  | { type: "CREATE_OBSERVATION"; observation: Observation }
  | { type: "UPDATE_OBSERVATION"; observation: Observation }
  | { type: "DELETE_OBSERVATION"; id: string }
  | { type: "CREATE_SOURCE"; source: Source }
  | { type: "CREATE_TAG"; tag: Tag }
  | { type: "CREATE_ASSET"; asset: Asset }
  | { type: "UPDATE_ASSET"; asset: Asset }
  | { type: "LOAD_DEMO_DATA"; bundle: DemoBundle }
  | { type: "IMPORT_DATA"; data: StorageData };

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
        observations: state.observations.filter(
          (observation) => observation.projectId !== action.id,
        ),
        assets: state.assets.filter((asset) => asset.projectId !== action.id),
      };

    case "CREATE_OBSERVATION":
      return {
        ...state,
        observations: [...state.observations, action.observation],
      };

    case "UPDATE_OBSERVATION":
      return {
        ...state,
        observations: state.observations.map((observation) =>
          observation.id === action.observation.id
            ? action.observation
            : observation,
        ),
      };

    case "DELETE_OBSERVATION":
      return {
        ...state,
        observations: state.observations.filter(
          (observation) => observation.id !== action.id,
        ),
      };

    case "CREATE_SOURCE":
      return {
        ...state,
        sources: [...state.sources, action.source],
      };

    case "CREATE_TAG":
      return {
        ...state,
        tags: [...state.tags, action.tag],
      };

    case "CREATE_ASSET":
      return {
        ...state,
        assets: [...state.assets, action.asset],
      };

    case "UPDATE_ASSET":
      return {
        ...state,
        assets: state.assets.map((asset) =>
          asset.id === action.asset.id ? action.asset : asset,
        ),
      };

    case "LOAD_DEMO_DATA":
      return {
        ...state,
        projects: [...state.projects, action.bundle.project],
        scopes: [...state.scopes, action.bundle.scope],
        assets: [...state.assets, ...action.bundle.assets],
        observations: [...state.observations, ...action.bundle.observations],
        sources: [...state.sources, ...action.bundle.sources],
        tags: [...state.tags, ...action.bundle.tags],
      };

    case "IMPORT_DATA":
      return {
        ...state,
        projects: [...state.projects, ...action.data.projects],
        scopes: [...state.scopes, ...action.data.scopes],
        assets: [...state.assets, ...action.data.assets],
        observations: [...state.observations, ...action.data.observations],
        sources: [...state.sources, ...action.data.sources],
        tags: [...state.tags, ...action.data.tags],
        reports: [...state.reports, ...action.data.reports],
      };

    default:
      return state;
  }
}
