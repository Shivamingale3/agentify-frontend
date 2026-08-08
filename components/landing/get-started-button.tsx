"use client";

import { Button } from "@/components/ui/button";

/**
 * The header's only interactive element, split out so site-header.tsx itself
 * can render on the server. `pointer-events-auto` re-enables clicks inside the
 * header's `pointer-events-none` scrim, which exists so the 3D canvas behind
 * it still receives pointer input.
 */
export default function GetStartedButton() {
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      onClick={scrollToBottom}
      className="pointer-events-auto"
    >
      Get started
    </Button>
  );
}
