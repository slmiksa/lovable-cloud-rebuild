import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getPublicHome, type PublicNews } from "@/lib/public.functions";

export const Route = createFileRoute("/news/")({
  component: NewsIndex,
});

function NewsIndex() {
  const [news, setNews] = useState<PublicNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const d = await getPublicHome();
      if (!alive) return;
      setNews(d.news);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)]" dir="rtl">
      <SiteHeader active="news" />

      <section className="bg-gradient-to-l from-[var(--brand-dark)] to-[var(--brand)] py-14 text-white">
        <div className="mx-auto max-w-[1400px] px-5 text-center md:px-10">
          <div className="text-sm font-bold tracking-widest text-white/80">الأخبار</div>
          <h1 className="mt-3 text-3xl font-black md:text-5xl">أهم أخبار Lamha Secure</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 md:text-lg">
            تابع جديد المقالات والإعلانات في مجال الأمن السيبراني والحلول التقنية.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
          </div>
        ) : news.length === 0 ? (
          <p className="text-center text-[var(--ink-soft)]">لا توجد أخبار حالياً.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {news.map((n) => (
              <Link
                key={n.slug}
                to="/news/$slug"
                params={{ slug: n.slug }}
                className="group block overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden">
                  {n.image_url && (
                    <img
                      src={n.image_url}
                      alt={n.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute right-4 top-4 rounded bg-[var(--brand)] px-3 py-1 text-xs font-bold text-white shadow">
                    {n.date || "أخبار"}
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-bold text-[var(--purple)] group-hover:text-[var(--brand)]">
                    {n.title}
                  </h4>
                  <p className="mt-2 text-sm leading-loose text-[var(--ink-soft)]">{n.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[var(--brand)]">
                    اقرأ المزيد
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
