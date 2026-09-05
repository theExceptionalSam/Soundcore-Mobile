"use client";

import { useEffect, useState } from "react";

type Status = {
  authenticated: boolean;
  configured: boolean;
};

/** Hook: poll auth status. Returns null while loading. */
export function useAuth() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const r = await fetch("/api/auth/status", { cache: "no-store" });
      const j = await r.json();
      setStatus({ authenticated: j.authenticated, configured: j.configured });
    } catch {
      setStatus({ authenticated: false, configured: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);
  return { status, loading, refresh };
}
