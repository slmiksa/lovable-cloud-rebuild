import type { ReactNode } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { getPublicNewsBySlug, type PublicNews, type PublicNewsFull } from "@/lib/public.functions";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const res = await getPublicNewsBySlug({ data: { slug: params.slug } });
    if (!res.item) throw notFound();
    return res as { item: PublicNewsFull; others: PublicNews[] };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.item
      ? [
          { title: `${loaderData.item.title} — Lamha Secure` },
          { name: "description", content: loaderData.item.excerpt ?? "" },
          { property: "og:title", content: loaderData.item.title },
          { property: "og:description", content: loaderData.item.excerpt ?? "" },
          ...(loaderData.item.image_url
            ? [{ property: "og:image", content: loaderData.item.image_url }]
            : []),
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen font-arabic bg-white text-[var(--ink)]" dir="rtl">
      <SiteHeader active="home" />
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <h1 className="text-3xl font-black text-[var(--purple)]">الخبر غير موجود</h1>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-[var(--brand)] font-bold">
          <ArrowLeft className="h-4 w-4" /> العودة للرئيسية
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center" dir="rtl">حدث خطأ: {error.message}</div>
  ),
  component: NewsDetail,
});

function renderInline(text: string) {
  // Tokenize markdown links [text](url) and bare URLs; render <a> for both.
  const nodes: (string | JSX.Element)[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const label = m[1] ?? m[3];
    const url = m[2] ?? m[3];
    nodes.push(
      <a
        key={key++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--brand)] font-semibold underline underline-offset-2 hover:opacity-80 break-all"
      >
        {label}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function NewsDetail() {
  const { item, others } = Route.useLoaderData() as { item: PublicNewsFull; others: PublicNews[] };

  return (
    <div className="min-h-screen font-arabic bg-white text-[var(--ink)]" dir="rtl">
      <SiteHeader active="home" />

      <article className="mx-auto max-w-[1000px] px-5 py-12 md:px-10 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة إلى الأخبار
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="rounded bg-[var(--brand)] px-3 py-1 text-xs font-bold text-white">أخبار</span>
          {item.date && (
            <span className="inline-flex items-center gap-1 text-sm text-[var(--ink-soft)]">
              <Calendar className="h-4 w-4" />
              {item.date}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--purple)] md:text-5xl">
          {item.title}
        </h1>

        {item.image_url && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)]">
            <img src={item.image_url} alt={item.title} className="h-auto w-full object-cover" />
          </div>
        )}

        <div className="prose prose-lg mt-8 max-w-none space-y-5 text-base leading-loose text-[var(--ink)] md:text-lg">
          {item.content.map((p, i) => {
            const md = p.match(/^!\[([^\]]*)\]\((\S+)\)$/);
            const bareImg = /^https?:\/\/\S+\.(png|jpe?g|webp|gif|svg)(\?\S*)?$/i.test(p);
            if (md) {
              return (
                <img
                  key={i}
                  src={md[2]}
                  alt={md[1]}
                  className="my-4 h-auto w-full rounded-2xl border border-[var(--line)] object-cover"
                />
              );
            }
            if (bareImg) {
              return (
                <img
                  key={i}
                  src={p}
                  alt=""
                  className="my-4 h-auto w-full rounded-2xl border border-[var(--line)] object-cover"
                />
              );
            }
            return (
              <p key={i} className="whitespace-pre-line">
                {renderInline(p)}
              </p>
            );
          })}
        </div>
      </article>

      {others.length > 0 && (
        <section className="border-t border-[var(--line)] bg-[oklch(0.98_0.005_270)] py-14">
          <div className="mx-auto max-w-[1200px] px-5 md:px-10">
            <h2 className="mb-8 text-2xl font-black text-[var(--purple)]">أخبار ذات صلة</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {others.map((n) => (
                <Link
                  key={n.slug}
                  to="/news/$slug"
                  params={{ slug: n.slug }}
                  className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm transition hover:shadow-lg"
                >
                  {n.image_url && (
                    <div className="h-44 overflow-hidden">
                      <img
                        src={n.image_url}
                        alt={n.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="rounded bg-[var(--brand)]/10 px-2 py-0.5 text-xs font-bold text-[var(--brand)]">أخبار</span>
                    <h3 className="mt-3 text-lg font-bold text-[var(--purple)]">{n.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
      <WhatsAppWidget />
    </div>
  );
}
