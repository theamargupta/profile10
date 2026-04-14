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
            className="text-muted-foreground transition-colors duration-300 hover:text-primary"
            aria-label={social.name}
          >
            {Icon && <Icon size={18} />}
          </a>
        );
      })}
    </div>
  );
}
