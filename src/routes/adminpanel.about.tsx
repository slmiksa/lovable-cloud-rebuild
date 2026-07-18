import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/adminpanel/about")({
  component: AboutAdminPage,
});

function AboutAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("about_title,about_content")
        .eq("id", true)
        .maybeSingle();
      setTitle(data?.about_title ?? "");
      setContent(data?.about_content ?? "");
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            id: true,
            about_title: title.trim() || null,
            about_content: content || null,
          },
          { onConflict: "id" },
        );
      if (error) throw error;
      toast.success("تم حفظ نبذة عنا");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">نبذة عنا</h1>
          <p className="text-sm text-muted-foreground">
            العنوان والنص الذي يظهر في صفحة «نبذة عنا». يدعم النص الأسطر المتعددة — كل سطر جديد تكتبه سيظهر كما هو في الموقع.
          </p>
        </div>
      </div>

      <div className="grid gap-5 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">العنوان</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="نبذة عنا"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">النص</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder="اكتب نبذة عن الشركة هنا... يمكنك استخدام سطر جديد (Enter) لتقسيم الفقرات."
            className={`${inputCls} min-h-[320px] resize-y whitespace-pre-wrap leading-loose`}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            نصيحة: اضغط Enter لبدء سطر جديد، وسطرين فارغين لإنشاء فقرة جديدة.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} size="lg" className="min-w-40">
            {saving ? (
              <>
                <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                جارٍ الحفظ...
              </>
            ) : (
              <>
                <Save className="ms-2 h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
