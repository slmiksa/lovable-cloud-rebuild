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

export const Route = createFileRoute("/adminpanel/news")({
  component: NewsAdmin,
});

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  published_at: string | null;
  is_published: boolean;
}

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
}

function NewsAdmin() {
  const { rows, loading, error, save, remove } = useAdminTable<Article>("news");

  const addNew = () =>
    save({
      title: "مقال جديد",
      slug: `article-${Date.now()}`,
      is_published: false,
      published_at: new Date().toISOString(),
    });

  return (
    <AdminSection
      title="الأخبار (المدونة)"
      description="أضف أو عدّل مقالات الأخبار. محفوظة في قاعدة البيانات."
      action={
        <Button onClick={addNew}>
          <Plus className="ms-2 h-4 w-4" /> إضافة مقال
        </Button>
      }
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="space-y-4">
          {rows.map((it) => (
            <ArticleCard key={it.id} item={it} onSave={save} onRemove={remove} />
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">لا توجد مقالات بعد.</p>}
        </div>
      )}
    </AdminSection>
  );
}

function ArticleCard({
  item,
  onSave,
  onRemove,
}: {
  item: Article;
  onSave: (row: Partial<Article>) => Promise<unknown>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Article>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">مقال</span>
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>العنوان</Label>
          <Input
            value={draft.title}
            onChange={(e) => {
              const title = e.target.value;
              set({ title, slug: draft.slug ? draft.slug : slugify(title) });
            }}
          />
        </div>
        <div>
          <Label>الرابط (slug)</Label>
          <Input dir="ltr" value={draft.slug} onChange={(e) => set({ slug: e.target.value })} />
        </div>
        <div>
          <ImageUpload
            label="صورة المقال"
            value={draft.image_url}
            onChange={(url) => set({ image_url: url ?? null })}
          />
        </div>
        <div className="md:col-span-2">
          <Label>المقتطف</Label>
          <Textarea rows={2} value={draft.excerpt ?? ""} onChange={(e) => set({ excerpt: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Label>المحتوى</Label>
          <Textarea rows={5} value={draft.content ?? ""} onChange={(e) => set({ content: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.is_published} onChange={(e) => set({ is_published: e.target.checked })} />
          منشور
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
