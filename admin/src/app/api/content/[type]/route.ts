import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { readJSON, writeJSON } from "@/lib/github";

export const runtime = "nodejs";

/** Maps a content type slug → repo file path. */
const PATHS: Record<string, string> = {
  rates:        "data/rates.json",
  services:    "data/services.json",
  work:         "data/work.json",
  testimonials: "data/testimonials.json",
  faqs:         "data/faqs.json",
  about:        "data/about.json",
  site:         "data/site.json",
  faq_meta:     "data/faq_meta.json",
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  const { type } = await ctx.params;
  const path = PATHS[type];
  if (!path) {
    return NextResponse.json({ ok: false, error: "Unknown content type" }, { status: 400 });
  }
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }
  try {
    const result = await readJSON(path);
    if (!result) {
      return NextResponse.json({ ok: false, error: "File not found in repo" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: result.data, sha: result.sha });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  const { type } = await ctx.params;
  const path = PATHS[type];
  if (!path) {
    return NextResponse.json({ ok: false, error: "Unknown content type" }, { status: 400 });
  }
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || !("data" in body)) {
      return NextResponse.json({ ok: false, error: "Body must be { data, sha, message? }" }, { status: 400 });
    }
    const { data, sha, message } = body as { data: unknown; sha?: string; message?: string };

    // Read current SHA if not provided (to support create-or-update)
    let existingSha = sha;
    if (!existingSha) {
      const existing = await readJSON(path);
      existingSha = existing?.sha;
    }

    const commitMessage = message || `content(${type}): update via admin`;
    const result = await writeJSON(path, data, commitMessage, existingSha);
    return NextResponse.json({ ok: true, sha: result.sha, commitSha: result.commitSha });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
