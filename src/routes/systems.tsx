import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SystemCard, SystemDialogContent, toSystemItem, type SystemItem } from "@/lib/systems";
import { getPublicSystems, type PublicSystem } from "@/lib/public.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/systems")({
  head: () => ({
    meta: [
      { title: "تطبيقاتنا وأنظمتنا — LamhaSec" },
      {
        name: "description",
        content:
          "استعرض جميع منصات وأنظمة LamhaSec للأمن السيبراني والحلول التقنية: مراقبة، تشفير، جدار حماية، حماية سحابية، وأكثر.",
      },
      { property: "og:title", content: "تطبيقاتنا وأنظمتنا — LamhaSec" },
      {
        property: "og:description",
        content: "جميع منصات وأنظمة LamhaSec في مكان واحد.",
      },
    ],
  }),
  loader: () => getPublicSystems(),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center font-arabic" dir="rtl">حدث خطأ في التحميل: {error.message}</div>
  ),
  component: SystemsPage,
});

function SystemsPage() {
  const rows = Route.useLoaderData() as PublicSystem[];
  const systemItems = rows.map((r, i) => toSystemItem(r, i));
  const [openSystem, setOpenSystem] = useState<SystemItem | null>(null);
  return (
    <div className="min-h-screen bg-white font-arabic text-[var(--ink)]">
      <SiteHeader active="systems" />

      {/* Page hero */}
      <section className="bg-gradient-to-l from-[var(--purple)] to-[var(--purple-dark)] py-16 text-white" dir="rtl">
        <div className="mx-auto max-w-[1400px] px-5 text-center md:px-10">
          <div className="text-sm font-bold tracking-widest text-[var(--brand)]">منصاتنا</div>
          <h1 className="mt-3 text-3xl font-black md:text-5xl">تطبيقاتنا وأنظمتنا</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 md:text-lg">
            مجموعة متكاملة من المنصات السيبرانية والتقنية تعمل بتناغم لحماية مؤسستك وتطوير بيئتها الرقمية.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-10" dir="rtl">
        {systemItems.length === 0 ? (
          <p className="text-center text-[var(--ink-soft)]">لا توجد أنظمة متاحة حالياً.</p>
        ) : (
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {systemItems.map((sys) => (
              <SystemCard key={sys.id} system={sys} onOpen={() => setOpenSystem(sys)} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />

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
