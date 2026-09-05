"use client";

import { useContent } from "./use-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Save, ArrowUp, ArrowDown, Wand2 } from "lucide-react";
import { toast } from "sonner";

type Tier = {
  name: string;
  price: string;
  unit: string;
  is_featured: boolean;
  features: string[];
};

type RateCategory = {
  id: string;
  name: string;
  heading: string;
  subtitle: string;
  bg_color: string;
  tiers: Tier[];
  notes: string;
};

const BG_COLORS = ["rust", "pine", "gold", "navy", "blood"];

export function RatesEditor() {
  const { data, setData, loading, saving, dirty, save } = useContent<RateCategory[]>("rates");

  if (loading) return <Loading />;
  if (!data) return <Error msg="Failed to load rates" />;

  function update(i: number, patch: Partial<RateCategory>) {
    setData((prev) => (prev ? prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) : prev));
  }
  function updateTier(i: number, ti: number, patch: Partial<Tier>) {
    setData((prev) => prev ? prev.map((c, idx) => {
      if (idx !== i) return c;
      return { ...c, tiers: c.tiers.map((t, tidx) => (tidx === ti ? { ...t, ...patch } : t)) };
    }) : prev);
  }
  function addCategory() {
    setData((prev) => prev ? [...prev, {
      id: `cat-${Date.now()}`,
      name: "New Category",
      heading: "New Category",
      subtitle: "",
      bg_color: BG_COLORS[prev.length % BG_COLORS.length],
      tiers: [
        { name: "Basic", price: "₦0", unit: "", is_featured: false, features: [] },
        { name: "Standard", price: "₦0", unit: "", is_featured: true, features: [] },
        { name: "Premium", price: "₦0", unit: "", is_featured: false, features: [] },
      ],
      notes: "Prices are negotiable for bulk bookings · Discounts available for artists on retainer · Extra charges may apply for extended hours or special setups · Payment required before session confirmation.",
    }] : prev);
  }
  function removeCategory(i: number) {
    if (!confirm(`Delete "${data?.[i]?.name}"? This cannot be undone.`)) return;
    setData((prev) => prev ? prev.filter((_, idx) => idx !== i) : prev);
  }
  function moveCategory(i: number, dir: -1 | 1) {
    setData((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function updateFeatures(i: number, ti: number, text: string) {
    const features = text.split("\n").filter(Boolean);
    updateTier(i, ti, { features });
  }

  async function handleSave() {
    const t = toast.loading("Committing to GitHub…");
    const r = await save();
    toast.dismiss(t);
    if (r?.ok) toast.success("Rates updated. Live in ~30s after Vercel redeploys.");
    else toast.error(r?.error || "Save failed");
  }

  return (
    <div className="space-y-6">
      <Header
        title="Rate Card"
        subtitle="Five session types, three tiers each. Click a tier to edit. Drag-handle buttons move categories up/down."
        onSave={handleSave}
        saving={saving}
        dirty={dirty}
      />

      {data.map((cat, i) => (
        <Card key={cat.id} className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-zinc-400">Name (tab label)</Label>
                <Input
                  value={cat.name}
                  onChange={(e) => update(i, { name: e.target.value, heading: e.target.value })}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100"
                />
              </div>
              <div>
                <Label className="text-zinc-400">Subtitle</Label>
                <Input
                  value={cat.subtitle}
                  onChange={(e) => update(i, { subtitle: e.target.value })}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100"
                  placeholder="Bands · Choirs · Churches · Ensembles"
                />
              </div>
              <div>
                <Label className="text-zinc-400">Background color</Label>
                <select
                  value={cat.bg_color}
                  onChange={(e) => update(i, { bg_color: e.target.value })}
                  className="w-full h-9 rounded-md bg-zinc-950 border border-zinc-700 text-zinc-100 px-3"
                >
                  {BG_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => moveCategory(i, -1)} disabled={i === 0} className="text-zinc-400 hover:text-zinc-100">
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => moveCategory(i, 1)} disabled={i === data.length - 1} className="text-zinc-400 hover:text-zinc-100">
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => removeCategory(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cat.tiers.map((tier, ti) => (
                <div key={ti} className={`p-4 rounded-lg border ${tier.is_featured ? "border-amber-500/50 bg-amber-500/5" : "border-zinc-800 bg-zinc-950/50"}`}>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-zinc-400 text-xs">Tier name</Label>
                      <Input
                        value={tier.name}
                        onChange={(e) => updateTier(i, ti, { name: e.target.value })}
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 h-8"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-zinc-400 text-xs">Price</Label>
                        <Input
                          value={tier.price}
                          onChange={(e) => updateTier(i, ti, { price: e.target.value })}
                          className="bg-zinc-900 border-zinc-700 text-zinc-100 h-8"
                          placeholder="₦120,000"
                        />
                      </div>
                      <div className="w-20">
                        <Label className="text-zinc-400 text-xs">Unit</Label>
                        <Input
                          value={tier.unit}
                          onChange={(e) => updateTier(i, ti, { unit: e.target.value })}
                          className="bg-zinc-900 border-zinc-700 text-zinc-100 h-8"
                          placeholder="/hr"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-zinc-400 text-xs">Features (one per line)</Label>
                      <Textarea
                        value={tier.features.join("\n")}
                        onChange={(e) => updateFeatures(i, ti, e.target.value)}
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 min-h-[100px] text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tier.is_featured}
                        onChange={(e) => updateTier(i, ti, { is_featured: e.target.checked })}
                        className="rounded"
                      />
                      Highlight as featured tier
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <Label className="text-zinc-400">Notes (shown below tiers)</Label>
              <Textarea
                value={cat.notes}
                onChange={(e) => update(i, { notes: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100 text-sm"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center">
        <Button onClick={addCategory} variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800">
          <Plus className="w-4 h-4 mr-2" /> Add new rate category
        </Button>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-20 text-zinc-500">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
    </div>
  );
}

function Error({ msg }: { msg: string }) {
  return <div className="text-red-400 py-10 text-center">{msg}</div>;
}

function Header({ title, subtitle, onSave, saving, dirty }: {
  title: string;
  subtitle: string;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 border-b border-zinc-800">
      <div>
        <h2 className="text-2xl font-light text-zinc-100">{title}</h2>
        <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
      </div>
      <Button onClick={onSave} disabled={saving || !dirty} className="bg-amber-500 hover:bg-amber-400 text-zinc-950">
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : <><Save className="w-4 h-4 mr-2" /> Save changes</>}
      </Button>
    </div>
  );
}

// Re-export the Header so other editors can use it
export { Header as EditorHeader };
