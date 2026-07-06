import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ADMIN_TABLES = [
  "slides",
  "services",
  "offers",
  "systems",
  "clients",
  "news",
  "social_links",
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
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(context: any) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) {
    throw new Response("Forbidden", { status: 403 });
  }
}

/** Returns whether the currently signed-in user is an admin. */
export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data), userId: context.userId };
  });

/** Lists all rows (including inactive) of an allow-listed table. */
export const adminList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: AdminTable }) => {
    if (!ADMIN_TABLES.includes(d.table)) throw new Error("Invalid table");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin as any;
    const ord = ORDER[data.table];
    const { data: rows, error } = await db
      .from(data.table)
      .select("*")
      .order(ord.col, { ascending: ord.asc, nullsFirst: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as any[];
  });

/** Inserts (no id) or updates (with id) a row in an allow-listed table. */
export const adminUpsert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: AdminTable; row: Record<string, unknown> }) => {
    if (!ADMIN_TABLES.includes(d.table)) throw new Error("Invalid table");
    if (!d.row || typeof d.row !== "object") throw new Error("Invalid row");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin as any;
    const { id, ...fields } = data.row;
    if (id) {
      const { data: row, error } = await db
        .from(data.table)
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row as any;
    }
    const { data: row, error } = await db
      .from(data.table)
      .insert(fields)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as any;
  });

/** Deletes a row by id from an allow-listed table. */
export const adminDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: AdminTable; id: string }) => {
    if (!ADMIN_TABLES.includes(d.table)) throw new Error("Invalid table");
    if (!d.id) throw new Error("Missing id");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabaseAdmin as any;
    const { error } = await db.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Uploads an image (as a data URL) to the public `media` bucket and returns its URL. */
export const adminUploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { filename: string; dataUrl: string }) => {
    if (!d?.dataUrl || !d.dataUrl.startsWith("data:")) throw new Error("Invalid file");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const match = data.dataUrl.match(/^data:([^;]+);base64,(.*)$/);
    if (!match) throw new Error("Invalid data URL");
    const contentType = match[1];
    const buffer = Buffer.from(match[2], "base64");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = (data.filename.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from("media")
      .upload(path, buffer, { contentType, upsert: true });
    if (error) throw new Error(error.message);
    const { data: pub } = supabaseAdmin.storage.from("media").getPublicUrl(path);
    return { url: pub.publicUrl };
  });
