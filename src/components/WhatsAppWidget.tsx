import { useState } from "react";
import { X, MessageCircle, ChevronLeft } from "lucide-react";
import { LogoMark } from "./LogoMark";

const PHONE = "966552553315";

const faqs = [
  {
    q: "ما هي الخدمات التي تقدمونها؟",
    a: "نقدّم حلولاً متكاملة في الأمن السيبراني والحلول التقنية والبرمجية والاستشارات: اختبار الاختراق، أمن الشبكات، أمن السحابة، الاستجابة للحوادث، والحوكمة والامتثال.",
  },
  {
    q: "هل تقدمون دعماً على مدار الساعة؟",
    a: "نعم، فريق مركز العمليات الأمنية (SOC) لدينا يعمل 24/7 لرصد التهديدات والاستجابة الفورية لأي حادث سيبراني.",
  },
  {
    q: "كيف أحصل على عرض سعر؟",
    a: "تواصل معنا عبر واتساب أو راسلنا على sales@lamhasec.com وسيقوم فريقنا بدراسة احتياجك وإرسال عرض مخصص خلال 24 ساعة.",
  },
  {
    q: "هل تخدمون الشركات الصغيرة؟",
    a: "بالتأكيد. لدينا باقات مرنة تناسب الشركات الناشئة والصغيرة والمتوسطة، إضافة إلى حلول مؤسسية للجهات الكبرى.",
  },
];

function openWhatsApp(text?: string) {
  const msg = text ? `?text=${encodeURIComponent(text)}` : "";
  window.open(`https://wa.me/${PHONE}${msg}`, "_blank", "noopener");
}

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="fixed bottom-8 right-5 z-[60] md:bottom-12 md:right-8" dir="rtl">
      {/* Chat panel */}
      {open && (
        <div className="mb-3 w-[88vw] max-w-sm origin-bottom-right animate-scale-in overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="relative flex items-center gap-3 bg-gradient-to-l from-[var(--brand)] to-[var(--brand-dark)] px-4 py-3 text-white">
            <div className="relative grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur-sm">
              <LogoMark className="h-5 w-5 text-white" />
              <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-[var(--brand-light)] ring-2 ring-[var(--brand)]" />
            </div>
            <div className="flex-1 leading-tight">
              <div className="text-sm font-bold">Lamha Secure — الدعم الفوري</div>
              <div className="text-[11px] text-white/80">عادةً نرد خلال دقائق</div>
            </div>
            <button
              onClick={() => { setOpen(false); setSelected(null); }}
              aria-label="إغلاق"
              className="rounded-full p-1.5 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] space-y-2.5 overflow-y-auto bg-[#0b1220] p-4 text-white">
            <div className="rounded-2xl rounded-tr-sm bg-white/5 p-3 text-sm leading-relaxed text-white/90 ring-1 ring-white/10">
              مرحباً بك في <span className="font-bold text-[var(--brand)]">Lamha Secure</span> 👋
              <br />اختر سؤالاً للإجابة السريعة، أو تواصل معنا مباشرة عبر واتساب.
            </div>

            {selected === null ? (
              <div className="space-y-2 pt-1">
                {faqs.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className="group flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-right text-sm text-white/90 transition hover:border-[var(--brand)]/60 hover:bg-[var(--brand)]/10"
                  >
                    <span>{f.q}</span>
                    <ChevronLeft className="h-4 w-4 text-[var(--brand)] transition group-hover:-translate-x-0.5" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2 pt-1 animate-fade-in">
                <div className="rounded-2xl rounded-tl-sm bg-[var(--brand)]/15 p-3 text-sm font-medium text-white ring-1 ring-[var(--brand)]/30">
                  {faqs[selected].q}
                </div>
                <div className="rounded-2xl rounded-tr-sm bg-white/5 p-3 text-sm leading-relaxed text-white/90 ring-1 ring-white/10">
                  {faqs[selected].a}
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-white/60 underline-offset-2 hover:text-white hover:underline"
                >
                  ← أسئلة أخرى
                </button>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-white/10 bg-[#0b1220] p-3">
            <button
              onClick={() =>
                openWhatsApp(
                  selected !== null
                    ? `مرحباً، لدي استفسار بخصوص: ${faqs[selected].q}`
                    : "مرحباً، أود التواصل مع فريق Lamha Secure."
                )
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--brand)] to-[var(--brand-dark)] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--brand)]/20 transition hover:brightness-110"
            >
              <WhatsAppIcon className="h-5 w-5" />
              تواصل معنا عبر واتساب
            </button>
            
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="فتح محادثة الدعم"
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-white shadow-xl shadow-[var(--brand-dark)]/30 ring-4 ring-[var(--brand)] transition hover:scale-105 md:h-16 md:w-16"
      >
        {/* Ripple rings */}
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[var(--brand)]/60 opacity-75" />
        <span className="pointer-events-none absolute -inset-1 animate-pulse rounded-full bg-[var(--brand)]/20 blur-md" />

        {/* Icon: logo inside circle */}
        <span className="relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-white p-2">
          {open ? (
            <X className="h-6 w-6 text-[var(--brand)] md:h-7 md:w-7" />
          ) : (
            <>
              <LogoMark className="h-10 w-10 object-contain md:h-11 md:w-11" />
              <MessageCircle className="absolute -bottom-1.5 -left-1.5 h-4 w-4 rounded-full bg-[var(--brand)] text-white p-0.5" />
            </>
          )}
        </span>

        {/* Flash */}
        <span className="pointer-events-none absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--brand-light)] ring-2 ring-[#0b1220]">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-light)]" />
        </span>
      </button>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.692.888.99 0 2.063-.732 2.262-1.748.058-.314.058-.629.058-.945 0-.116-.058-.314-.158-.387-.157-.114-.27-.07-.643-.143zM16.04 4c-7.025 0-12.745 5.622-12.745 12.527 0 2.235.616 4.42 1.776 6.34L3 28.997l6.318-1.97a12.913 12.913 0 0 0 6.722 1.835c7.026 0 12.745-5.62 12.745-12.526S23.066 4 16.041 4z" />
    </svg>
  );
}
