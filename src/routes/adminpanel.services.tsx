import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminTable } from "@/hooks/useAdminTable";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/adminpanel/services")({
  component: ServicesAdmin,
});

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

function ServicesAdmin() {
  const { rows, loading, error, save, remove } = useAdminTable<Service>("services");

  return (
    <AdminSection
      title="خدماتنا"
      description="أضف أو عدّل الخدمات التي تظهر في قسم (خدماتنا). محفوظة في قاعدة البيانات."
      action={
        <Button onClick={() => save({ title: "خدمة جديدة", sort_order: rows.length + 1 })}>
          <Plus className="ms-2 h-4 w-4" /> إضافة خدمة
        </Button>
      }
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((it) => (
            <ServiceCard key={it.id} item={it} onSave={save} onRemove={remove} />
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">لا توجد خدمات بعد.</p>}
        </div>
      )}
    </AdminSection>
  );
}

function ServiceCard({
  item,
  onSave,
  onRemove,
}: {
  item: Service;
  onSave: (row: Partial<Service>) => Promise<unknown>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Service>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">خدمة</span>
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div>
          <Label>عنوان الخدمة</Label>
          <Input value={draft.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div>
          <Label>الوصف</Label>
          <Textarea rows={3} value={draft.description ?? ""} onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div>
          <Label>اسم الأيقونة (Lucide)</Label>
          <Input dir="ltr" value={draft.icon ?? ""} onChange={(e) => set({ icon: e.target.value })} placeholder="ShieldAlert" />
        </div>
        <ImageUpload
          label="صورة الخدمة (اختياري)"
          value={draft.image_url}
          onChange={(url) => set({ image_url: url ?? null })}
        />
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
