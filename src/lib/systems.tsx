import { Activity, ServerCog, type LucideIcon } from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { PublicSystem } from "@/lib/public.functions";

export type SystemItem = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  Icon: LucideIcon;
  gradient: string;
  accent: string;
  imageUrl: string | null;
  metrics: { label: string; value: string }[];
};

const ACCENTS = ["#48AAC8", "#7C8CFF", "#42D6B0", "#5BC0EB", "#C57BFF", "#F5A65B", "#FF7A8A"];
const GRADIENTS = [
  "from-sky-500/30 via-cyan-500/20 to-transparent",
  "from-indigo-500/30 via-blue-500/20 to-transparent",
  "from-emerald-500/30 via-teal-500/20 to-transparent",
  "from-cyan-500/30 via-sky-500/20 to-transparent",
  "from-fuchsia-500/30 via-purple-500/20 to-transparent",
  "from-amber-500/30 via-orange-500/20 to-transparent",
  "from-rose-500/30 via-pink-500/20 to-transparent",
];

/** Maps a DB system row into the richly-styled SystemItem used by the UI. */
export function toSystemItem(row: PublicSystem, index: number): SystemItem {
  const accent = ACCENTS[index % ACCENTS.length];
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const desc = row.description ?? "";
  const parts = desc.split(" — ");
  const tagline = parts.length > 1 ? parts[0] : "";
  const description = parts.length > 1 ? parts.slice(1).join(" — ") : desc;
  const metrics = (row.features ?? []).map((f) => {
    const idx = f.indexOf(":");
    return idx >= 0
      ? { label: f.slice(0, idx).trim(), value: f.slice(idx + 1).trim() }
      : { label: f.trim(), value: "" };
  });
  return {
    id: row.id,
    name: row.title,
    tagline,
    description,
    Icon: getIcon(row.icon),
    gradient,
    accent,
    imageUrl: row.image_url ?? null,
    metrics,
  };
}

export function SystemMock({ system, large = false }: { system: SystemItem; large?: boolean }) {
  const { Icon, accent, name, tagline } = system;
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.18_0.02_240)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] ${
        large ? "h-56" : "h-40"
      }`}
      dir="ltr"
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400/70" />
        <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
        <span className="h-2 w-2 rounded-full bg-green-400/70" />
        <div className="ml-auto h-1.5 w-24 rounded-full bg-white/10" />
      </div>
      <div className="grid h-[calc(100%-28px)] grid-cols-[88px_1fr]">
        <div className="flex flex-col items-center gap-2 border-r border-white/10 bg-white/[0.02] py-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: `${accent}33`, color: accent }}
          >
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-1.5 w-10 rounded-full bg-white/10" />
          ))}
        </div>
        <div className="space-y-2 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-white">{name}</div>
              <div className="text-[9px] text-white/50">{tagline}</div>
            </div>
            <div
              className="rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{ background: `${accent}26`, color: accent }}
            >
              ACTIVE
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-md border border-white/10 bg-white/[0.04] p-1.5"
              >
                <div className="h-1 w-6 rounded-full bg-white/15" />
                <div className="mt-1 h-2 w-10 rounded-full" style={{ background: accent, opacity: 0.6 }} />
              </div>
            ))}
          </div>
          <div className="space-y-1 pt-1">
            {[70, 50, 85].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${w}%`, background: accent, opacity: 0.75 }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 pt-1 text-[9px] text-white/50">
            <Activity className="h-3 w-3" style={{ color: accent }} />
            <span>Live monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SystemCard({ system, onOpen }: { system: SystemItem; onOpen: () => void }) {
  const { Icon, name, tagline, accent } = system;
  return (
    <button
      onClick={onOpen}
      className="group w-full rounded-2xl border border-[var(--line)] bg-white p-4 text-right shadow-sm transition hover:-translate-y-1 hover:border-[var(--brand)]/40 hover:shadow-[0_18px_40px_-20px_color-mix(in_oklab,var(--brand)_30%,transparent)]"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-[var(--purple)] to-[var(--purple-dark)] p-3">
        {system.imageUrl ? (
          <div className="relative h-40 w-full overflow-hidden rounded-xl bg-white">
            <img
              src={system.imageUrl}
              alt={system.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <SystemMock system={system} />
        )}
      </div>
      <div className="mt-4 flex items-center gap-3 px-1">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${accent}22`, color: accent }}
        >
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-[var(--purple)]">{name}</div>
          <div className="truncate text-[11px] text-[var(--ink-soft)]">{tagline}</div>
        </div>
        <ServerCog className="h-4 w-4 text-[var(--ink-soft)] transition group-hover:text-[var(--brand)]" />
      </div>
    </button>
  );
}

export function SystemDialogContent({ system }: { system: SystemItem }) {
  return (
    <>
      <div
        className={`relative overflow-hidden rounded-t-3xl bg-gradient-to-bl from-[var(--purple)] to-[var(--purple-dark)] p-8`}
      >
        <SystemMock system={system} large />
      </div>
      <div className="space-y-5 p-8 pt-6">
        <div className="space-y-2 text-right">
          <div className="text-xs font-bold tracking-widest text-[var(--brand)]">
            {system.tagline}
          </div>
          <h2 className="text-2xl font-black text-[var(--purple)]">{system.name}</h2>
          <p className="text-base leading-loose text-[var(--ink-soft)]">{system.description}</p>
        </div>
        {system.metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-5">
            {system.metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-[var(--line)] bg-[oklch(0.98_0.005_270)] p-4">
                <div className="text-[11px] tracking-wider text-[var(--ink-soft)]">{m.label}</div>
                <div className="mt-1 text-lg font-bold text-[var(--purple)]">{m.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
