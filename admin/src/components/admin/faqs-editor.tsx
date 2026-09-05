"use client";

import { useContent } from "./use-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { EditorHeader } from "./rates-editor";

type Faq = {
  question: string;
  answer: string;
};

export function FaqsEditor() {
  const { data, setData, loading, saving, dirty, save } = useContent<Faq[]>("faqs");

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-500"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…</div>;
  if (!data) return <div className="text-red-400 py-10 text-center">Failed to load FAQs</div>;

  function update(i: number, patch: Partial<Faq>) {
    setData((prev) => prev ? prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) : prev);
  }
  function add() {
    setData((prev) => prev ? [...prev, { question: "New question?", answer: "" }] : prev);
  }
  function remove(i: number) {
    if (!confirm(`Delete this FAQ?`)) return;
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

  async function handleSave() {
    const t = toast.loading("Committing to GitHub…");
    const r = await save();
    toast.dismiss(t);
    if (r?.ok) toast.success("FAQs updated. Live in ~30s.");
    else toast.error(r?.error || "Save failed");
  }

  return (
    <div className="space-y-6">
      <EditorHeader
        title="FAQs"
        subtitle="Frequently asked questions on the FAQ page. First item starts open."
        onSave={handleSave}
        saving={saving}
        dirty={dirty}
      />
      {data.map((f, i) => (
        <Card key={i} className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5 space-y-3">
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
            <div>
              <Label className="text-zinc-400 text-xs">Question</Label>
              <Input
                value={f.question}
                onChange={(e) => update(i, { question: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Answer</Label>
              <Textarea
                value={f.answer}
                onChange={(e) => update(i, { answer: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-center">
        <Button onClick={add} variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800">
          <Plus className="w-4 h-4 mr-2" /> Add FAQ
        </Button>
      </div>
    </div>
  );
}
