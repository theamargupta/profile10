"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TabItem = {
  id: string;
  label: string;
  count?: number;
  content: React.ReactNode;
};

type AdminTabsProps = {
  items: TabItem[];
  defaultTabId?: string;
};

export function AdminTabs({ items, defaultTabId }: AdminTabsProps) {
  const initialTab = useMemo(() => {
    if (defaultTabId && items.some((item) => item.id === defaultTabId)) {
      return defaultTabId;
    }
    return items[0]?.id ?? "";
  }, [defaultTabId, items]);

  const [activeTab, setActiveTab] = useState(initialTab);

  const current = items.find((item) => item.id === activeTab) ?? items[0];

  return (
    <div className="mt-6">
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {items.map((item) => {
          const isActive = item.id === current?.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                isActive
                  ? "border-primary/50 bg-primary/20 text-foreground"
                  : "border-white/15 bg-black/20 text-foreground/70 hover:bg-black/35 hover:text-foreground"
              )}
            >
              {item.label}
              {typeof item.count === "number" ? (
                <span className="ml-2 text-xs opacity-80">({item.count})</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-3">{current?.content}</div>
    </div>
  );
}
