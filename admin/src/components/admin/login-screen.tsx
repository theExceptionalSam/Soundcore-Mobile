"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";

export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(j.error || "Login failed");
      } else {
        setPassword("");
        onLoggedIn();
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-light tracking-tight">
            Soundcore Admin
          </CardTitle>
          <p className="text-sm text-zinc-400">
            Enter the admin password to manage your website content.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                autoFocus
                className="bg-zinc-950 border-zinc-700 text-zinc-100"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="bg-red-950 border-red-800 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              disabled={submitting || !password}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…</>
              ) : "Sign in"}
            </Button>
          </form>
          <p className="text-xs text-zinc-500 mt-6 text-center leading-relaxed">
            Forgot the password? It&apos;s set in your Vercel project&apos;s environment variables
            under <code className="text-zinc-400">ADMIN_PASSWORD</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
