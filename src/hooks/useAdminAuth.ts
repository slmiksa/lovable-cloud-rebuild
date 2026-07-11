import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStatus } from "@/lib/admin.functions";

export type AdminAuthStatus = "loading" | "unauth" | "forbidden" | "needs_2fa" | "admin";

async function check2fa(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_valid_2fa", { _user_id: userId });
  if (error) return false;
  return !!data;
}

export function useAdminAuth() {
  const [status, setStatus] = useState<AdminAuthStatus>("loading");

  const check = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setStatus("unauth");
      return;
    }
    try {
      const res = await getAdminStatus();
      if (!res.isAdmin) {
        setStatus("forbidden");
        return;
      }
      const ok = await check2fa(res.userId);
      setStatus(ok ? "admin" : "needs_2fa");
    } catch {
      setStatus("forbidden");
    }
  }, []);

  useEffect(() => {
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        check();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [check]);

  return { status, recheck: check };
}
