import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "نبذة عنا — Lamha Secure" },
      { name: "description", content: "تعرّف على لمحة الآمنة للحلول التقنية ورؤيتنا ورسالتنا." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("نبذة عنا");
  const [content, setContent] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("about_title,about_content")
        .eq("id", true)
        .maybeSingle();
      if (data?.about_title) setTitle(data.about_title);
      setContent(data?.about_content ?? "");
      setLoading(false);
    })();
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-white font-arabic">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-14 md:px-10 md:py-20">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-gradient-to-l from-[var(--brand)] to-[var(--brand-dark)]" />
          <h1 className="text-3xl font-extrabold text-[var(--ink)] md:text-4xl">{title}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
          </div>
        ) : content.trim() ? (
          <article className="whitespace-pre-line rounded-2xl border border-[var(--line)] bg-white p-6 text-[17px] leading-[2.1] text-[var(--ink)] shadow-sm md:p-10">
            {content}
          </article>
        ) : (
          <p className="text-center text-[var(--ink-soft)]">لم يُضف محتوى بعد.</p>
        )}
      </main>
      <SiteFooter />
      <WhatsAppWidget />
    </div>
  );
}
