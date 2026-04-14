"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CopyAllButtonProps = {
  data: Record<string, unknown>;
};

export function CopyAllButton({ data }: CopyAllButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = JSON.stringify(data, null, 2);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="shrink-0"
    >
      {copied ? "Copied!" : "Copy All Data"}
    </Button>
  );
}
