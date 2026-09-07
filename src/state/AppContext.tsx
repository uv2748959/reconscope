import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { appReducer, type AppAction } from "./appReducer";
import {
  createEmptyData,
  loadData,
  saveData,
  StorageError,
  type StorageData,
} from "../storage";

interface AppContextValue {
  state: StorageData;
  dispatch: Dispatch<AppAction>;
  storageError: string | null;
  dismissStorageError: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function readInitialState(): { data: StorageData; loadError: string | null } {
  try {
    return { data: loadData(), loadError: null };
  } catch (err) {
    if (err instanceof StorageError) {
      return { data: createEmptyData(), loadError: err.message };
    }
    throw err;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [{ data: initialData, loadError }] = useState(readInitialState);
  const [state, dispatch] = useReducer(appReducer, initialData);
  const [storageError, setStorageError] = useState<string | null>(loadError);

  useEffect(() => {
    try {
      saveData(state);
      setStorageError(null);
    } catch (err) {
      if (err instanceof StorageError) {
        setStorageError(err.message);
      } else {
        throw err;
      }
    }
  }, [state]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      storageError,
      dismissStorageError: () => setStorageError(null),
    }),
    [state, storageError],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
