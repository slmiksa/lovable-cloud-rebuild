// Verifies a 4-digit 2FA code for the authenticated admin and creates a 2FA session.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const code = String(body?.code ?? "").trim();
    if (!/^\d{4}$/.test(code)) {
      return new Response(JSON.stringify({ error: "invalid_code_format" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: role } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!role) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: row } = await admin
      .from("admin_2fa_codes")
      .select("id, code_hash, expires_at, consumed_at, attempts")
      .eq("user_id", user.id)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) {
      return new Response(JSON.stringify({ error: "no_active_code" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await admin.from("admin_2fa_codes").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);
      return new Response(JSON.stringify({ error: "expired" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if ((row.attempts ?? 0) >= 5) {
      await admin.from("admin_2fa_codes").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);
      return new Response(JSON.stringify({ error: "too_many_attempts" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const codeHash = await sha256Hex(`${user.id}:${code}`);
    if (codeHash !== row.code_hash) {
      await admin.from("admin_2fa_codes").update({ attempts: (row.attempts ?? 0) + 1 }).eq("id", row.id);
      return new Response(JSON.stringify({ error: "invalid_code", attemptsLeft: 5 - ((row.attempts ?? 0) + 1) }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Success — consume the code and create a session
    await admin.from("admin_2fa_codes").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);
    // Remove any expired sessions for this user
    await admin.from("admin_2fa_sessions").delete().eq("user_id", user.id);
    const { error: sessErr } = await admin.from("admin_2fa_sessions").insert({
      user_id: user.id,
      expires_at: new Date(Date.now() + 8 * 60 * 60_000).toISOString(),
    });
    if (sessErr) throw new Error(sessErr.message);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
