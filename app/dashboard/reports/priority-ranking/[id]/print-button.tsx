"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

function handlePrint() {
  const main = document.querySelector<HTMLElement>("main");
  const overridden: HTMLElement[] = [];

  if (main) {
    // Set main's height to its full scrollHeight so Chrome paginates ALL content,
    // not just what fits in the viewport. "height: auto" doesn't work here because
    // flex-basis:0% (from flex-1) causes Chrome to compute a layout height that only
    // covers the visible rows, leaving the catatan section outside the paginated area.
    main.style.setProperty("overflow", "visible", "important");
    main.style.setProperty("height", main.scrollHeight + "px", "important");
    main.style.setProperty("max-height", "none", "important");
    overridden.push(main);

    let parent = main.parentElement;
    while (parent && parent !== document.body) {
      parent.style.setProperty("overflow", "visible", "important");
      parent.style.setProperty("height", "auto", "important");
      parent.style.setProperty("max-height", "none", "important");
      overridden.push(parent);
      parent = parent.parentElement;
    }
  }

  window.addEventListener(
    "afterprint",
    () => {
      overridden.forEach((node) => {
        node.style.removeProperty("overflow");
        node.style.removeProperty("height");
        node.style.removeProperty("max-height");
      });
    },
    { once: true }
  );

  // Two rAF cycles ensure Chrome reflows with the new heights before opening the print dialog.
  requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
}

export function PrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="h-4 w-4 mr-1.5" />
      Cetak PDF
    </Button>
  );
}
