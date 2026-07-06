import { createServerFn } from "@tanstack/react-start";

/** Public marketing content read from the DB. Uses the service-role client for
 * reliable reads of active/published rows, returning only safe columns. These
 * functions require no auth and are safe to call from public route loaders. */

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabaseAdmin as any;
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export interface PublicSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
}
export interface PublicService {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
}
export interface PublicOffer {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  price: string | null;
  image_url: string | null;
}
export interface PublicSystem {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  features: string[] | null;
}
export interface PublicClient {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
}
export interface PublicNews {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  date: string;
}
export interface PublicNewsFull extends PublicNews {
  content: string[];
}
export interface PublicSocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
}

async function fetchSlides(): Promise<PublicSlide[]> {
  const s = await db();
  const { data } = await s
    .from("slides")
    .select("id,title,subtitle,image_url,cta_label,cta_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as PublicSlide[];
}
async function fetchServices(): Promise<PublicService[]> {
  const s = await db();
  const { data } = await s
    .from("services")
    .select("id,title,description,icon")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as PublicService[];
}
async function fetchOffers(): Promise<PublicOffer[]> {
  const s = await db();
  const { data } = await s
    .from("offers")
    .select("id,title,description,badge,price,image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as PublicOffer[];
}
async function fetchSystems(): Promise<PublicSystem[]> {
  const s = await db();
  const { data } = await s
    .from("systems")
    .select("id,title,description,icon,image_url,features")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as PublicSystem[];
}
async function fetchClients(): Promise<PublicClient[]> {
  const s = await db();
  const { data } = await s
    .from("clients")
    .select("id,name,logo_url,website_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as PublicClient[];
}
async function fetchNews(): Promise<PublicNews[]> {
  const s = await db();
  const { data } = await s
    .from("news")
    .select("id,slug,title,excerpt,image_url,published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((n: any) => ({
    id: n.id,
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    image_url: n.image_url,
    date: fmtDate(n.published_at),
  }));
}
async function fetchSocialLinks(): Promise<PublicSocialLink[]> {
  const s = await db();
  const { data } = await s
    .from("social_links")
    .select("id,platform,url,icon")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as PublicSocialLink[];
}

/** Everything needed to render the homepage in one round trip. */
export const getPublicHome = createServerFn({ method: "GET" }).handler(async () => {
  const [slides, services, offers, systems, clients, news, socialLinks] = await Promise.all([
    fetchSlides(),
    fetchServices(),
    fetchOffers(),
    fetchSystems(),
    fetchClients(),
    fetchNews(),
    fetchSocialLinks(),
  ]);
  return { slides, services, offers, systems, clients, news, socialLinks };
});

export const getPublicSystems = createServerFn({ method: "GET" }).handler(async () => {
  return fetchSystems();
});

export const getPublicClients = createServerFn({ method: "GET" }).handler(async () => {
  return fetchClients();
});

export const getPublicSocialLinks = createServerFn({ method: "GET" }).handler(async () => {
  return fetchSocialLinks();
});

export const getPublicNewsBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => {
    if (!d?.slug) throw new Error("Missing slug");
    return d;
  })
  .handler(async ({ data }): Promise<{ item: PublicNewsFull | null; others: PublicNews[] }> => {
    const s = await db();
    const { data: row } = await s
      .from("news")
      .select("id,slug,title,excerpt,image_url,content,published_at")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!row) return { item: null, others: [] };
    const all = await fetchNews();
    const others = all.filter((n) => n.slug !== data.slug).slice(0, 2);
    return {
      item: {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        image_url: row.image_url,
        date: fmtDate(row.published_at),
        content: (row.content ?? "")
          .split(/\n\n+/)
          .map((p: string) => p.trim())
          .filter(Boolean),
      },
      others,
    };
  });
