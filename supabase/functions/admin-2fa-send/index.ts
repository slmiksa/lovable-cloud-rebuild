// Sends a 4-digit 2FA code to the authenticated admin's email via Resend.
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
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const FROM = "Lamha Secure <no-reply@lamhasec.com>";
const BRAND = "#1FB3B4";
const BRAND_DARK = "#0F1F22";
const INK = "#0F1F22";
const INK_SOFT = "#4a6166";

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function codeEmail(code: string, email: string) {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>رمز التحقق</title></head>
<body style="margin:0;background:#f4f7f7;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f7;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px rgba(15,31,34,.08);">
      <tr><td style="background:linear-gradient(135deg,${BRAND} 0%,#12898A 55%,${BRAND_DARK} 100%);padding:36px 28px;text-align:center;color:#fff;">
        <div style="font-size:14px;letter-spacing:2px;opacity:.85;text-transform:uppercase;">Lamha Secure</div>
        <div style="font-size:22px;font-weight:800;margin-top:8px;text-shadow:0 2px 6px rgba(0,0,0,.35);">التحقق بخطوتين</div>
      </td></tr>
      <tr><td style="padding:32px 28px;">
        <p style="margin:0 0 12px;font-size:16px;">مرحبًا،</p>
        <p style="margin:0 0 20px;font-size:15px;color:${INK_SOFT};line-height:1.8;">
          استخدم الرمز التالي لإكمال تسجيل الدخول إلى لوحة تحكم <strong>لمحة سيك</strong>.
          الرمز صالح لمدة <strong>10 دقائق</strong> فقط ولا يجب مشاركته مع أي شخص.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <div style="display:inline-block;padding:22px 40px;border:2px dashed ${BRAND};border-radius:16px;background:#E6F7F7;">
            <div style="font-size:12px;color:${INK_SOFT};letter-spacing:3px;margin-bottom:6px;">رمز التحقق</div>
            <div style="font-size:44px;font-weight:900;letter-spacing:16px;color:${BRAND_DARK};font-family:'Courier New',monospace;">${code}</div>
          </div>
        </div>
        <p style="margin:0;font-size:13px;color:${INK_SOFT};line-height:1.8;">
          إذا لم تكن أنت من طلب هذا الرمز، تجاهل هذه الرسالة وقم بتغيير كلمة المرور فورًا.
        </p>
      </td></tr>
      <tr><td style="padding:18px 28px;background:#fafafa;border-top:1px solid #eef2f2;text-align:center;font-size:12px;color:${INK_SOFT};">
        أُرسلت هذه الرسالة إلى ${email} · Lamha Secure © ${new Date().getFullYear()}
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
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

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: role } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!role) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!user.email) {
      return new Response(JSON.stringify({ error: "no_email" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Rate-limit: max 1 code per 30s
    const { data: recent } = await admin
      .from("admin_2fa_codes")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recent && Date.now() - new Date(recent.created_at).getTime() < 30_000) {
      return new Response(JSON.stringify({ error: "rate_limited", retryInSec: 30 }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Generate a 4-digit code
    const buf = new Uint8Array(2);
    crypto.getRandomValues(buf);
    const code = String(((buf[0] << 8) | buf[1]) % 10000).padStart(4, "0");
    const codeHash = await sha256Hex(`${user.id}:${code}`);
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();

    // Invalidate previous unconsumed codes
    await admin.from("admin_2fa_codes").update({ consumed_at: new Date().toISOString() })
      .eq("user_id", user.id).is("consumed_at", null);

    const { error: insErr } = await admin.from("admin_2fa_codes").insert({
      user_id: user.id, code_hash: codeHash, expires_at: expiresAt,
    });
    if (insErr) throw new Error(insErr.message);

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [user.email],
        subject: `رمز الدخول ${code} — Lamha Secure`,
        html: codeEmail(code, user.email),
      }),
    });

    if (!resendRes.ok) {
      const body = await resendRes.text();
      console.error("resend failed", resendRes.status, body);
      return new Response(JSON.stringify({ error: "email_failed", details: body }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, sentTo: user.email.replace(/(.{2}).*(@.*)/, "$1***$2") }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
