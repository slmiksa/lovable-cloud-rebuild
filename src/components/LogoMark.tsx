import { useId } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  const { logo_url } = useSiteSettings();
  const id = useId().replace(/:/g, "");
  const gradId = `logo-grad-${id}`;

  if (logo_url) {
    return (
      <img
        src={logo_url}
        alt="Logo"
        className={`${className} object-contain`}
        loading="eager"
      />
    );
  }

  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--brand-dark)" />
        </linearGradient>
      </defs>
      <path
        d="M24 3.5L41.5 10.2V21.8C41.5 32.8 31.2 42.6 24 46C16.8 42.6 6.5 32.8 6.5 21.8V10.2L24 3.5Z"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="17" y="17" width="14" height="14" rx="3.5" stroke={`url(#${gradId})`} strokeWidth="2.2" />
      <circle cx="24" cy="24" r="2.8" fill={`url(#${gradId})`} />
      <path d="M24 20V12M24 28V36M20 24H12M28 24H36" stroke={`url(#${gradId})`} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="24" cy="12" r="2.1" fill={`url(#${gradId})`} />
      <circle cx="24" cy="36" r="2.1" fill={`url(#${gradId})`} />
      <circle cx="12" cy="24" r="2.1" fill={`url(#${gradId})`} />
      <circle cx="36" cy="24" r="2.1" fill={`url(#${gradId})`} />
    </svg>
  );
}
