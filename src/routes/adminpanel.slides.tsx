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

export const Route = createFileRoute("/adminpanel/slides")({
  component: SlidesAdmin,
});

interface Slide {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  sort_order: number;
  is_active: boolean;
}

function SlidesAdmin() {
  const { rows, loading, error, save, remove } = useAdminTable<Slide>("slides");

  return (
    <AdminSection
      title="السلايدات الرئيسية"
      description="إدارة السلايدات التي تظهر في أعلى الصفحة الرئيسية. البيانات محفوظة في قاعدة البيانات."
      action={
        <Button
          onClick={() => save({ title: "سلايد جديد", sort_order: rows.length + 1 })}
        >
          <Plus className="ms-2 h-4 w-4" /> إضافة سلايد
        </Button>
      }
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="space-y-4">
          {rows.map((slide, i) => (
            <SlideCard
              key={slide.id}
              slide={slide}
              index={i}
              onSave={save}
              onRemove={remove}
            />
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">لا توجد سلايدات بعد.</p>
          )}
        </div>
      )}
    </AdminSection>
  );
}

function SlideCard({
  slide,
  index,
  onSave,
  onRemove,
}: {
  slide: Slide;
  index: number;
  onSave: (row: Partial<Slide>) => Promise<unknown>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(slide);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Slide>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-muted-foreground">سلايد #{index + 1}</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(slide.id)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>العنوان</Label>
          <Input value={draft.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div>
          <Label>العنوان الفرعي</Label>
          <Input value={draft.subtitle ?? ""} onChange={(e) => set({ subtitle: e.target.value })} />
        </div>
        <div>
          <Label>نص الزر</Label>
          <Input value={draft.cta_label ?? ""} onChange={(e) => set({ cta_label: e.target.value })} />
        </div>
        <div>
          <Label>رابط الزر</Label>
          <Input dir="ltr" value={draft.cta_url ?? ""} onChange={(e) => set({ cta_url: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <ImageUpload
            label="صورة السلايد"
            aspect="wide"
            value={draft.image_url}
            onChange={(url) => set({ image_url: url ?? null })}
            hint="المقاس الموصى به: 1920×820 بكسل (نسبة 21:9). صيغة PNG أو JPG، حجم أقل من 500KB لأفضل سرعة تحميل."
          />
        </div>
        <div>
          <Label>الترتيب</Label>
          <Input
            type="number"
            value={draft.sort_order}
            onChange={(e) => set({ sort_order: Number(e.target.value) })}
          />
        </div>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(e) => set({ is_active: e.target.checked })}
          />
          مُفعّل (يظهر على الموقع)
        </label>
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
