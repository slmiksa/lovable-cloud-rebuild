import { Link } from "@tanstack/react-router";
import {
  Phone,
  MapPin,
  Mail,
  Search,
  Menu,
  X,
  Circle,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { LogoMark } from "./LogoMark";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function SiteHeader({ active }: { active?: "home" | "services" | "systems" | "clients" | "contact" }) {
  const [open, setOpen] = useState(false);
  const { logo_url } = useSiteSettings();
  const navItems: { id: NonNullable<typeof active>; label: string; href: string; to?: undefined }[] | { id: NonNullable<typeof active>; label: string; to: string; href?: undefined }[] = [
    { id: "home", label: "الرئيسية", to: "/" },
    { id: "services", label: "خدماتنا", href: "/#services" },
    { id: "systems", label: "تطبيقاتنا", to: "/systems" },
    { id: "clients", label: "عملاؤنا", to: "/clients" },
    { id: "contact", label: "تواصل معنا", href: "/#contact" },
  ] as any;

  return (
    <header className="font-arabic" dir="rtl">
      {/* Top utility strip */}
      <div className="bg-[var(--purple)] text-white text-[12px]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-5 py-2 md:px-10">
          <div className="flex items-center gap-3">
            <SocialDot label="LinkedIn">in</SocialDot>
            <SocialDot label="Instagram">ig</SocialDot>
            <SocialDot label="X">x</SocialDot>
            <SocialDot label="Facebook">f</SocialDot>
            <span className="hidden items-center gap-1 opacity-90 md:flex">
              <Circle className="h-2.5 w-2.5 animate-pulse fill-emerald-400 text-emerald-400" />
              <span>حالة الخدمة:</span>
              <span className="font-bold">جميع الأنظمة تعمل</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="tel:8003040304" className="flex items-center gap-1.5 hover:underline">
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr">800 304 0304</span>
            </a>
            <span className="hidden items-center gap-1.5 md:flex">
              <MapPin className="h-3.5 w-3.5" />
              <span>الرياض، المملكة العربية السعودية</span>
            </span>
            <a href="mailto:info@lamhasec.com" className="hidden items-center gap-1.5 hover:underline md:flex">
              <Mail className="h-3.5 w-3.5" />
              <span>info@lamhasec.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 md:px-10 md:py-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            {logo_url ? (
              <LogoMark className="h-14 w-14 shrink-0 md:h-16 md:w-16" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] shadow-[0_8px_18px_-8px_color-mix(in_oklab,var(--brand)_35%,transparent)]">
                <LogoMark className="h-7 w-7 text-white" />
              </div>
            )}
            <div className="min-w-0 leading-tight">
              <div className="truncate text-base font-extrabold tracking-wider text-[var(--purple)] md:text-lg">LamhaSec</div>
              <div className="truncate text-[10px] tracking-[0.12em] text-[var(--ink-soft)]">لمحة الآمنة للحلول التقنية</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[15px] font-bold text-[var(--ink)] lg:flex">
            {navItems.map((it) => {
              const cls = `transition hover:text-[var(--brand)] ${active === it.id ? "text-[var(--brand)]" : ""}`;
              return it.to ? (
                <Link key={it.id} to={it.to} className={cls}>
                  <span className="inline-flex items-center gap-1">
                    {it.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </span>
                </Link>
              ) : (
                <a key={it.id} href={it.href} className={cls}>
                  <span className="inline-flex items-center gap-1">
                    {it.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </span>
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button className="hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-soft)] transition hover:text-[var(--brand)] md:flex" aria-label="بحث">
              <Search className="h-5 w-5" />
            </button>
            <a
              href="/#contact"
              className="whitespace-nowrap rounded-md bg-gradient-to-b from-[var(--brand)] to-[var(--brand-dark)] px-4 py-2 text-xs font-extrabold text-white shadow-[0_8px_18px_-8px_color-mix(in_oklab,var(--brand)_40%,transparent)] transition hover:brightness-110 sm:px-6 sm:py-2.5 sm:text-sm"
            >
              ابدأ الآن
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-soft)] transition hover:text-[var(--brand)] lg:hidden"
              aria-label="القائمة"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-[var(--line)] bg-white lg:hidden">
            <nav className="mx-auto flex max-w-[1400px] flex-col px-5 py-3 text-[15px] font-bold text-[var(--ink)] md:px-10">
              {navItems.map((it) => {
                const cls = `flex items-center justify-between rounded-md px-3 py-3 transition hover:bg-[var(--line)]/40 hover:text-[var(--brand)] ${active === it.id ? "text-[var(--brand)]" : ""}`;
                return it.to ? (
                  <Link key={it.id} to={it.to} className={cls} onClick={() => setOpen(false)}>
                    <span>{it.label}</span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Link>
                ) : (
                  <a key={it.id} href={it.href} className={cls} onClick={() => setOpen(false)}>
                    <span>{it.label}</span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function SocialDot({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      aria-label={label}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-tight text-white transition hover:bg-white/25"
    >
      {children}
    </span>
  );
}
