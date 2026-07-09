import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, Trash2, Save, Mail, Phone, Calendar, Search } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminTable } from "@/hooks/useAdminTable";

export const Route = createFileRoute("/adminpanel/orders")({
  component: OrdersAdmin,
});

interface ContactRequest {
  id: string;
  request_no: number;
  full_name: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  admin_note: string | null;
  created_at: string;
}

const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "new", label: "جديد", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "in_progress", label: "جاري المتابعة", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "contacted", label: "تم التواصل", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { value: "in_development", label: "جاري البرمجة", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "on_hold", label: "معلّق", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "completed", label: "مكتمل", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "cancelled", label: "ملغى", color: "bg-red-100 text-red-700 border-red-200" },
];

const statusMeta = (v: string) =>
  STATUS_OPTIONS.find((s) => s.value === v) ?? STATUS_OPTIONS[0];

function OrdersAdmin() {
  const { rows, loading, error, save, remove } = useAdminTable<ContactRequest>("contact_requests");
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!q) return true;
      return (
        r.full_name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        String(r.request_no).includes(q) ||
        (r.message ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const s of STATUS_OPTIONS) c[s.value] = 0;
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  return (
    <AdminSection
      title="الطلبات"
      description="جميع طلبات التواصل الواردة من الموقع. يمكنك تحديث الحالة وإضافة ملاحظات لفريق العمل."
    >
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            filter === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40"
          }`}
        >
          الكل ({counts.all})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              filter === s.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            {s.label} ({counts[s.value] ?? 0})
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، الجوال، البريد، أو رقم الطلب..."
          className="pe-10"
        />
      </div>

      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 py-10 text-center text-sm text-muted-foreground">
          لا توجد طلبات مطابقة.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <OrderCard key={r.id} item={r} onSave={save} onRemove={remove} />
          ))}
        </div>
      )}
    </AdminSection>
  );
}

function OrderCard({
  item,
  onSave,
  onRemove,
}: {
  item: ContactRequest;
  onSave: (row: Partial<ContactRequest>) => Promise<unknown>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState(item.admin_note ?? "");
  const [saving, setSaving] = useState(false);
  const meta = statusMeta(status);

  const dirty = status !== item.status || (note || "") !== (item.admin_note ?? "");

  const doSave = async () => {
    setSaving(true);
    try {
      await onSave({ id: item.id, status, admin_note: note || null });
    } finally {
      setSaving(false);
    }
  };

  const date = new Date(item.created_at).toLocaleString("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-primary" dir="ltr">
            #{item.request_no}
          </span>
          <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${meta.color}`}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {date}
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-5 p-5 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-bold text-muted-foreground">الاسم</div>
            <div className="mt-0.5 text-base font-semibold text-foreground">{item.full_name}</div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${item.phone}`} className="text-sm font-medium text-foreground hover:text-primary" dir="ltr">
              {item.phone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${item.email}`} className="text-sm font-medium text-foreground hover:text-primary" dir="ltr">
              {item.email}
            </a>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-muted-foreground">الموضوع</div>
          <p className="mt-1 whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
            {item.message}
          </p>
        </div>
      </div>

      {/* Admin controls */}
      <div className="grid gap-4 border-t border-border bg-muted/20 p-5 md:grid-cols-[240px_1fr_auto] md:items-end">
        <div>
          <Label>الحالة</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>ملاحظة الفريق</Label>
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="اكتب ملاحظة داخلية لفريق العمل..."
            className="mt-1.5"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={saving || !dirty} onClick={doSave}>
            {saving ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Save className="ms-2 h-4 w-4" />}
            حفظ
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => {
              if (confirm(`حذف الطلب #${item.request_no}؟`)) void onRemove(item.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
