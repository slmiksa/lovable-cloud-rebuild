import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminTable } from "@/hooks/useAdminTable";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/adminpanel/clients")({
  component: ClientsAdmin,
});

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  is_active: boolean;
}

function ClientsAdmin() {
  const { rows, loading, error, save, remove } = useAdminTable<Client>("clients");

  return (
    <AdminSection
      title="عملاؤنا"
      description="أدر شعارات وأسماء العملاء الظاهرة في قسم عملاؤنا. محفوظة في قاعدة البيانات."
      action={
        <Button onClick={() => save({ name: "عميل جديد", sort_order: rows.length + 1 })}>
          <Plus className="ms-2 h-4 w-4" /> إضافة عميل
        </Button>
      }
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((it) => (
            <ClientCard key={it.id} item={it} onSave={save} onRemove={remove} />
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">لا يوجد عملاء بعد.</p>}
        </div>
      )}
    </AdminSection>
  );
}

function ClientCard({
  item,
  onSave,
  onRemove,
}: {
  item: Client;
  onSave: (row: Partial<Client>) => Promise<unknown>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Client>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">عميل</span>
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <ImageUpload
          label="شعار العميل"
          aspect="square"
          value={draft.logo_url}
          onChange={(url) => set({ logo_url: url ?? null })}
        />
        <div>
          <Label>اسم العميل</Label>
          <Input value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div>
          <Label>الموقع الإلكتروني</Label>
          <Input dir="ltr" value={draft.website_url ?? ""} onChange={(e) => set({ website_url: e.target.value })} placeholder="https://..." />
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
