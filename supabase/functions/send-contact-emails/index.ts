// Sends two emails via Resend when a contact request is created:
// 1) Confirmation to the requester
// 2) Notification to the site admins
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAILS = [
  "mmarta@lamhasec.com",
  "mohammed@lamhasec.com",
  "nsaihost@gmail.com",
];

// Sender must be on a domain verified in Resend.
const FROM = "Lamha Secure <no-reply@lamhasec.com>";
// Palette derived from the new logo (onyx shield + vivid teal)
const BRAND = "#1FB3B4";        // teal accent
const BRAND_DARK = "#0F1F22";   // onyx
const BRAND_SOFT = "#E6F7F7";   // ice teal
const BRAND_BORDER = "#BEE6E7";
const INK = "#0F1F22";
const INK_SOFT = "#4a6166";
const LOGO_URL = "https://nwiftvgwcsqgwmsfmlgs.supabase.co/storage/v1/object/sign/media/uploads/1783762460814-n47t99iz0w.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82ZGVhZjI0NS1kNzNjLTQwZDctYWQ5Zi04OTRjMWQyYjNkZTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtZWRpYS91cGxvYWRzLzE3ODM3NjI0NjA4MTQtbjQ3dDk5aXowdy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgzNzYyNDYyLCJleHAiOjIwOTkxMjI0NjJ9.CqaCUSLyCpGRhCQymaQhdSTMkqufLBngNjayucGy_Tw";

interface Payload {
  requestNo: number;
  fullName: string;
  phone: string;
  email: string;
  message: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/\n/g, "<br/>");

