import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  SystemCard,
  SystemDialogContent,
  toSystemItem,
  type SystemItem,
} from "@/lib/systems";
import { getIcon } from "@/lib/icons";
import {
  getPublicHome,
  type PublicClient,
  type PublicNews,
  type PublicOffer,
  type PublicService,
  type PublicSlide,
  type PublicSystem,
} from "@/lib/public.functions";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog as SuccessDialog, DialogContent as SuccessDialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LamhaSec for Technical Solutions — لمحة الآمنة للحلول التقنية" },
      { name: "description", content: "لمحة الآمنة للحلول التقنية: خدمات سيبرانية متكاملة وحلول تقنية وبرمجية واستشارات لحماية أعمالك وتسريع نموّها الرقمي." },
      { property: "og:title", content: "LamhaSec for Technical Solutions — لمحة الآمنة للحلول التقنية" },
      { property: "og:description", content: "خدمات سيبرانية، حلول تقنية وبرمجية، واستشارات." },
    ],
  }),
  loader: () => getPublicHome(),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center font-arabic" dir="rtl">حدث خطأ في التحميل: {error.message}</div>
  ),
  component: Index,
});

function clientShort(name: string): string {
  const caps = name.match(/[A-Z]/g);
  if (caps && caps.length >= 2) return caps.slice(0, 2).join("");
  return name.replace(/\s/g, "").slice(0, 2).toUpperCase();
}

