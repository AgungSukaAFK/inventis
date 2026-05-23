"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

function handlePrint() {
  const main = document.querySelector<HTMLElement>("main");
  const overridden: HTMLElement[] = [];

  if (main) {
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

  requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
}

export function PrintButton() {
  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="h-4 w-4 mr-1.5" />
      Cetak
    </Button>
  );
}
