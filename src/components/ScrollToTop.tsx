import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 250);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="العودة إلى الأعلى"
      className={`fixed bottom-24 right-5 z-[59] grid h-12 w-12 place-items-center rounded-full border border-[var(--line)] bg-white text-[var(--brand)] shadow-lg shadow-[var(--brand-dark)]/10 transition-all duration-300 hover:scale-105 hover:bg-[var(--brand)] hover:text-white md:bottom-[7.5rem] md:right-8 md:h-14 md:w-14 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-5 w-5 md:h-6 md:w-6" />
    </button>
  );
}
