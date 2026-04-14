"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const activeTab =
    tabFromUrl && items.some((item) => item.id === tabFromUrl)
      ? tabFromUrl
      : defaultTabId && items.some((item) => item.id === defaultTabId)
        ? defaultTabId
        : items[0]?.id ?? "";

  const current = items.find((item) => item.id === activeTab) ?? items[0];

  const setTab = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`/admin?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="mt-6">
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {items.map((item) => {
          const isActive = item.id === current?.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
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
