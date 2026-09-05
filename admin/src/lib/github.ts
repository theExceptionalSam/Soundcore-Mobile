/**
 * GitHub API wrapper — reads and writes files in the Soundcore-Mobile repo.
 *
 * Auth: a fine-grained PAT stored in env var GITHUB_TOKEN (must have
 * "Contents: Read and write" + "Metadata: Read" on the target repo).
 *
 * Repo is configured via env: GITHUB_OWNER + GITHUB_REPO.
 * Default branch: main.
 */

const API = "https://api.github.com";

type Env = {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
};

function getEnv(): Env {
  const t = process.env.GITHUB_TOKEN;
  const o = process.env.GITHUB_OWNER || "theExceptionalSam";
  const r = process.env.GITHUB_REPO || "Soundcore-Mobile";
  if (!t) {
    throw new Error("GITHUB_TOKEN env var is not set. The admin cannot read or write content without it.");
  }
  return { GITHUB_TOKEN: t, GITHUB_OWNER: o, GITHUB_REPO: r };
}

function authHeader(): Record<string, string> {
  const env = getEnv();
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export type GHFile = {
  path: string;
  content: string; // decoded
  sha: string;     // needed to update existing file
};

/** Read a file from the repo, returning its decoded content + current SHA. */
export async function readFile(path: string): Promise<GHFile | null> {
  const env = getEnv();
  const url = `${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}?ref=main`;
  const res = await fetch(url, { headers: authHeader(), cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub read ${path} failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  // GitHub returns content as base64. Decode it.
  const buf = Buffer.from(json.content, "base64");
  return {
    path,
    content: buf.toString("utf-8"),
    sha: json.sha,
  };
}

/** Create or update a file in the repo. */
export async function writeFile(
  path: string,
  content: string,
  commitMessage: string,
  existingSha?: string
): Promise<{ sha: string; commitSha: string }> {
  const env = getEnv();
  const url = `${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;
  const body: Record<string, unknown> = {
    message: commitMessage,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch: "main",
  };
  if (existingSha) body.sha = existingSha;

  const res = await fetch(url, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub write ${path} failed: ${res.status} ${errText}`);
  }
  const json = await res.json();
  return { sha: json.content.sha, commitSha: json.commit.sha };
}

/** Read a JSON file from the repo, parsed. */
export async function readJSON<T = unknown>(path: string): Promise<{ data: T; sha: string } | null> {
  const file = await readFile(path);
  if (!file) return null;
  return { data: JSON.parse(file.content) as T, sha: file.sha };
}

/** Write a JSON file (pretty-printed) to the repo. */
export async function writeJSON<T = unknown>(
  path: string,
  data: T,
  commitMessage: string,
  existingSha?: string
): Promise<{ sha: string; commitSha: string }> {
  const content = JSON.stringify(data, null, 2) + "\n";
  return writeFile(path, content, commitMessage, existingSha);
}

/** List files in a directory (single level). */
export async function listDir(path: string): Promise<Array<{ name: string; path: string; type: string }>> {
  const env = getEnv();
  const url = `${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}?ref=main`;
  const res = await fetch(url, { headers: authHeader(), cache: "no-store" });
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`GitHub list ${path} failed: ${res.status}`);
  }
  const json = await res.json();
  if (!Array.isArray(json)) return [];
  return json.map((f: { name: string; path: string; type: string }) => ({
    name: f.name,
    path: f.path,
    type: f.type,
  }));
}

/** Get the repo's main branch HEAD SHA — useful for diagnostics. */
export async function getMainSha(): Promise<string> {
  const env = getEnv();
  const url = `${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/branches/main`;
  const res = await fetch(url, { headers: authHeader(), cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub branch lookup failed: ${res.status}`);
  const json = await res.json();
  return json.commit.sha;
}
