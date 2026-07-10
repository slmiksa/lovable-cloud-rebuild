import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Palette } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { refreshSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/adminpanel/branding")({
  component: BrandingPage,
});

function BrandingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("logo_url,favicon_url")
        .eq("id", true)
        .maybeSingle();
      setLogoUrl(data?.logo_url ?? null);
      setFaviconUrl(data?.favicon_url ?? null);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ id: true, logo_url: logoUrl, favicon_url: faviconUrl }, { onConflict: "id" });
      if (error) throw error;
      await refreshSiteSettings();
      toast.success("تم حفظ الهوية البصرية بنجاح");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">الهوية البصرية</h1>
          <p className="text-sm text-muted-foreground">
            ارفع شعار الموقع وأيقونة المتصفح (Favicon). التغييرات تُطبَّق فوراً على جميع صفحات الموقع.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-1 text-base font-bold text-foreground">شعار الموقع (Logo)</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            يظهر في الهيدر والفوتر ونافذة الواتساب. يفضّل PNG شفاف بمقاس 512×512 على الأقل.
          </p>
          <ImageUpload
            value={logoUrl}
            onChange={(url) => setLogoUrl(url ?? null)}
            aspect="square"
            label="شعار الموقع"
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-1 text-base font-bold text-foreground">أيقونة المتصفح (Favicon)</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            تظهر في تبويب المتصفح والمفضلة. يفضّل PNG مربع بمقاس 256×256 أو أعلى.
          </p>
          <ImageUpload
            value={faviconUrl}
            onChange={(url) => setFaviconUrl(url ?? null)}
            aspect="square"
            label="أيقونة المتصفح"
          />
        </div>
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
  );
}