function parseOffer(desc: string | null): { note: string; features: string[] } {
  const lines = (desc ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  let note = "";
  const features: string[] = [];
  for (const l of lines) {
    if (/^[-•]/.test(l)) features.push(l.replace(/^[-•]\s*/, ""));
    else if (!note) note = l;
    else features.push(l);
  }
  return { note, features };
}

function Index() {
  const { slides, services, offers, systems, clients, news } = Route.useLoaderData() as {
    slides: PublicSlide[];
    services: PublicService[];
    offers: PublicOffer[];
    systems: PublicSystem[];
    clients: PublicClient[];
    news: PublicNews[];
    socialLinks: import("@/lib/public.functions").PublicSocialLink[];
  };
  const [active, setActive] = useState(0);
  const [openSystem, setOpenSystem] = useState<SystemItem | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const systemItems = systems.map((s, i) => toSystemItem(s, i));
  const slide: PublicSlide | undefined = slides[active];

  return (
    <div className="min-h-screen font-arabic bg-white text-[var(--ink)]">
      <SiteHeader active="home" />

      {/* Hero slider — full-bleed dark image with overlay */}
      <section id="home" className="relative overflow-hidden text-white" dir="rtl">
        <div className="relative h-[560px] md:h-[640px]">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
            >
              {s.image_url && (
                <img src={s.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(265deg, rgba(15,10,40,0.35) 0%, rgba(30,12,60,0.75) 45%, rgba(20,8,45,0.92) 100%)",
                }}
              />
            </div>
          ))}

          <div className="relative mx-auto flex h-full max-w-[1400px] items-center px-5 md:px-10">
            <div className="max-w-2xl">
              <div className="text-sm font-bold tracking-widest text-white/80">أهلاً بك في LamhaSec — لمحة الآمنة للحلول التقنية</div>
              <h1 className="mt-4 whitespace-pre-line text-4xl font-black leading-[1.12] tracking-tight md:text-6xl lg:text-[68px]">
                {slide?.title}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-loose text-white/85 md:text-lg">{slide?.subtitle}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={slide?.cta_url || "#contact"}
                  className="rounded-md bg-gradient-to-b from-[var(--brand)] to-[var(--brand-dark)] px-9 py-3.5 text-base font-extrabold text-white shadow-[0_10px_24px_-8px_color-mix(in_oklab,var(--brand)_45%,transparent)] transition hover:brightness-110"
                >
                  {slide?.cta_label || "اكتشف حلول LamhaSec"}
                </a>
                <a
                  href="#services"
                  className="rounded-md border-2 border-white/80 px-9 py-3 text-base font-extrabold text-white transition hover:bg-white hover:text-[var(--purple)]"
                >
                  تعرّف على خدماتنا
                </a>
              </div>
            </div>
          </div>

          {/* Slider arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)}
                aria-label="السابق"
                className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:flex"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <button
                onClick={() => setActive((i) => (i + 1) % slides.length)}
                aria-label="التالي"
                className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:flex"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Service circles row connected by orange line */}
        <ServiceCircles services={services} />
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24" dir="rtl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
            <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
            خدماتنا
          </div>
          <h2 className="mt-3 text-3xl font-black text-[var(--purple)] md:text-5xl">حلول متكاملة لأمنك الرقمي</h2>
          <p className="mt-4 text-base text-[var(--ink-soft)] md:text-lg">
            نقدم باقة شاملة من خدمات الأمن السيبراني والحلول التقنية والبرمجية والاستشارات لحماية أعمالك ودعم نموها بثقة.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = getIcon(s.icon);
            return (
              <div
                key={s.id}
                className="group rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-[var(--brand)]/40 hover:shadow-[0_18px_40px_-20px_color-mix(in_oklab,var(--brand)_30%,transparent)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)] transition group-hover:bg-gradient-to-br group-hover:from-[var(--brand)] group-hover:to-[var(--brand-dark)] group-hover:text-white">
                  <Icon className="h-7 w-7" strokeWidth={2} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[var(--purple)]">{s.title}</h3>
                <p className="mt-2 text-sm leading-loose text-[var(--ink-soft)]">{s.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Promo / Offer cards */}
      {offers.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pb-6 md:px-10" dir="rtl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
              <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
              أحدث عروضنا
            </div>
            <h3 className="mt-2 text-2xl font-black text-[var(--purple)] md:text-3xl">باقات مصمّمة لحماية مؤسستك</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {offers.map((o) => (
              <PromoCard key={o.id} offer={o} />
            ))}
          </div>
        </section>
      )}

      {/* Systems */}
      {systemItems.length > 0 && (
        <section id="systems" className="mx-auto max-w-[1400px] px-5 pb-6 pt-20 md:px-10" dir="rtl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
              <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
              منصاتنا
            </div>
            <h3 className="mt-2 text-2xl font-black text-[var(--purple)] md:text-3xl">تطبيقاتنا وأنظمتنا</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--ink-soft)] md:text-base">
              اضغط على أي نظام لعرض تفاصيله. تعمل جميع منصاتنا بشكل متكامل لحماية مؤسستك من جميع الزوايا.
            </p>
          </div>
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {systemItems.slice(0, 4).map((sys) => (
              <SystemCard key={sys.id} system={sys} onOpen={() => setOpenSystem(sys)} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              to="/systems"
              className="inline-flex items-center gap-2 rounded-md border-2 border-[var(--brand)] bg-white px-8 py-3 text-base font-bold text-[var(--brand)] transition hover:bg-[var(--brand)] hover:text-white"
            >
              <span>مشاهدة الكل</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Clients band */}
      {clients.length > 0 && (
        <section className="bg-[oklch(0.98_0.005_270)] py-14" dir="rtl">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
                <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                عملاء LamhaSec
              </div>
              <h3 className="mt-2 text-2xl font-black text-[var(--purple)] md:text-3xl">يثقون بنا</h3>
            </div>
            <ClientsCarousel clients={clients} />
            <div className="mt-6 flex justify-center">
              <Link
                to="/clients"
                className="rounded-md border border-[var(--brand)] bg-white px-6 py-2.5 text-sm font-bold text-[var(--brand)] transition hover:bg-[var(--brand)] hover:text-white"
              >
                عرض الكل
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* News-style cards */}
      {news.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pb-20 md:px-10" dir="rtl">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-black text-[var(--purple)] md:text-3xl">أهم أخبار LamhaSec</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {news.slice(0, 3).map((n: PublicNews) => (
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
        </section>
      )}

      {/* Contact CTA */}
      <section id="contact" className="bg-gradient-to-l from-[var(--purple)] to-[var(--purple-dark)] py-16 text-white" dir="rtl">
        <div className="mx-auto grid max-w-[1400px] items-center gap-6 px-5 md:grid-cols-[1fr_auto] md:px-10">
          <div>
            <h3 className="text-2xl font-black md:text-4xl">جاهزون لحماية مؤسستك؟</h3>
            <p className="mt-3 text-white/85 md:text-lg">
              تواصل مع فريق LamhaSec للحصول على تقييم مجاني لوضعك الأمني والتقني الحالي.
            </p>
          </div>
          <a href="mailto:info@lamhasec.com" className="justify-self-start rounded-md bg-gradient-to-b from-[var(--brand)] to-[var(--brand-dark)] px-10 py-4 text-lg font-extrabold text-white shadow-[0_10px_24px_-8px_color-mix(in_oklab,var(--brand)_45%,transparent)] transition hover:brightness-110 md:justify-self-end">
            تواصل معنا الآن
          </a>
        </div>
      </section>

      <SiteFooter />

      <WhatsAppWidget />

      <Dialog open={!!openSystem} onOpenChange={(o) => !o && setOpenSystem(null)}>
        <DialogContent
          className="max-w-2xl border border-[var(--line)] bg-white p-0 text-[var(--ink)] sm:rounded-3xl"
          dir="rtl"
        >
          {openSystem && <SystemDialogContent system={openSystem} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServiceCircles({ services }: { services: { id: string; title: string; icon: string | null }[] }) {
  const items = services.slice(0, 4);
  if (items.length === 0) return <div className="h-6" />;
  return (
    <div className="relative -mt-12 md:-mt-16">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <div className="relative">
          <div className="absolute left-[10%] right-[10%] top-[55px] hidden h-[3px] bg-[var(--brand)] md:block" />
          <div className="relative grid grid-cols-2 gap-6 md:grid-cols-4">
            {items.map((it) => {
              const Icon = getIcon(it.icon);
              return (
                <div key={it.id} className="flex flex-col items-center text-center">
                  <div className="flex h-[110px] w-[110px] items-center justify-center rounded-full border-[6px] border-[var(--brand)] bg-white shadow-[0_12px_30px_-12px_color-mix(in_oklab,var(--brand)_40%,transparent)]">
                    <Icon className="h-12 w-12 text-[var(--brand)]" strokeWidth={1.8} />
                  </div>
                  <div className="mt-4 text-base font-extrabold text-[var(--purple)]">{it.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PromoCard({ offer }: { offer: PublicOffer }) {
  const { note, features } = parseOffer(offer.description);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-[var(--purple-light)] via-[var(--purple)] to-[var(--purple-dark)] p-8 text-white shadow-[0_20px_50px_-20px_rgba(60,20,90,0.6)]">
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5" />
      <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/[0.04]" />
      <div className="relative grid items-center gap-6 md:grid-cols-2">
        <ul className="space-y-2.5 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-emerald-300" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="text-right">
          {offer.badge && (
            <span className="inline-block rounded-md border border-white/30 px-3 py-1 text-xs font-bold">{offer.badge}</span>
          )}
          <h4 className="mt-3 text-2xl font-black leading-tight">{offer.title}</h4>
          {note && <p className="mt-4 text-sm leading-relaxed text-white/80">{note}</p>}
          {offer.price && <p className="mt-2 text-lg font-black text-emerald-300">{offer.price}</p>}
          <button className="mt-5 rounded-md border border-white px-6 py-2 text-sm font-bold transition hover:bg-white hover:text-[var(--purple)]">
            اشترك الآن
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  return (
    <div className="flex h-28 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 grayscale transition hover:grayscale-0 hover:border-[var(--brand)]/40">
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="h-12 w-12 rounded-xl object-contain" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--purple)]/10 text-base font-black text-[var(--purple)]">
          {clientShort(name)}
        </div>
      )}
      <div className="text-center text-xs font-bold tracking-wide text-[var(--ink)] md:text-sm">{name}</div>
    </div>
  );
}

function ClientsCarousel({ clients }: { clients: PublicClient[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, scroll: 0, moved: false });

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, scroll: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.scroll - dx;
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    drag.current.down = false;
    try { el.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <div
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="grid auto-cols-[calc((100%-4*1rem)/5)] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain cursor-grab active:cursor-grabbing select-none touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {clients.map((c) => (
          <ClientLogo key={c.id} name={c.name} logoUrl={c.logo_url} />
        ))}
      </div>
    </div>
  );
}
