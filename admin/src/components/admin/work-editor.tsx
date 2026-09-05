"use client";

import { useContent } from "./use-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Save, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { EditorHeader } from "./rates-editor";

type WorkItem = {
  youtube_id: string;
  category: string;
  categories: string[];
  title: string;
  description: string;
};

const FILTERS = ["music", "live", "podcast", "bts"];

export function WorkEditor() {
  const { data, setData, loading, saving, dirty, save } = useContent<WorkItem[]>("work");

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-500"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…</div>;
  if (!data) return <div className="text-red-400 py-10 text-center">Failed to load work</div>;

  function update(i: number, patch: Partial<WorkItem>) {
    setData((prev) => prev ? prev.map((w, idx) => (idx === i ? { ...w, ...patch } : w)) : prev);
  }
  function add() {
    setData((prev) => prev ? [...prev, {
      youtube_id: "",
      category: "Live Session",
      categories: ["live"],
      title: "New Video",
      description: "",
    }] : prev);
  }
  function remove(i: number) {
    if (!confirm(`Delete "${data?.[i]?.title}"?`)) return;
    setData((prev) => prev ? prev.filter((_, idx) => idx !== i) : prev);
  }
  function move(i: number, dir: -1 | 1) {
    setData((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function toggleCategory(i: number, cat: string) {
    setData((prev) => prev ? prev.map((w, idx) => {
      if (idx !== i) return w;
      const has = w.categories.includes(cat);
      return {
        ...w,
        categories: has ? w.categories.filter((c) => c !== cat) : [...w.categories, cat],
      };
    }) : prev);
  }

  async function handleSave() {
    const t = toast.loading("Committing to GitHub…");
    const r = await save();
    toast.dismiss(t);
    if (r?.ok) toast.success("Work portfolio updated. Live in ~30s.");
    else toast.error(r?.error || "Save failed");
  }

  return (
    <div className="space-y-6">
      <EditorHeader
        title="Work / Portfolio"
        subtitle="YouTube video portfolio. Paste a video ID (the part after v= in the URL). Leave empty to show 'coming soon' placeholder."
        onSave={handleSave}
        saving={saving}
        dirty={dirty}
      />
      {data.length === 0 && (
        <Card className="bg-zinc-900 border-zinc-800 border-dashed">
          <CardContent className="p-10 text-center text-zinc-500">
            No portfolio items yet. Add your first video.
          </CardContent>
        </Card>
      )}
      {data.map((w, i) => (
        <Card key={i} className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0} className="text-zinc-400 hover:text-zinc-100">
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === data.length - 1} className="text-zinc-400 hover:text-zinc-100">
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {w.youtube_id && (
              <div className="aspect-video bg-zinc-950 rounded-md overflow-hidden border border-zinc-800">
                <img
                  src={`https://i.ytimg.com/vi/${w.youtube_id}/hqdefault.jpg`}
                  alt={w.title}
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-400 text-xs">YouTube video ID</Label>
                <Input
                  value={w.youtube_id}
                  onChange={(e) => update(i, { youtube_id: e.target.value.trim() })}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100"
                  placeholder="OuTd8VBk63A"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Category label</Label>
                <Input
                  value={w.category}
                  onChange={(e) => update(i, { category: e.target.value })}
                  className="bg-zinc-950 border-zinc-700 text-zinc-100"
                  placeholder="Live Session"
                />
              </div>
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Title</Label>
              <Input
                value={w.title}
                onChange={(e) => update(i, { title: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Description</Label>
              <Textarea
                value={w.description}
                onChange={(e) => update(i, { description: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Filter categories (used by the page&apos;s filter buttons)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleCategory(i, f)}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      w.categories.includes(f)
                        ? "bg-amber-500 border-amber-500 text-zinc-950"
                        : "bg-zinc-950 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center">
        <Button onClick={add} variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800">
          <Plus className="w-4 h-4 mr-2" /> Add video
        </Button>
      </div>
    </div>
  );
}
