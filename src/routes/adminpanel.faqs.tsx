import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Loader2, Save, HelpCircle } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminTable } from "@/hooks/useAdminTable";

export const Route = createFileRoute("/adminpanel/faqs")({
  component: FaqsAdmin,
});

interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

function FaqsAdmin() {
  const { rows, loading, error, save, remove } = useAdminTable<Faq>("whatsapp_faqs");

  const addNew = () =>
    save({
      question: "سؤال جديد",
      answer: "الإجابة هنا...",
      sort_order: rows.length + 1,
      is_active: true,
    });

  return (
    <AdminSection
      title="الأسئلة الجاهزة (زر التواصل)"
      description="هذه الأسئلة والإجابات تظهر داخل نافذة زر واتساب العائم في الموقع."
      action={
        <Button size="sm" onClick={addNew}>
          <Plus className="ms-1 h-4 w-4" /> إضافة سؤال
        </Button>
      }
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="grid gap-4">
          {rows.map((it) => (
            <FaqCard key={it.id} item={it} onSave={save} onRemove={remove} />
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">لا توجد أسئلة بعد. أضف أول سؤال.</p>
          )}
        </div>
      )}
    </AdminSection>
  );
}

function FaqCard({
  item,
  onSave,
  onRemove,
}: {
  item: Faq;
  onSave: (row: Partial<Faq>) => Promise<unknown>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Faq>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HelpCircle className="h-4 w-4" />
          </span>
          سؤال #{draft.sort_order}
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div>
          <Label>السؤال</Label>
          <Input value={draft.question} onChange={(e) => set({ question: e.target.value })} />
        </div>
        <div>
          <Label>الإجابة</Label>
          <textarea
            value={draft.answer}
            onChange={(e) => set({ answer: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
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
