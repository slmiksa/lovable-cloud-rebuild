import { Link } from "@tanstack/react-router";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "./LogoMark";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function SiteHeader({ active }: { active?: "home" | "services" | "systems" | "clients" | "about" | "contact" }) {
  const [open, setOpen] = useState(false);
  const { logo_url } = useSiteSettings();
  const navItems: { id: NonNullable<typeof active>; label: string; href: string; to?: undefined }[] | { id: NonNullable<typeof active>; label: string; to: string; href?: undefined }[] = [
    { id: "home", label: "الرئيسية", to: "/" },
    { id: "services", label: "خدماتنا", href: "/#services" },
    { id: "systems", label: "تطبيقاتنا", to: "/systems" },
    { id: "clients", label: "عملاؤنا", to: "/clients" },
    { id: "about", label: "نبذة عنا", to: "/about" },
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
              <LogoMark className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 md:h-32 md:w-32 lg:h-40 lg:w-40" />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] shadow-[0_8px_18px_-8px_color-mix(in_oklab,var(--brand)_35%,transparent)] md:h-16 md:w-16">
                <LogoMark className="h-9 w-9 text-white md:h-10 md:w-10" />
              </div>
            )}
            <div className="hidden min-w-0 leading-tight md:block">
              <div className="text-xs font-extrabold leading-tight tracking-wider text-[var(--purple)] md:text-sm">
                <span className="block">Lamha Secure</span>
                <span className="block">for Technical Solutions</span>
              </div>
              <div className="truncate text-[10px] tracking-[0.12em] text-[var(--ink-soft)]">لمحة الآمنة للحلول التقنية</div>
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
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-soft)] transition hover:text-[var(--brand)] lg:hidden"
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
