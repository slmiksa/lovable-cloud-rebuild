import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  logo_url: string | null;
  favicon_url: string | null;
};

let cache: SiteSettings | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

function applyFavicon(url: string | null) {
  if (typeof document === "undefined") return;
  const href = url || "/favicon.svg";
  const type = url ? "" : "image/svg+xml";
  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach((el) => el.remove());
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = href + (url ? `?t=${Date.now()}` : "");
  if (type) link.type = type;
  document.head.appendChild(link);
}

export async function refreshSiteSettings() {
  const { data } = await supabase
    .from("site_settings")
    .select("logo_url,favicon_url")
    .eq("id", true)
    .maybeSingle();
  const next: SiteSettings = {
    logo_url: data?.logo_url ?? null,
    favicon_url: data?.favicon_url ?? null,
  };
  cache = next;
  applyFavicon(next.favicon_url);
  listeners.forEach((l) => l(next));
  return next;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cache ?? { logo_url: null, favicon_url: null });
  useEffect(() => {
    listeners.add(setSettings);
    if (!cache) void refreshSiteSettings();
    return () => {
      listeners.delete(setSettings);
    };
  }, []);
  return settings;
}
