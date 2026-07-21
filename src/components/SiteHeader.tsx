import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "./LogoMark";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function SiteHeader({ active }: { active?: "home" | "services" | "systems" | "clients" | "about" | "contact" }) {
  const [open, setOpen] = useState(false);
  const { logo_url } = useSiteSettings();
  const navItems: { id: NonNullable<typeof active>; label: string; href: string; to?: undefined }[] | { id: NonNullable<typeof active>; label: string; to: string; href?: undefined }[] = [
    { id: "home", label: "الرئيسية", to: "/" },
    { id: "about", label: "من نحن", to: "/about" },
    { id: "services", label: "خدماتنا", href: "/#services" },
    { id: "systems", label: "تطبيقاتنا", to: "/systems" },
    { id: "clients", label: "عملاؤنا", to: "/clients" },
    { id: "contact", label: "تواصل معنا", href: "/#contact" },
  ] as any;

  return (
    <header className="font-arabic" dir="rtl">
      {/* Main nav */}
      <div className="border-b border-[var(--line)] bg-white">
        <div className="relative mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 md:px-10 md:py-4">
          {/* Logo (right in RTL) */}
          <Link to="/" className="flex min-w-0 items-center">
            {logo_url ? (
              <LogoMark className="h-24 w-24 shrink-0 sm:h-28 sm:w-28 md:h-40 md:w-40 lg:h-48 lg:w-48" />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-dark)] shadow-[0_8px_18px_-8px_color-mix(in_oklab,var(--brand)_35%,transparent)] md:h-24 md:w-24">
                <LogoMark className="h-12 w-12 text-white md:h-14 md:w-14" />
              </div>
            )}
          </Link>

          {/* Centered navigation (absolutely centered on page) */}
          <nav className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-7 whitespace-nowrap text-[15px] font-bold text-[var(--ink)] lg:flex">
            {navItems.map((it) => {
              const cls = `pointer-events-auto transition hover:text-[var(--brand)] ${active === it.id ? "text-[var(--brand)]" : ""}`;
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

          {/* Mobile menu button (far left in RTL) */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-soft)] transition hover:text-[var(--brand)] lg:hidden"
            aria-label="القائمة"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
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

