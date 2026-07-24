import { supabase } from "@/integrations/supabase/client";

/** Admin operations executed directly from the browser using the
 *  authenticated user's JWT. Access is enforced by RLS policies that
 *  require `public.has_role(auth.uid(),'admin')`. */

export const ADMIN_TABLES = [
  "slides",
  "services",
  "offers",
  "systems",
  "clients",
  "news",
  "social_links",
  "contact_requests",
  "whatsapp_faqs",
  "home_circles",
  "section_texts",
] as const;

export type AdminTable = (typeof ADMIN_TABLES)[number];

const ORDER: Record<AdminTable, { col: string; asc: boolean }> = {
  slides: { col: "sort_order", asc: true },
  services: { col: "sort_order", asc: true },
  offers: { col: "sort_order", asc: true },
  systems: { col: "sort_order", asc: true },
  clients: { col: "sort_order", asc: true },
  social_links: { col: "sort_order", asc: true },
  news: { col: "published_at", asc: false },
  contact_requests: { col: "created_at", asc: false },
  whatsapp_faqs: { col: "sort_order", asc: true },
  home_circles: { col: "sort_order", asc: true },
  section_texts: { col: "key", asc: true },
};

export async function getAdminStatus(): Promise<{ isAdmin: boolean; userId: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return { isAdmin: false, userId: user.id };
  return { isAdmin: !!data, userId: user.id };
}

function assertTable(t: string): AdminTable {
  if (!(ADMIN_TABLES as readonly string[]).includes(t)) throw new Error("Invalid table");
  return t as AdminTable;
}

export async function adminList({ data }: { data: { table: AdminTable } }) {
  const table = assertTable(data.table);
  const ord = ORDER[table];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows, error } = await (supabase as any)
    .from(table)
    .select("*")
    .order(ord.col, { ascending: ord.asc, nullsFirst: false });
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows ?? []) as any[];
}

export async function adminUpsert({
  data,
}: {
  data: { table: AdminTable; row: Record<string, unknown> };
}) {
  const table = assertTable(data.table);
  if (!data.row || typeof data.row !== "object") throw new Error("Invalid row");
  const { id, ...fields } = data.row;
  if (id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabase as any)
      .from(table)
      .update(fields)
      .eq("id", id as string)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error } = await (supabase as any)
    .from(table)
    .insert(fields)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function adminDelete({ data }: { data: { table: AdminTable; id: string } }) {
  const table = assertTable(data.table);
  if (!data.id) throw new Error("Missing id");
  const { error } = await supabase.from(table).delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function adminUploadImage({
  data,
}: {
  data: { filename: string; dataUrl: string };
}) {
  if (!data?.dataUrl?.startsWith("data:")) throw new Error("Invalid file");
  const match = data.dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) throw new Error("Invalid data URL");
  const contentType = match[1];
  const bin = atob(match[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const ext = (data.filename.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, bytes, { contentType, upsert: true });
  if (error) throw new Error(error.message);
  // Long-lived signed URL (10 years) since the bucket is private.
  const { data: signed, error: signErr } = await supabase.storage
    .from("media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signErr || !signed) throw new Error(signErr?.message || "Failed to sign URL");
  return { url: signed.signedUrl };
}
