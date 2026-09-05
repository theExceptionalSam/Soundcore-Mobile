"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";

type Diag = {
  auth_configured: boolean;
  github_configured: boolean;
  repo: string;
  authenticated: boolean;
  main_sha: string;
};

export function Diagnostics() {
  const [data, setData] = useState<Diag | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/diagnostics", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setData(j))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="text-red-400 py-4">Error: {error}</div>;
  if (!data) return <div className="flex items-center justify-center py-10 text-zinc-500"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Running checks…</div>;

  const rows: Array<[string, boolean, string]> = [
    ["ADMIN_PASSWORD env var set", data.auth_configured, "Set this in your Vercel project's Environment Variables. Without it, nobody can log in."],
    ["GITHUB_TOKEN env var set", data.github_configured, "A fine-grained PAT with 'Contents: Read and write' on the Soundcore-Mobile repo. Without it, edits won't save."],
    ["Authenticated as admin", data.authenticated, "You're signed in. If this is false, log out and back in."],
    ["GitHub repo reachable", data.main_sha !== "error" && data.main_sha !== "no-token", `Main branch HEAD: ${data.main_sha === "error" ? "could not fetch — check token permissions" : data.main_sha === "no-token" ? "no token configured" : data.main_sha.slice(0, 7)}`],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light text-zinc-100">Diagnostics</h2>
        <p className="text-sm text-zinc-500 mt-1">Live checks against the environment. All should be green for the admin to fully work.</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5">
          <div className="text-xs text-zinc-500 mb-3">Target repo: <code className="text-zinc-300">{data.repo}</code></div>
          <div className="space-y-3">
            {rows.map(([label, ok, hint], i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                  {ok ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-red-400" />}
                </div>
                <div>
                  <div className="text-sm text-zinc-200">{label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{hint}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5">
          <h3 className="text-sm font-medium text-amber-500 mb-3">How this works</h3>
          <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
            <li>You make edits in this admin and click Save.</li>
            <li>The admin calls the GitHub API to commit the JSON file to <code className="text-zinc-300">/data/&lt;type&gt;.json</code> in the main repo.</li>
            <li>Vercel auto-detects the commit and redeploys <code className="text-zinc-300">soundcorestudio.ng</code> (~30 seconds).</li>
            <li>The live site fetches the new JSON on the next page load.</li>
          </ol>
          <p className="text-xs text-zinc-500 mt-4">If something breaks, every page has static fallback content baked in — the site won't go down even if a JSON file is malformed.</p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5">
          <h3 className="text-sm font-medium text-amber-500 mb-3">Setup checklist (one-time)</h3>
          <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
            <li>Create a fine-grained GitHub PAT with <strong>Contents: Read and write</strong> + <strong>Metadata: Read</strong> on the Soundcore-Mobile repo.</li>
            <li>In your Vercel project for this admin, add environment variables: <code className="text-zinc-300">ADMIN_PASSWORD</code>, <code className="text-zinc-300">ADMIN_JWT_SECRET</code>, <code className="text-zinc-300">GITHUB_TOKEN</code>, <code className="text-zinc-300">GITHUB_OWNER</code> (= theExceptionalSam), <code className="text-zinc-300">GITHUB_REPO</code> (= Soundcore-Mobile).</li>
            <li>Redeploy. All four rows above should turn green.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
