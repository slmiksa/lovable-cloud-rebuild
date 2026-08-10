import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// WhatsApp widget is now mounted globally in the root layout.
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
  type PublicCircle,
  type PublicClient,
  type PublicNews,
  type PublicOffer,
  type PublicService,
  type PublicSlide,
  type PublicSystem,
  type PublicCertification,
  type SectionTextsMap,
} from "@/lib/public.functions";
import { ArrowLeft, Check, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog as SuccessDialog, DialogContent as SuccessDialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lamha Secure for Technical Solutions — لمحة الآمنة للحلول التقنية" },
      { name: "description", content: "لمحة الآمنة للحلول التقنية: خدمات سيبرانية متكاملة وحلول تقنية وبرمجية واستشارات لحماية أعمالك وتسريع نموّها الرقمي." },
      { property: "og:title", content: "Lamha Secure for Technical Solutions — لمحة الآمنة للحلول التقنية" },
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

function SectionHeader({
  data,
  size = "md",
}: {
  data: import("@/lib/public.functions").PublicSectionText | null;
  size?: "sm" | "md" | "lg";
}) {
  const eyebrow = data?.eyebrow?.trim() || null;
  const title = data?.title?.trim() || null;
  const description = data?.description?.trim() || null;
  const iconName = data?.icon?.trim() || null;
  const Icon = iconName ? getIcon(iconName) : null;
  if (!eyebrow && !title && !description) return null;
  const titleCls =
    size === "lg"
      ? "mt-3 text-3xl font-black text-[var(--purple)] md:text-5xl"
      : "mt-2 text-2xl font-black text-[var(--purple)] md:text-3xl";
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
          {Icon ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
              <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
          )}
          {eyebrow}
        </div>
      )}
      {title && <h2 className={titleCls}>{title}</h2>}
      {description && (
        <p className="mt-3 text-sm text-[var(--ink-soft)] md:text-base whitespace-pre-line">{description}</p>
      )}
    </div>
  );
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
  const { slides, services, offers, systems, clients, news, circles, sections, certifications } = Route.useLoaderData() as {
    slides: PublicSlide[];
    services: PublicService[];
    offers: PublicOffer[];
    systems: PublicSystem[];
    clients: PublicClient[];
    news: PublicNews[];
    circles: PublicCircle[];
    sections: SectionTextsMap;
    certifications: PublicCertification[];
    socialLinks: import("@/lib/public.functions").PublicSocialLink[];
  };
  const [openSystem, setOpenSystem] = useState<SystemItem | null>(null);
  const sec = (k: string) => sections?.[k] ?? null;

  const systemItems = systems.map((s, i) => toSystemItem(s, i));

  return (
    <div className="min-h-screen font-arabic bg-transparent text-[var(--ink)]">
      <SiteHeader active="home" />

      {/* Hero slider */}
      <section id="home" className="relative bg-white pt-4 pb-2 md:pt-6" dir="rtl">
        <HeroSlider slides={slides} />
      </section>

      {/* Standalone home circles section */}
      {circles.length > 0 && (
        <section className="bg-white py-10 md:py-14" dir="rtl">
          <HomeCircles items={circles} />
        </section>
      )}



      {/* Services */}
      <section id="services" className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24" dir="rtl">
        <SectionHeader
          data={sec("services")}
          size="lg"
        />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = getIcon(s.icon);
            return (
              <div
                key={s.id}
                className="group rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:border-[var(--brand)]/40 hover:shadow-[0_18px_40px_-20px_color-mix(in_oklab,var(--brand)_30%,transparent)]"
              >
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)] transition group-hover:bg-gradient-to-br group-hover:from-[var(--brand)] group-hover:to-[var(--brand-dark)] group-hover:text-white">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.title} loading="lazy" className="h-full w-full object-contain p-1.5" />
                  ) : (
                    <Icon className="h-7 w-7" strokeWidth={2} />
                  )}
                </div>
                <h3 className="mt-5 text-xl font-bold text-[var(--purple)]">{s.title}</h3>
                <p className="mt-2 text-sm leading-loose text-[var(--ink-soft)] whitespace-pre-line">{s.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Promo / Offer cards */}
      {offers.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 pb-6 md:px-10" dir="rtl">
          <SectionHeader
            data={sec("offers")}
          />
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {systemItems.slice(0, 4).map((sys) => (
              <SystemCard key={sys.id} system={sys} onOpen={() => setOpenSystem(sys)} />
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              to="/systems"
              className="rounded-md border border-[var(--brand)] bg-white px-6 py-2.5 text-sm font-bold text-[var(--brand)] transition hover:bg-[var(--brand)] hover:text-white"
            >
              عرض الكل
            </Link>
          </div>
        </section>
      )}

      {/* Clients band */}
      {clients.length > 0 && (
        <section className="bg-[oklch(0.98_0.005_270)] py-14" dir="rtl">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <SectionHeader
              data={sec("clients")}
        />
        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-4 md:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
            {items.map((c) => {
              const inner = c.logo_url ? (
                <img
                  src={c.logo_url}
                  alt={c.name}
                  loading="lazy"
                  className="h-16 w-16 object-contain md:h-20 md:w-20"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--brand)]/10 text-sm font-black text-[var(--brand)] md:h-20 md:w-20">
                  {c.name.slice(0, 2)}
                </div>
              );
              return (
                <div
                  key={c.id}
                  className="flex h-28 flex-col items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 transition hover:border-[var(--brand)]/40 md:h-32"
                >
                  {c.website_url ? (
                    <a href={c.website_url} target="_blank" rel="noreferrer" aria-label={c.name} className="flex flex-col items-center gap-2">
                      {inner}
                      <span className="line-clamp-2 text-center text-[11px] font-bold leading-tight text-[var(--ink)] md:text-xs">
                        {c.name}
                      </span>
                    </a>
                  ) : (
                    <>
                      {inner}
                      <span className="line-clamp-2 text-center text-[11px] font-bold leading-tight text-[var(--ink)] md:text-xs">
                        {c.name}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


function ContactSection({ sectionData }: { sectionData?: import("@/lib/public.functions").PublicSectionText | null } = {}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ requestNo: number } | null>(null);

  const maxMsg = 700;

  const eyebrow = sectionData?.eyebrow?.trim() || null;
  const title = sectionData?.title?.trim() || null;
  const description = sectionData?.description?.trim() || null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    const digits = phone.replace(/\D/g, "");
    const trimmedEmail = email.trim();
    const trimmedMsg = message.trim();
    if (trimmedName.length < 2) return setError("الرجاء إدخال الاسم الكامل");
    if (digits.length < 9) return setError("الرجاء إدخال رقم جوال صحيح");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return setError("البريد الإلكتروني غير صحيح");
    if (trimmedMsg.length < 1) return setError("الرجاء كتابة الموضوع");
    if (trimmedMsg.length > maxMsg) return setError(`الموضوع يجب ألا يتجاوز ${maxMsg} حرف`);

    const fullPhone = digits.startsWith("966") ? `+${digits}` : `+966${digits.replace(/^0+/, "")}`;

    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: requestNo, error: dbError } = await (supabase as any).rpc("submit_contact_request", {
      p_full_name: trimmedName,
      p_phone: fullPhone,
      p_email: trimmedEmail,
      p_message: trimmedMsg,
    });

    if (dbError || !requestNo) {
      setSubmitting(false);
      setError("تعذّر إرسال الطلب، حاول لاحقاً");
      return;
    }

    setSubmitting(false);
    setSuccess({ requestNo: Number(requestNo) });
    setName("");
    setPhone("");
    setEmail("");
    setMessage("");
  };

  return (
    <section
      id="contact"
      dir="rtl"
      className="relative overflow-hidden bg-gradient-to-l from-[var(--purple)] to-[var(--purple-dark)] py-20 text-white"
    >
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="relative mx-auto max-w-[1100px] px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white/90 backdrop-blur">
              {eyebrow}
            </span>
            <h3 className="mt-4 text-3xl font-black leading-tight md:text-5xl">{title}</h3>
            <p className="mt-4 whitespace-pre-line text-white/85 md:text-lg">
              {description}
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:p-8"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-white/90">الاسم الكامل *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/95 px-4 py-3 text-[var(--ink)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40"
                  placeholder="الاسم الكامل"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-white/90">رقم الجوال *</label>
                <div className="flex overflow-hidden rounded-lg border border-white/20 bg-white/95 focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/40">
                  <span className="flex items-center gap-2 border-e border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700" dir="ltr">
                    <span className="text-lg">🇸🇦</span>
                    +966
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                    required
                    dir="ltr"
                    inputMode="numeric"
                    className="w-full bg-transparent px-4 py-3 text-[var(--ink)] outline-none placeholder:text-slate-400"
                    placeholder="5XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-white/90">البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={200}
                  required
                  dir="ltr"
                  className="w-full rounded-lg border border-white/20 bg-white/95 px-4 py-3 text-[var(--ink)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40"
                  placeholder="example@domain.com"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-sm font-bold text-white/90">
                  <span>الموضوع *</span>
                  <span className="text-xs font-normal text-white/70">{message.length}/{maxMsg}</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, maxMsg))}
                  rows={5}
                  required
                  maxLength={maxMsg}
                  className="w-full resize-none rounded-lg border border-white/20 bg-white/95 px-4 py-3 text-[var(--ink)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40"
                  placeholder="اكتب موضوع طلبك هنا..."
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-300/40 bg-red-500/20 px-4 py-2.5 text-sm font-bold text-white">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[var(--brand)] to-[var(--brand-dark)] px-6 py-3.5 text-base font-extrabold text-white shadow-[0_10px_24px_-8px_color-mix(in_oklab,var(--brand)_60%,transparent)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessDialog open={!!success} onOpenChange={(o) => !o && setSuccess(null)}>
        <SuccessDialogContent
          className="max-w-md border border-[var(--line)] bg-white p-0 text-[var(--ink)] sm:rounded-3xl"
          dir="rtl"
        >
          <div className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" strokeWidth={2.5} />
            </div>
            <h4 className="text-2xl font-black text-[var(--purple)]">تم استلام طلبك بنجاح</h4>
            <p className="mt-3 text-[var(--ink-soft)]">
              سوف يتم التواصل معكم قريباً.
            </p>
            <button
              onClick={() => setSuccess(null)}
              className="mt-6 w-full rounded-lg bg-[var(--purple)] px-6 py-3 font-bold text-white transition hover:brightness-110"
            >
              إغلاق
            </button>
          </div>
        </SuccessDialogContent>
      </SuccessDialog>
    </section>
  );
}
