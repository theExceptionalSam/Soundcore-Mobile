"use client";

import { useContent } from "./use-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EditorHeader } from "./rates-editor";

type About = {
  heading: string;
  description_paragraphs: string[];
  brand_tags: string[];
  mission: { title: string; body: string };
  vision: { title: string; body: string };
  eyebrow: string;
};

export function AboutEditor() {
  const { data, setData, loading, saving, dirty, save } = useContent<About>("about");

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-500"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…</div>;
  if (!data) return <div className="text-red-400 py-10 text-center">Failed to load about</div>;

  function update(patch: Partial<About>) {
    setData((prev) => prev ? { ...prev, ...patch } : prev);
  }
  function updateParagraph(i: number, text: string) {
    setData((prev) => prev ? {
      ...prev,
      description_paragraphs: prev.description_paragraphs.map((p, idx) => (idx === i ? text : p)),
    } : prev);
  }
  function addParagraph() {
    setData((prev) => prev ? { ...prev, description_paragraphs: [...prev.description_paragraphs, ""] } : prev);
  }
  function removeParagraph(i: number) {
    setData((prev) => prev ? { ...prev, description_paragraphs: prev.description_paragraphs.filter((_, idx) => idx !== i) } : prev);
  }
  function updateTags(text: string) {
    const tags = text.split(",").map((t) => t.trim()).filter(Boolean);
    update({ brand_tags: tags });
  }
  function updateMission(patch: Partial<{ title: string; body: string }>) {
    setData((prev) => prev ? { ...prev, mission: { ...prev.mission, ...patch } } : prev);
  }
  function updateVision(patch: Partial<{ title: string; body: string }>) {
    setData((prev) => prev ? { ...prev, vision: { ...prev.vision, ...patch } } : prev);
  }

  async function handleSave() {
    const t = toast.loading("Committing to GitHub…");
    const r = await save();
    toast.dismiss(t);
    if (r?.ok) toast.success("About page updated. Live in ~30s.");
    else toast.error(r?.error || "Save failed");
  }

  return (
    <div className="space-y-6">
      <EditorHeader
        title="About Page"
        subtitle="Mission, vision, brand tags, and description paragraphs on the About page."
        onSave={handleSave}
        saving={saving}
        dirty={dirty}
      />
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5 space-y-3">
          <div>
            <Label className="text-zinc-400 text-xs">Heading</Label>
            <Input
              value={data.heading}
              onChange={(e) => update({ heading: e.target.value })}
              className="bg-zinc-950 border-zinc-700 text-zinc-100"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5 space-y-3">
          <Label className="text-zinc-400 text-xs">Description paragraphs</Label>
          {data.description_paragraphs.map((p, i) => (
            <div key={i} className="flex gap-2">
              <Textarea
                value={p}
                onChange={(e) => updateParagraph(i, e.target.value)}
                className="bg-zinc-950 border-zinc-700 text-zinc-100 flex-1"
                rows={3}
              />
              <Button variant="ghost" size="icon" onClick={() => removeParagraph(i)} className="text-red-400 hover:text-red-300 self-start">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button onClick={addParagraph} variant="outline" size="sm" className="bg-zinc-950 border-zinc-700 text-zinc-200">
            <Plus className="w-4 h-4 mr-1" /> Add paragraph
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5 space-y-3">
          <div>
            <Label className="text-zinc-400 text-xs">Brand tags (comma-separated)</Label>
            <Input
              value={data.brand_tags.join(", ")}
              onChange={(e) => updateTags(e.target.value)}
              className="bg-zinc-950 border-zinc-700 text-zinc-100"
              placeholder="Creative, Professional, Confident"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5 space-y-3">
            <div>
              <Label className="text-zinc-400 text-xs">Mission title</Label>
              <Input
                value={data.mission.title}
                onChange={(e) => updateMission({ title: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Mission body</Label>
              <Textarea
                value={data.mission.body}
                onChange={(e) => updateMission({ body: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100"
                rows={5}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5 space-y-3">
            <div>
              <Label className="text-zinc-400 text-xs">Vision title</Label>
              <Input
                value={data.vision.title}
                onChange={(e) => updateVision({ title: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Vision body</Label>
              <Textarea
                value={data.vision.body}
                onChange={(e) => updateVision({ body: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100"
                rows={5}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
