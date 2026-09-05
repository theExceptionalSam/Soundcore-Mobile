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

type SiteData = {
  brand: string;
  tagline: string;
  description: string;
  domain: string;
  rc_number: string;
  incorporation_note: string;
  location: { city: string; region: string; country: string };
  contact: { email: string; whatsapp: string; whatsapp_display: string; response_time: string };
  social: Array<{ label: string; url: string }>;
  formspree_endpoint: string;
  footer_services: string[];
};

export function SiteEditor() {
  const { data, setData, loading, saving, dirty, save } = useContent<SiteData>("site");

  if (loading) return <div className="flex items-center justify-center py-20 text-zinc-500"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…</div>;
  if (!data) return <div className="text-red-400 py-10 text-center">Failed to load site settings</div>;

  function update(patch: Partial<SiteData>) {
    setData((prev) => prev ? { ...prev, ...patch } : prev);
  }
  function updateLocation(patch: Partial<SiteData["location"]>) {
    setData((prev) => prev ? { ...prev, location: { ...prev.location, ...patch } } : prev);
  }
  function updateContact(patch: Partial<SiteData["contact"]>) {
    setData((prev) => prev ? { ...prev, contact: { ...prev.contact, ...patch } } : prev);
  }
  function updateSocial(i: number, patch: Partial<{ label: string; url: string }>) {
    setData((prev) => prev ? {
      ...prev,
      social: prev.social.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    } : prev);
  }
  function addSocial() {
    setData((prev) => prev ? { ...prev, social: [...prev.social, { label: "New", url: "https://" }] } : prev);
  }
  function removeSocial(i: number) {
    setData((prev) => prev ? { ...prev, social: prev.social.filter((_, idx) => idx !== i) } : prev);
  }
  function updateFooterServices(text: string) {
    const items = text.split("\n").filter(Boolean);
    update({ footer_services: items });
  }

  async function handleSave() {
    const t = toast.loading("Committing to GitHub…");
    const r = await save();
    toast.dismiss(t);
    if (r?.ok) toast.success("Site settings updated. Live in ~30s after Vercel redeploys.");
    else toast.error(r?.error || "Save failed");
  }

  return (
    <div className="space-y-6">
      <EditorHeader
        title="Site Settings"
        subtitle="Brand info, contact details, social links. These appear in the footer + nav of every page."
        onSave={handleSave}
        saving={saving}
        dirty={dirty}
      />

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-medium text-amber-500">Brand</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-zinc-400 text-xs">Brand name</Label>
              <Input value={data.brand} onChange={(e) => update({ brand: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Tagline</Label>
              <Input value={data.tagline} onChange={(e) => update({ tagline: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
            </div>
          </div>
          <div>
            <Label className="text-zinc-400 text-xs">Footer description</Label>
            <Textarea value={data.description} onChange={(e) => update({ description: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-zinc-400 text-xs">RC number</Label>
              <Input value={data.rc_number} onChange={(e) => update({ rc_number: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-zinc-400 text-xs">Incorporation note</Label>
              <Input value={data.incorporation_note} onChange={(e) => update({ incorporation_note: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-medium text-amber-500">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-zinc-400 text-xs">City</Label>
              <Input value={data.location.city} onChange={(e) => updateLocation({ city: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Region</Label>
              <Input value={data.location.region} onChange={(e) => updateLocation({ region: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Country</Label>
              <Input value={data.location.country} onChange={(e) => updateLocation({ country: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-medium text-amber-500">Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-zinc-400 text-xs">Email</Label>
              <Input value={data.contact.email} onChange={(e) => updateContact({ email: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">WhatsApp number (digits only, with country code)</Label>
              <Input value={data.contact.whatsapp} onChange={(e) => updateContact({ whatsapp: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" placeholder="2347010841565" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">WhatsApp display</Label>
              <Input value={data.contact.whatsapp_display} onChange={(e) => updateContact({ whatsapp_display: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs">Response time</Label>
              <Input value={data.contact.response_time} onChange={(e) => updateContact({ response_time: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
            </div>
          </div>
          <div>
            <Label className="text-zinc-400 text-xs">Formspree endpoint (the form action URL)</Label>
            <Input value={data.formspree_endpoint} onChange={(e) => update({ formspree_endpoint: e.target.value })} className="bg-zinc-950 border-zinc-700 text-zinc-100" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-amber-500">Social links</h3>
            <Button onClick={addSocial} variant="outline" size="sm" className="bg-zinc-950 border-zinc-700 text-zinc-200">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          {data.social.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={s.label}
                onChange={(e) => updateSocial(i, { label: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100 w-32"
                placeholder="Instagram"
              />
              <Input
                value={s.url}
                onChange={(e) => updateSocial(i, { url: e.target.value })}
                className="bg-zinc-950 border-zinc-700 text-zinc-100 flex-1"
                placeholder="https://instagram.com/..."
              />
              <Button variant="ghost" size="icon" onClick={() => removeSocial(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-medium text-amber-500">Footer "Services" column</h3>
          <Label className="text-zinc-400 text-xs">One per line</Label>
          <Textarea
            value={data.footer_services.join("\n")}
            onChange={(e) => updateFooterServices(e.target.value)}
            className="bg-zinc-950 border-zinc-700 text-zinc-100"
            rows={5}
          />
        </CardContent>
      </Card>
    </div>
  );
}
