"use client";

import type { Social } from "@/lib/types";
import { iconMap } from "@/lib/icons";

export function FooterSocials({ socials }: { socials: Social[] }) {
  return (
    <div className="flex items-center gap-4">
      {socials.map((social) => {
        const Icon = iconMap[social.icon];
        return (
          <a
            key={social.id}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-fg-2)] transition-colors duration-300 hover:text-[var(--color-accent-400)]"
            aria-label={social.name}
            data-cursor="magnet"
          >
            {Icon && <Icon size={18} />}
          </a>
        );
      })}
    </div>
  );
}
