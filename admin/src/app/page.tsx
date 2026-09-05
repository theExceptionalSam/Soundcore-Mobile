"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/use-auth";
import { LoginScreen } from "@/components/admin/login-screen";
import { RatesEditor } from "@/components/admin/rates-editor";
import { ServicesEditor } from "@/components/admin/services-editor";
import { WorkEditor } from "@/components/admin/work-editor";
import { TestimonialsEditor } from "@/components/admin/testimonials-editor";
import { FaqsEditor } from "@/components/admin/faqs-editor";
import { AboutEditor } from "@/components/admin/about-editor";
import { SiteEditor } from "@/components/admin/site-editor";
import { Diagnostics } from "@/components/admin/diagnostics";
import { Button } from "@/components/ui/button";
import {
  DollarSign, Layers, Play, Star, HelpCircle, Info, Settings, Activity,
  LogOut, ExternalLink, Loader2, Menu, X
} from "lucide-react";

type Section =
  | "rates" | "services" | "work" | "testimonials"
  | "faqs" | "about" | "site" | "diagnostics";

const NAV: Array<{ id: Section; label: string; icon: typeof DollarSign }> = [
  { id: "rates",        label: "Rate Card",      icon: DollarSign },
  { id: "services",     label: "Services",       icon: Layers },
  { id: "work",         label: "Work Portfolio", icon: Play },
  { id: "testimonials", label: "Testimonials",   icon: Star },
  { id: "faqs",         label: "FAQs",           icon: HelpCircle },
  { id: "about",        label: "About Page",     icon: Info },
  { id: "site",         label: "Site Settings",  icon: Settings },
  { id: "diagnostics",  label: "Diagnostics",    icon: Activity },
];

export default function Home() {
  const { status, loading, refresh } = useAuth();
  const [section, setSection] = useState<Section>("rates");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Read hash on mount + on hashchange so deep links work (#rates, #faqs, etc.)
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as Section;
      if (NAV.some((n) => n.id === h)) setSection(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  function selectSection(s: Section) {
    setSection(s);
    setSidebarOpen(false);
    if (window.location.hash !== `#${s}`) {
      window.history.pushState(null, "", `#${s}`);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 text-zinc-300">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
            <Settings className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-xl font-light">Admin not configured</h1>
          <p className="text-sm text-zinc-500">
            Set <code className="text-zinc-300">ADMIN_PASSWORD</code>, <code className="text-zinc-300">ADMIN_JWT_SECRET</code>,
            and <code className="text-zinc-300">GITHUB_TOKEN</code> environment variables in your Vercel project settings, then redeploy.
          </p>
          <p className="text-xs text-zinc-600">
            See the Diagnostics section once logged in for the full setup checklist.
          </p>
        </div>
      </div>
    );
  }

  if (!status?.authenticated) {
    return <LoginScreen onLoggedIn={refresh} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top bar (mobile) */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="text-zinc-300">
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-medium tracking-tight">Soundcore Admin</span>
        </div>
        <a href="https://soundcorestudio.ng" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-amber-500 flex items-center gap-1">
          View site <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40
            w-64 h-screen bg-zinc-900 border-r border-zinc-800
            flex flex-col transition-transform duration-200
          `}
        >
          <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800">
            <div>
              <div className="font-medium tracking-tight">Soundcore</div>
              <div className="text-xs text-zinc-500">Admin Console</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden text-zinc-400">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = section === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => selectSection(n.id)}
                  className={`
                    w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors
                    ${active
                      ? "bg-amber-500/10 text-amber-500 border-r-2 border-amber-500"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"}
                  `}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-zinc-800 space-y-2">
            <a
              href="https://soundcorestudio.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-500 px-3 py-2 rounded-md hover:bg-zinc-800/50 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> View live site
            </a>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 px-3 py-2 rounded-md hover:bg-zinc-800/50 transition-colors"
            >
              <LogOut className="w-3 h-3" /> Sign out
            </button>
          </div>
        </aside>

        {/* Backdrop (mobile) */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto w-full">
          {section === "rates"        && <RatesEditor />}
          {section === "services"     && <ServicesEditor />}
          {section === "work"         && <WorkEditor />}
          {section === "testimonials" && <TestimonialsEditor />}
          {section === "faqs"         && <FaqsEditor />}
          {section === "about"        && <AboutEditor />}
          {section === "site"         && <SiteEditor />}
          {section === "diagnostics"  && <Diagnostics />}
        </main>
      </div>
    </div>
  );
}
