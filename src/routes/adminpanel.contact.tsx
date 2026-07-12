import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { refreshSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/adminpanel/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("contact_phone,contact_email,contact_address")
        .eq("id", true)
        .maybeSingle();
      setPhone(data?.contact_phone ?? "");
      setEmail(data?.contact_email ?? "");
      setAddress(data?.contact_address ?? "");
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
            contact_phone: phone.trim() || null,
            contact_email: email.trim() || null,
            contact_address: address.trim() || null,
          },
          { onConflict: "id" },
        );
      if (error) throw error;
      await refreshSiteSettings();
      toast.success("تم حفظ بيانات التواصل");
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
          <Phone className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">بيانات التواصل</h1>
          <p className="text-sm text-muted-foreground">
            هذه البيانات تظهر في تذييل الموقع. اترك الحقل فارغاً لإخفائه.
          </p>
        </div>
      </div>

      <div className="grid gap-5 rounded-xl border border-border bg-card p-6 md:max-w-2xl">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">رقم الهاتف</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
            placeholder="800 304 0304"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
            placeholder="info@example.com"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">العنوان</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="الرياض، المملكة العربية السعودية"
            className={inputCls}
          />
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