function shell(title: string, bodyHtml: string) {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f2f6f7;font-family:Tahoma,Arial,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f6f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(15,31,34,.08);border:1px solid ${BRAND_BORDER};">
        <tr><td style="background:linear-gradient(135deg,${BRAND_DARK} 0%, #14343a 55%, ${BRAND} 100%);padding:28px 24px;text-align:center;color:#ffffff;">
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 14px;"><tr><td style="background:#ffffff;border-radius:20px;padding:14px;box-shadow:0 6px 20px rgba(0,0,0,.18);">
            <img src="${LOGO_URL}" alt="Lamha Secure" width="96" height="96" style="display:block;background:#ffffff;border-radius:12px;"/>
          </td></tr></table>
          <div style="font-size:22px;font-weight:800;letter-spacing:.5px;">Lamha Secure</div>
          <div style="font-size:12px;opacity:.85;margin-top:4px;">for Technical Solutions · لمحة الآمنة للحلول التقنية</div>
        </td></tr>
        <tr><td style="padding:28px 24px;line-height:1.85;font-size:15px;">${bodyHtml}</td></tr>
        <tr><td style="background:${BRAND_DARK};color:#cfeaeb;padding:16px 24px;text-align:center;font-size:12px;">
          © ${new Date().getFullYear()} Lamha Secure for Technical Solutions
          <div style="margin-top:4px;color:${BRAND};font-weight:700;letter-spacing:.5px;">lamhasec.com</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function clientTemplate(p: Payload) {
  const body = `
    <h2 style="margin:0 0 12px;color:${BRAND_DARK};font-size:20px;">مرحباً ${esc(p.fullName)} 👋</h2>
    <p style="margin:0 0 12px;color:${INK};">شكراً لتواصلك مع <b>Lamha Secure for Technical Solutions</b>. تم استلام طلبك بنجاح وسيقوم فريقنا بالتواصل معك في أقرب وقت.</p>
    <div style="background:${BRAND_SOFT};border:1px solid ${BRAND_BORDER};border-radius:12px;padding:16px;margin:16px 0;">
      <div style="font-size:13px;color:${INK_SOFT};margin-bottom:6px;">رقم الطلب</div>
      <div style="font-size:24px;font-weight:800;color:${BRAND};direction:ltr;text-align:right;">#${p.requestNo}</div>
    </div>
    <h3 style="margin:20px 0 8px;font-size:15px;color:${BRAND_DARK};">تفاصيل طلبك</h3>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:${INK_SOFT};width:120px;">الاسم:</td><td style="padding:8px 0;">${esc(p.fullName)}</td></tr>
      <tr><td style="padding:8px 0;color:${INK_SOFT};">الجوال:</td><td style="padding:8px 0;" dir="ltr">${esc(p.phone)}</td></tr>
      <tr><td style="padding:8px 0;color:${INK_SOFT};">البريد:</td><td style="padding:8px 0;" dir="ltr">${esc(p.email)}</td></tr>
      <tr><td style="padding:8px 0;color:${INK_SOFT};vertical-align:top;">الموضوع:</td><td style="padding:8px 0;">${esc(p.message)}</td></tr>
    </table>
    <p style="margin:20px 0 0;color:${INK_SOFT};font-size:13px;">إن لم تكن أنت من قام بإرسال هذا الطلب، يمكنك تجاهل هذه الرسالة.</p>
  `;
  return shell("تم استلام طلبك", body);
}

function adminTemplate(p: Payload) {
  const body = `
    <div style="background:${BRAND};color:${BRAND_DARK};display:inline-block;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:800;margin-bottom:12px;">طلب جديد</div>
    <h2 style="margin:0 0 8px;color:${BRAND_DARK};font-size:20px;">طلب تواصل جديد وارد</h2>
    <div style="background:${BRAND_SOFT};border:1px solid ${BRAND_BORDER};border-radius:12px;padding:16px;margin:16px 0;">
      <div style="font-size:13px;color:${INK_SOFT};margin-bottom:6px;">رقم الطلب</div>
      <div style="font-size:24px;font-weight:800;color:${BRAND};direction:ltr;text-align:right;">#${p.requestNo}</div>
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:${INK_SOFT};width:120px;">الاسم:</td><td style="padding:8px 0;font-weight:600;">${esc(p.fullName)}</td></tr>
      <tr><td style="padding:8px 0;color:${INK_SOFT};">الجوال:</td><td style="padding:8px 0;" dir="ltr"><a href="tel:${esc(p.phone)}" style="color:${BRAND};text-decoration:none;font-weight:600;">${esc(p.phone)}</a></td></tr>
      <tr><td style="padding:8px 0;color:${INK_SOFT};">البريد:</td><td style="padding:8px 0;" dir="ltr"><a href="mailto:${esc(p.email)}" style="color:${BRAND};text-decoration:none;font-weight:600;">${esc(p.email)}</a></td></tr>
    </table>
    <h3 style="margin:20px 0 8px;font-size:15px;color:${BRAND_DARK};">الموضوع</h3>
    <div style="background:#f7fbfb;border-right:4px solid ${BRAND};padding:12px 16px;border-radius:8px;white-space:pre-wrap;color:${INK};">${esc(p.message)}</div>
    <p style="margin:24px 0 0;color:${INK_SOFT};font-size:12px;">هذه الرسالة تم إرسالها تلقائياً من نموذج التواصل على موقع Lamha Secure.</p>
  `;
  return shell(`طلب جديد #${p.requestNo}`, body);
}

async function sendEmail(payload: {
  to: string[]; subject: string; html: string; bcc?: string[];
}) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY missing");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ from: FROM, ...payload }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("Resend error", res.status, text);
    throw new Error(`Resend ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const p = (await req.json()) as Payload;
    if (!p?.email || !p?.fullName || !p?.message || !p?.requestNo) {
      return new Response(JSON.stringify({ error: "invalid payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.allSettled([
      sendEmail({
        to: [p.email],
        subject: `تم استلام طلبك #${p.requestNo} — Lamha Secure`,
        html: clientTemplate(p),
      }),
      sendEmail({
        to: ADMIN_EMAILS,
        subject: `طلب جديد #${p.requestNo} من ${p.fullName}`,
        html: adminTemplate(p),
      }),
    ]);

    const errors = results.filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message ?? "unknown");
    const sent = results.filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<unknown>).value);

    return new Response(
      JSON.stringify({ ok: errors.length === 0, sent, errors }),
      { status: errors.length ? 502 : 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
