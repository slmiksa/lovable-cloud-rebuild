import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getPublicClients, type PublicClient } from "@/lib/public.functions";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "عملاؤنا — Lamha Secure" },
      { name: "description", content: "قائمة شركاء وعملاء Lamha Secure في الأمن السيبراني والحلول التقنية." },
    ],
  }),
  loader: () => getPublicClients(),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center font-arabic" dir="rtl">حدث خطأ في التحميل: {error.message}</div>
  ),
  component: ClientsPage,
});

function clientShort(name: string): string {
  const caps = name.match(/[A-Z]/g);
  if (caps && caps.length >= 2) return caps.slice(0, 2).join("");
  return name.replace(/\s/g, "").slice(0, 2).toUpperCase();
}

function ClientsPage() {
  const clients = Route.useLoaderData() as PublicClient[];
  return (
    <div className="min-h-screen bg-white font-arabic text-[var(--ink)]" dir="rtl">
      <SiteHeader active="clients" />

      <section className="bg-gradient-to-l from-[var(--purple)] to-[var(--purple-dark)] py-16 text-white">
        <div className="mx-auto max-w-[1400px] px-5 text-center md:px-10">
          <div className="text-sm font-bold tracking-widest text-[var(--brand)]">شركاؤنا</div>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">عملاؤنا</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-white/85">
            نفخر بثقة عملائنا من مختلف القطاعات في حماية أعمالهم الرقمية وتطوير حلولهم التقنية.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
        {clients.length === 0 ? (
          <p className="text-center text-[var(--ink-soft)]">لا يوجد عملاء لعرضهم حالياً.</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {clients.map((c) => (
              <div key={c.id} className="flex h-36 flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm grayscale transition hover:-translate-y-1 hover:border-[var(--brand)]/40 hover:shadow-md hover:grayscale-0">
                {c.logo_url ? (
                  <img src={c.logo_url} alt={c.name} className="h-14 w-14 rounded-xl object-contain" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--purple)]/10 text-lg font-black text-[var(--purple)]">
                    {clientShort(c.name)}
                  </div>
                )}
                <div className="text-center text-sm font-bold text-[var(--ink)]">{c.name}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
