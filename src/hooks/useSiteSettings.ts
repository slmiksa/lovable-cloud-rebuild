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
  const href = url || "/favicon.svg";
  const type = url ? "" : "image/svg+xml";
  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach((el) => el.remove());
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = href + (url ? `?t=${Date.now()}` : "");
  if (type) link.type = type;
  document.head.appendChild(link);
  if (url) {
    const apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    apple.href = link.href;
    document.head.appendChild(apple);
  }
}

function applySocialImage(url: string | null) {
  if (typeof document === "undefined" || !url) return;
  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      const [key, val] = selector.replace(/[[\]"]/g, "").split("=");
      el.setAttribute(key, val);
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };
  setMeta('meta[property="og:image"]', "content", url);
  setMeta('meta[name="twitter:image"]', "content", url);
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
  applyFavicon(next.favicon_url);
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
