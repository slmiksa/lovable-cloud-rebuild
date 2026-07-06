import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Loader2, Save, Share2 } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminTable } from "@/hooks/useAdminTable";

export const Route = createFileRoute("/adminpanel/social")({
  component: SocialAdmin,
});

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

function SocialAdmin() {
  const { rows, loading, error, save, remove } = useAdminTable<SocialLink>("social_links");

  return (
    <AdminSection
      title="وسائل التواصل"
      description="روابط حسابات التواصل الاجتماعي التي تظهر في الموقع. محفوظة في قاعدة البيانات."
      action={
        <Button onClick={() => save({ platform: "منصة جديدة", url: "https://", sort_order: rows.length + 1 })}>
          <Plus className="ms-2 h-4 w-4" /> إضافة رابط
        </Button>
      }
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((it) => (
            <SocialCard key={it.id} item={it} onSave={save} onRemove={remove} />
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">لا توجد روابط بعد.</p>}
        </div>
      )}
    </AdminSection>
  );
}

function SocialCard({
  item,
  onSave,
  onRemove,
}: {
  item: SocialLink;
  onSave: (row: Partial<SocialLink>) => Promise<unknown>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<SocialLink>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Share2 className="h-4 w-4" />
          </span>
          {draft.platform}
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div>
          <Label>المنصة</Label>
          <Input value={draft.platform} onChange={(e) => set({ platform: e.target.value })} placeholder="facebook" />
        </div>
        <div>
          <Label>الرابط</Label>
          <Input dir="ltr" value={draft.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <Label>اسم الأيقونة (Lucide)</Label>
          <Input dir="ltr" value={draft.icon ?? ""} onChange={(e) => set({ icon: e.target.value })} placeholder="Facebook" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label>الترتيب</Label>
            <Input type="number" value={draft.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2 pt-6 text-sm">
            <input type="checkbox" checked={draft.is_active} onChange={(e) => set({ is_active: e.target.checked })} />
            مُفعّل
          </label>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave(draft);
            setSaving(false);
          }}
        >
          {saving ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
          حفظ
        </Button>
      </div>
    </div>
  );
}
