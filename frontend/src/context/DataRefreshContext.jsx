/**
 * DataRefreshContext
 *
 * Provides a `triggerRefresh` function that any component can call
 * to signal that income/expense data has changed.
 * Home.jsx listens and re-fetches automatically.
 */

import { createContext, useContext, useCallback, useRef } from "react";

const DataRefreshContext = createContext(null);

export function DataRefreshProvider({ children }) {
  // Store a set of listener callbacks
  const listeners = useRef(new Set());

  const subscribe = useCallback((fn) => {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn); // returns unsubscribe
  }, []);

  const triggerRefresh = useCallback(() => {
    listeners.current.forEach((fn) => fn());
  }, []);

  return (
    <DataRefreshContext.Provider value={{ subscribe, triggerRefresh }}>
      {children}
    </DataRefreshContext.Provider>
  );
}

/** Call this from any component to notify that data changed */
export function useTriggerRefresh() {
  const ctx = useContext(DataRefreshContext);
  if (!ctx) throw new Error("useTriggerRefresh must be inside DataRefreshProvider");
  return ctx.triggerRefresh;
}

/** Call this from Home.jsx to listen for refresh events */
export function useOnDataRefresh(callback) {
  const ctx = useContext(DataRefreshContext);
  if (!ctx) return;
  // Subscribe once on mount, clean up on unmount
  // (caller should wrap callback in useCallback or useRef to avoid re-subscribing)
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // We deliberately do NOT put subscribe in a useEffect here —
  // instead we expose subscribe so the caller can do it properly.
  return ctx.subscribe;
}
