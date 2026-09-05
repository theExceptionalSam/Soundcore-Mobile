"use client";

import { useCallback, useEffect, useState } from "react";

type State<T> = {
  data: T | null;
  sha: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  dirty: boolean;
};

/**
 * Loads content of a given type from /api/content/[type], tracks the SHA
 * for safe concurrent updates, and exposes a save() that PUTs back.
 *
 * Usage:
 *   const { data, setData, save, loading, saving, dirty } = useContent<Rate[]>("rates");
 */
export function useContent<T>(type: string) {
  const [state, setState] = useState<State<T>>({
    data: null,
    sha: null,
    loading: true,
    saving: false,
    error: null,
    dirty: false,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await fetch(`/api/content/${type}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setState((s) => ({ ...s, loading: false, error: j.error || "Failed to load" }));
        return;
      }
      setState({
        data: j.data as T,
        sha: j.sha,
        loading: false,
        saving: false,
        error: null,
        dirty: false,
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : "Network error",
      }));
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const setData = useCallback((updater: T | ((prev: T | null) => T)) => {
    setState((s) => ({
      ...s,
      data: typeof updater === "function" ? (updater as (p: T | null) => T)(s.data) : updater,
      dirty: true,
    }));
  }, []);

  const save = useCallback(async (message?: string) => {
    if (!state.data) return;
    setState((s) => ({ ...s, saving: true, error: null }));
    try {
      const r = await fetch(`/api/content/${type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: state.data, sha: state.sha, message }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        // 409 conflict = someone else edited in the meantime
        const errMsg = j.error || "Save failed";
        setState((s) => ({ ...s, saving: false, error: errMsg }));
        return { ok: false, error: errMsg };
      }
      setState((s) => ({ ...s, sha: j.sha, saving: false, dirty: false }));
      return { ok: true };
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Network error";
      setState((s) => ({ ...s, saving: false, error: errMsg }));
      return { ok: false, error: errMsg };
    }
  }, [type, state.data, state.sha]);

  return {
    data: state.data,
    setData,
    loading: state.loading,
    saving: state.saving,
    error: state.error,
    dirty: state.dirty,
    save,
    reload: load,
  };
}
