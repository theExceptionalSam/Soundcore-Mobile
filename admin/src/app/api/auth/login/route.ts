import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : "";
    if (!password) {
      return NextResponse.json({ ok: false, error: "Password required" }, { status: 400 });
    }
    const ok = await login(password);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
