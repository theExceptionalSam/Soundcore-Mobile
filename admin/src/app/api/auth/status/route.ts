import { NextResponse } from "next/server";
import { isAuthenticated, isConfigured } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    authenticated: await isAuthenticated(),
    configured: isConfigured(),
  });
}
