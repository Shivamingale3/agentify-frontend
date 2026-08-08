"use client";

import { useState } from "react";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";

const SNIPPET = `<script src="https://cdn.agentify.ai/embed.js"
  data-bot="your-bot-id"
  defer
></script>`;

/**
 * The finale's embed snippet + copy-to-clipboard button. Single
 * responsibility: let the reader copy the snippet, and confirm they did.
 */
export default function EmbedSnippet() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be blocked — the snippet stays visible and selectable
    }
  };

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-5 mt-1">
      <div className="flex items-center justify-between">
        <span className="label-eyebrow">Your embed · live</span>
        <span className="text-[11px] text-muted-foreground">v1 · 1.4kb gz</span>
      </div>
      <pre className="font-mono text-[11.5px] leading-relaxed text-foreground overflow-x-auto whitespace-pre-wrap break-all border border-border bg-background/60 p-3 select-all">
        {SNIPPET}
      </pre>
      <Button
        type="button"
        onClick={copy}
        variant="outline"
        size="sm"
        className="self-start"
        aria-live="polite"
      >
        {copied ? (
          <>
            <RiCheckLine data-icon="inline-start" /> Copied
          </>
        ) : (
          <>
            <RiFileCopyLine data-icon="inline-start" /> Copy snippet
          </>
        )}
      </Button>
    </div>
  );
}
