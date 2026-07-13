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
      {/* Top utility strip hidden per request */}

      {/* Main nav */}
      <div className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 md:px-10 md:py-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            {logo_url ? (
              <LogoMark className="h-20 w-20 shrink-0 md:h-24 md:w-24" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] shadow-[0_8px_18px_-8px_color-mix(in_oklab,var(--brand)_35%,transparent)]">
                <LogoMark className="h-7 w-7 text-white" />
              </div>
            )}
            <div className="min-w-0 leading-tight">
              <div className="text-[10px] font-extrabold leading-tight tracking-wider text-[var(--purple)] sm:text-xs md:text-sm">
                <span className="block">Lamha Secure</span>
                <span className="block">for Technical Solutions</span>
              </div>
              <div className="truncate text-[9px] tracking-[0.12em] text-[var(--ink-soft)] sm:text-[10px]">لمحة الآمنة للحلول التقنية</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[15px] font-bold text-[var(--ink)] lg:flex">
            {navItems.map((it) => {
              const cls = `transition hover:text-[var(--brand)] ${active === it.id ? "text-[var(--brand)]" : ""}`;
              return it.to ? (
                <Link key={it.id} to={it.to} className={cls}>
                  {it.label}
                </Link>
              ) : (
                <a key={it.id} href={it.href} className={cls}>
                  {it.label}
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
                const cls = `rounded-md px-3 py-3 transition hover:bg-[var(--line)]/40 hover:text-[var(--brand)] ${active === it.id ? "text-[var(--brand)]" : ""}`;
                return it.to ? (
                  <Link key={it.id} to={it.to} className={cls} onClick={() => setOpen(false)}>
                    {it.label}
                  </Link>
                ) : (
                  <a key={it.id} href={it.href} className={cls} onClick={() => setOpen(false)}>
                    {it.label}
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
