import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  logo_url: string | null;
  favicon_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_address: string | null;
};

let cache: SiteSettings | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

function applyFavicon(url: string | null) {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
    .forEach((el) => el.remove());
  if (!url) return;
  const href = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
  const makeIcon = (rel: string) => {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  };
  makeIcon("icon");
  makeIcon("shortcut icon");
  makeIcon("apple-touch-icon");
}

function applySocialImage(url: string | null) {
  if (typeof document === "undefined" || !url) return;
  const setMeta = (kind: "property" | "name", key: string, value: string) => {
    const selector = `meta[${kind}="${key}"]`;
    let el = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(kind, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  };
  setMeta("property", "og:image", url);
  setMeta("property", "og:image:secure_url", url);
  setMeta("property", "og:image:alt", "لمحة الآمنة");
  setMeta("name", "twitter:image", url);
}


const EMPTY: SiteSettings = {
  logo_url: null,
  favicon_url: null,
  contact_phone: null,
  contact_email: null,
  contact_address: null,
};

export async function refreshSiteSettings() {
  const { data } = await supabase
    .from("site_settings")
    .select("logo_url,favicon_url,contact_phone,contact_email,contact_address")
    .eq("id", true)
    .maybeSingle();
  const next: SiteSettings = {
    logo_url: data?.logo_url ?? null,
    favicon_url: data?.favicon_url ?? null,
    contact_phone: data?.contact_phone ?? null,
    contact_email: data?.contact_email ?? null,
    contact_address: data?.contact_address ?? null,
  };
  cache = next;
  applyFavicon(next.favicon_url || next.logo_url);
  applySocialImage(next.logo_url || next.favicon_url);
  listeners.forEach((l) => l(next));
  return next;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? EMPTY);
  useEffect(() => {
    listeners.add(setSettings);
    if (!cache) void refreshSiteSettings();
    return () => {
      listeners.delete(setSettings);
    };
  }, []);
  return settings;
}
