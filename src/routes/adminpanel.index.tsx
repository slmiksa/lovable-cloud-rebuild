import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Images, Sparkles, Tag, AppWindow, Users, Newspaper, Share2 } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminSection";
import { adminList, type AdminTable } from "@/lib/admin.functions";

export const Route = createFileRoute("/adminpanel/")({
  component: AdminHome,
});

const cards: {
  to: string;
  table: AdminTable;
  label: string;
  icon: typeof Images;
  color: string;
  unit: string;
}[] = [
  { to: "/adminpanel/slides", table: "slides", label: "السلايدات", icon: Images, color: "bg-blue-500/10 text-blue-600", unit: "سلايد" },
  { to: "/adminpanel/services", table: "services", label: "خدماتنا", icon: Sparkles, color: "bg-emerald-500/10 text-emerald-600", unit: "خدمة" },
  { to: "/adminpanel/offers", table: "offers", label: "أحدث العروض", icon: Tag, color: "bg-amber-500/10 text-amber-600", unit: "عرض" },
  { to: "/adminpanel/systems", table: "systems", label: "التطبيقات والأنظمة", icon: AppWindow, color: "bg-violet-500/10 text-violet-600", unit: "نظام" },
  { to: "/adminpanel/clients", table: "clients", label: "عملاؤنا", icon: Users, color: "bg-rose-500/10 text-rose-600", unit: "عميل" },
  { to: "/adminpanel/news", table: "news", label: "الأخبار", icon: Newspaper, color: "bg-cyan-500/10 text-cyan-600", unit: "مقال" },
  { to: "/adminpanel/social", table: "social_links", label: "وسائل التواصل", icon: Share2, color: "bg-fuchsia-500/10 text-fuchsia-600", unit: "رابط" },
];

function AdminHome() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    Promise.all(
      cards.map(async (c) => {
        try {
          const rows = await adminList({ data: { table: c.table } });
          return [c.table, rows.length] as const;
        } catch {
          return [c.table, 0] as const;
        }
      }),
    ).then((entries) => {
      if (active) setCounts(Object.fromEntries(entries));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminSection
      title="أهلاً بك في لوحة التحكم"
      description="اختر القسم الذي تريد إدارته. جميع البيانات محفوظة في قاعدة البيانات ويمكنك التعديل عليها أو حذفها."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          const count = counts[c.table];
          return (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-base font-semibold text-foreground">{c.label}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {count === undefined ? "..." : `${count} ${c.unit}`}
              </div>
            </Link>
          );
        })}
      </div>
    </AdminSection>
  );
}
