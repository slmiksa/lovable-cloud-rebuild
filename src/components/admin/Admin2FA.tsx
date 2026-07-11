import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Loader2, AlertCircle, Mail, RotateCw, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Props {
  onVerified: () => void;
}

const CODE_LENGTH = 4;

export function Admin2FA({ onVerified }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const requested = useRef(false);

  const sendCode = async () => {
    setSending(true);
    setError(null);
    setInfo(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-2fa-send");
      if (error) {
        // Try to read the details
        const anyErr = error as unknown as { context?: Response };
        let msg = "تعذّر إرسال الرمز، حاول مرة أخرى.";
        try {
          const txt = anyErr.context ? await anyErr.context.text() : "";
          const j = txt ? JSON.parse(txt) : null;
          if (j?.error === "rate_limited") {
            setCooldown(j.retryInSec ?? 30);
            msg = "تم إرسال الرمز مؤخرًا. انتظر قليلًا قبل الطلب من جديد.";
          } else if (j?.error === "email_failed") {
            msg = "فشل إرسال البريد. راجع إعدادات النطاق في Resend.";
          }
        } catch { /* noop */ }
        throw new Error(msg);
      }
      setSentTo((data as { sentTo?: string })?.sentTo ?? null);
      setInfo("تم إرسال رمز مكوّن من 4 أرقام إلى بريدك. صالح لمدة 10 دقائق.");
      setCooldown(30);
      setTimeout(() => inputs.current[0]?.focus(), 50);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  // Auto-send once when mounted
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    void sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleChange = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
    if (e.key === "ArrowRight" && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    inputs.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus();
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = digits.join("");
    if (code.length !== CODE_LENGTH) {
      setError("أدخل الرمز المكوّن من 4 أرقام.");
      return;
    }
    setVerifying(true);
    setError(null);
    setInfo(null);
    try {
      const { data, error } = await supabase.functions.invoke("admin-2fa-verify", { body: { code } });
      if (error) {
        const anyErr = error as unknown as { context?: Response };
        let msg = "الرمز غير صحيح.";
        try {
          const txt = anyErr.context ? await anyErr.context.text() : "";
          const j = txt ? JSON.parse(txt) : null;
          if (j?.error === "expired") msg = "انتهت صلاحية الرمز. أرسل رمزًا جديدًا.";
          else if (j?.error === "too_many_attempts") msg = "تم تجاوز عدد المحاولات. أرسل رمزًا جديدًا.";
          else if (j?.error === "invalid_code")
            msg = `الرمز غير صحيح. المحاولات المتبقية: ${j.attemptsLeft ?? "-"}`;
          else if (j?.error === "no_active_code") msg = "لا يوجد رمز فعّال. اطلب رمزًا جديدًا.";
        } catch { /* noop */ }
        throw new Error(msg);
      }
      if ((data as { ok?: boolean })?.ok) {
        onVerified();
      } else {
        throw new Error("تعذّر التحقق. حاول مجددًا.");
      }
    } catch (err) {
      setError((err as Error).message);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <div
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 p-4 font-[family-name:var(--font-arabic)]"
    >
      {/* Soft brand backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 45% at 80% 15%, rgba(31,179,180,.18), transparent 60%), radial-gradient(55% 45% at 15% 90%, rgba(15,31,34,.10), transparent 60%)",
        }}
      />
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ background: "linear-gradient(135deg,#1FB3B4 0%,#12898A 55%,#0F1F22 100%)" }}
          >
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">التحقق بخطوتين</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            أرسلنا رمزًا مكوّنًا من 4 أرقام إلى بريدك الإلكتروني.
            <br />
            أدخله للمتابعة إلى لوحة التحكم.
          </p>
          {sentTo && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              <Mail className="h-3.5 w-3.5" />
              <span dir="ltr">{sentTo}</span>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="flex justify-center gap-3" dir="ltr">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                onPaste={handlePaste}
                disabled={verifying}
                className="h-16 w-14 rounded-2xl border-2 border-border bg-background text-center text-3xl font-bold text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:opacity-50"
              />
            ))}
          </div>

          {info && !error && (
            <div className="rounded-lg bg-primary/10 p-3 text-center text-xs text-primary">{info}</div>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={verifying || digits.join("").length !== CODE_LENGTH}
          >
            {verifying && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            تحقق ودخول
          </Button>

          <div className="flex flex-col items-center gap-2 pt-2 text-xs">
            <button
              type="button"
              onClick={sendCode}
              disabled={sending || cooldown > 0}
              className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-primary disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
              {cooldown > 0 ? `إعادة الإرسال بعد ${cooldown}s` : "إعادة إرسال الرمز"}
            </button>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              تسجيل الخروج
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
