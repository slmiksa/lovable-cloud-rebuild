import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Phone, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { refreshSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/adminpanel/contact")({
  component: ContactPage,
});

type SupportType = "whatsapp" | "email";

function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [supportType, setSupportType] = useState<SupportType>("whatsapp");
  const [supportValue, setSupportValue] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("contact_phone,contact_email,contact_address,support_type,support_value")
        .eq("id", true)
        .maybeSingle();
      setPhone(data?.contact_phone ?? "");
      setEmail(data?.contact_email ?? "");
      setAddress(data?.contact_address ?? "");
      const st = (data as { support_type?: string } | null)?.support_type;
      setSupportType(st === "email" ? "email" : "whatsapp");
      setSupportValue((data as { support_value?: string | null } | null)?.support_value ?? "");
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
            support_type: supportType,
            support_value: supportValue.trim() || null,
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

      <div className="grid gap-5 rounded-xl border border-border bg-card p-6 md:max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">زر الدعم الفوري</h2>
            <p className="text-sm text-muted-foreground">
              اختر نوع التواصل الذي يُفتح عند الضغط على الزر العائم.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">نوع التواصل</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSupportType("whatsapp")}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold transition ${
                supportType === "whatsapp"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              واتساب
            </button>
            <button
              type="button"
              onClick={() => setSupportType("email")}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold transition ${
                supportType === "email"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Mail className="h-4 w-4" />
              بريد إلكتروني
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-bold text-foreground">
            {supportType === "whatsapp" ? "رقم واتساب (بصيغة دولية بدون +)" : "البريد الإلكتروني للدعم"}
          </label>
          <input
            type="text"
            dir="ltr"
            value={supportValue}
            onChange={(e) => setSupportValue(e.target.value)}
            placeholder={supportType === "whatsapp" ? "966552553315" : "support@example.com"}
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
