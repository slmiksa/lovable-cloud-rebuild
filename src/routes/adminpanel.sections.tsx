import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminTable } from "@/hooks/useAdminTable";

export const Route = createFileRoute("/adminpanel/sections")({
  component: SectionsAdmin,
});

interface SectionText {
  id: string;
  key: string;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
}

const LABELS: Record<string, string> = {
  services: "خدماتنا",
  offers: "أحدث العروض",
  systems: "التطبيقات والأنظمة",
  clients: "العملاء",
  news: "الأخبار",
  circles: "الدوائر الرئيسية",
};

function SectionsAdmin() {
  const { rows, loading, error, save } = useAdminTable<SectionText>("section_texts");

  return (
    <AdminSection
      title="نصوص الأقسام"
      description="تحكم بعنوان ونص ووصف وأيقونة كل قسم في الصفحة الرئيسية. اسم الأيقونة من مكتبة Lucide (مثال: ShieldCheck, Sparkles, Newspaper, Users, Grid)."
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => (
            <SectionCard key={r.id} item={r} onSave={save} />
          ))}
        </div>
      )}
    </AdminSection>
  );
}

function SectionCard({
  item,
  onSave,
}: {
  item: SectionText;
  onSave: (row: Partial<SectionText>) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<SectionText>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">قسم</span>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {LABELS[item.key] ?? item.key}
        </span>
      </div>
      <div className="space-y-3">
        <div>
          <Label>الشارة العلوية (Eyebrow)</Label>
          <Input value={draft.eyebrow ?? ""} onChange={(e) => set({ eyebrow: e.target.value })} />
        </div>
        <div>
          <Label>العنوان</Label>
          <Input value={draft.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div>
          <Label>الوصف</Label>
          <Textarea
            rows={3}
            value={draft.description ?? ""}
            onChange={(e) => set({ description: e.target.value })}
          />
        </div>
        <div>
          <Label>اسم أيقونة Lucide</Label>
          <Input
            dir="ltr"
            value={draft.icon ?? ""}
            onChange={(e) => set({ icon: e.target.value })}
            placeholder="ShieldCheck"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(draft);
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
          حفظ
        </Button>
      </div>
    </div>
  );
}
