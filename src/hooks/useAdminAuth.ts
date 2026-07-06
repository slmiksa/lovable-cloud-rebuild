import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStatus } from "@/lib/admin.functions";

export type AdminAuthStatus = "loading" | "unauth" | "forbidden" | "admin";

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
      setStatus(res.isAdmin ? "admin" : "forbidden");
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
