import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Images,
  Sparkles,
  Tag,
  AppWindow,
  Users,
  Newspaper,
  Share2,
  Shield,
  Loader2,
  LogOut,
  Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const Route = createFileRoute("/adminpanel")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — LamhaSec" },
      { name: "description", content: "لوحة تحكم لإدارة محتوى موقع لمحة سيك." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminGate,
});

const navItems = [
  { to: "/adminpanel", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { to: "/adminpanel/slides", label: "السلايدات", icon: Images, exact: false },
  { to: "/adminpanel/services", label: "خدماتنا", icon: Sparkles, exact: false },
  { to: "/adminpanel/offers", label: "أحدث العروض", icon: Tag, exact: false },
  { to: "/adminpanel/systems", label: "التطبيقات والأنظمة", icon: AppWindow, exact: false },
  { to: "/adminpanel/clients", label: "عملاؤنا", icon: Users, exact: false },
  { to: "/adminpanel/news", label: "الأخبار (مدونة)", icon: Newspaper, exact: false },
  { to: "/adminpanel/social", label: "وسائل التواصل", icon: Share2, exact: false },
] as const;

function AdminGate() {
  const { status } = useAdminAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauth") return <AdminLogin />;
  if (status === "forbidden") return <AdminLogin forbidden />;

  return <AdminLayout />;
}

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30 font-[family-name:var(--font-arabic)]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-l border-border bg-card lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">لوحة التحكم</div>
              <div className="text-xs text-muted-foreground">LamhaSec Admin</div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const active = isActive(item.to, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile nav */}
          <div className="sticky top-0 z-10 flex items-center gap-2 overflow-x-auto border-b border-border bg-card px-3 py-2 lg:hidden">
            {navItems.map((item) => {
              const active = isActive(item.to, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex shrink-0 items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              خروج
            </button>
          </div>

          <main className="flex-1 p-4 md:p-8">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
