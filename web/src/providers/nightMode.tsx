"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

const NIGHT_MODE_STORAGE_KEY = "9lives-shortterm-night-mode";
const nightModeListeners = new Set<() => void>();
let fallbackNightModePreference = true;

type NightModeContextValue = {
  isNightMode: boolean;
  toggleNightMode: () => void;
};

const NightModeContext = createContext<NightModeContextValue | null>(null);

function getNightModePreference() {
  try {
    const savedPreference = window.localStorage.getItem(NIGHT_MODE_STORAGE_KEY);
    fallbackNightModePreference =
      savedPreference === null ? true : savedPreference === "true";
    return fallbackNightModePreference;
  } catch {
    return fallbackNightModePreference;
  }
}

function subscribeToNightMode(listener: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === NIGHT_MODE_STORAGE_KEY) listener();
  };

  nightModeListeners.add(listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    nightModeListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function applyNightMode(enabled: boolean) {
  document.documentElement.dataset.theme = enabled ? "night" : "light";
}

export default function NightModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isNightMode = useSyncExternalStore(
    subscribeToNightMode,
    getNightModePreference,
    () => true,
  );

  useEffect(() => {
    applyNightMode(isNightMode);
  }, [isNightMode]);

  const toggleNightMode = useCallback(() => {
    const nextValue = !getNightModePreference();
    fallbackNightModePreference = nextValue;

    try {
      window.localStorage.setItem(NIGHT_MODE_STORAGE_KEY, String(nextValue));
    } catch {
      // Keep the in-memory preference when local storage is unavailable.
    }

    applyNightMode(nextValue);
    nightModeListeners.forEach((listener) => listener());
  }, []);

  const value = useMemo(
    () => ({ isNightMode, toggleNightMode }),
    [isNightMode, toggleNightMode],
  );

  return (
    <NightModeContext.Provider value={value}>
      {children}
    </NightModeContext.Provider>
  );
}

export function useNightMode() {
  const context = useContext(NightModeContext);

  if (!context) {
    throw new Error("useNightMode must be used within NightModeProvider");
  }

  return context;
}
