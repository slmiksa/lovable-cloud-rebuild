import { useState } from "react";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLogin({ forbidden }: { forbidden?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.");
    }
    // نجاح الدخول يُحدّث الحالة تلقائيًا عبر onAuthStateChange
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-muted/30 p-4 font-[family-name:var(--font-arabic)]"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground">لوحة تحكم لمحة الآمنة</h1>
          <p className="mt-1 text-sm text-muted-foreground">سجّل الدخول للوصول إلى لوحة التحكم</p>
        </div>

        {forbidden ? (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              هذا الحساب لا يملك صلاحية مدير.
            </div>
            <Button variant="outline" className="w-full" onClick={onSignOut}>
              تسجيل الخروج والدخول بحساب آخر
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lamhasec.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              دخول
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
