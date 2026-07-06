import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Loader2, Save, Tag } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminTable } from "@/hooks/useAdminTable";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/adminpanel/offers")({
  component: OffersAdmin,
});

interface Offer {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
}

function OffersAdmin() {
  const { rows, loading, error, save, remove } = useAdminTable<Offer>("offers");

  return (
    <AdminSection
      title="أحدث العروض"
      description="أضف أو عدّل العروض الترويجية الظاهرة على الموقع. محفوظة في قاعدة البيانات."
      action={
        <Button onClick={() => save({ title: "عرض جديد", sort_order: rows.length + 1 })}>
          <Plus className="ms-2 h-4 w-4" /> إضافة عرض
        </Button>
      }
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((it) => (
            <OfferCard key={it.id} item={it} onSave={save} onRemove={remove} />
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">لا توجد عروض بعد.</p>}
        </div>
      )}
    </AdminSection>
  );
}

function OfferCard({
  item,
  onSave,
  onRemove,
}: {
  item: Offer;
  onSave: (row: Partial<Offer>) => Promise<unknown>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Offer>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Tag className="h-3.5 w-3.5" /> عرض ترويجي
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div>
          <Label>عنوان العرض</Label>
          <Input value={draft.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div>
          <Label>الوصف</Label>
          <Textarea rows={2} value={draft.description ?? ""} onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>الشارة</Label>
            <Input value={draft.badge ?? ""} onChange={(e) => set({ badge: e.target.value })} placeholder="خصم 25%" />
          </div>
          <div>
            <Label>السعر</Label>
            <Input value={draft.price ?? ""} onChange={(e) => set({ price: e.target.value })} placeholder="اختياري" />
          </div>
        </div>
        <ImageUpload
          label="صورة العرض (اختياري)"
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
