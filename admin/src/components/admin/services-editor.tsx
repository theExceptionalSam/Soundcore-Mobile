"use client";

import { useContent } from "./use-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { EditorHeader } from "./rates-editor";

type Service = {
  num: string;
  name: string;
  description: string;
};

export function ServicesEditor() {
  const { data, setData, loading, saving, dirty, save } = useContent<Service[]>("services");

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-500"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…</div>;
  if (!data) return <div className="text-red-400 py-10 text-center">Failed to load services</div>;

  function update(i: number, patch: Partial<Service>) {
    setData((prev) => prev ? prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) : prev);
  }
  function add() {
    const nextNum = String(data!.length + 1).padStart(2, "0");
    setData((prev) => prev ? [...prev, { num: nextNum, name: "New Service", description: "" }] : prev);
  }
  function remove(i: number) {
    if (!confirm(`Delete "${data?.[i]?.name}"?`)) return;
    setData((prev) => prev ? prev.filter((_, idx) => idx !== i) : prev);
  }

  async function handleSave() {
    const t = toast.loading("Committing to GitHub…");
    const r = await save();
    toast.dismiss(t);
    if (r?.ok) toast.success("Services updated. Live in ~30s.");
    else toast.error(r?.error || "Save failed");
  }

  return (
    <div className="space-y-6">
      <EditorHeader
        title="Services"
        subtitle="The six disciplines shown on the Services page. Order = display order."
        onSave={handleSave}
        saving={saving}
        dirty={dirty}
      />
      {data.map((s, i) => (
        <Card key={i} className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_auto] gap-3 items-end">
              <div>
                <Label className="text-zinc-400 text-xs">Number</Label>
                <Input
                  value={s.num}
                  onChange={(e) => update(i, { num: e.target.value })}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100"
                  placeholder="01"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Service name</Label>
                <Input
                  value={s.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Description</Label>
              <Textarea
                value={s.description}
                onChange={(e) => update(i, { description: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center">
        <Button onClick={add} variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800">
          <Plus className="w-4 h-4 mr-2" /> Add service
        </Button>
      </div>
    </div>
  );
}
