import { NextResponse } from "next/server";
import { isAuthenticated, isConfigured } from "@/lib/auth";
import { getMainSha } from "@/lib/github";

export const runtime = "nodejs";

/** Diagnostics endpoint — used by the admin UI to show the operator
 *  whether their env vars are wired up correctly. */
export async function GET() {
  return NextResponse.json({
    auth_configured: isConfigured(),
    github_configured: Boolean(process.env.GITHUB_TOKEN),
    repo: `${process.env.GITHUB_OWNER || "theExceptionalSam"}/${process.env.GITHUB_REPO || "Soundcore-Mobile"}`,
    authenticated: await isAuthenticated(),
    main_sha: process.env.GITHUB_TOKEN ? await getMainSha().catch(() => "error") : "no-token",
  });
}
