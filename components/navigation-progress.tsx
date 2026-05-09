"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const prevKey = useRef(`${pathname}${searchParams}`);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("#") ||
        href === pathname
      )
        return;

      if (slowTimer.current) clearTimeout(slowTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(true);
      setWidth(10);
      slowTimer.current = setTimeout(() => setWidth(70), 80);
    }

    document.addEventListener("click", onLinkClick, true);
    return () => document.removeEventListener("click", onLinkClick, true);
  }, [pathname]);

  useEffect(() => {
    const key = `${pathname}${searchParams}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    if (slowTimer.current) clearTimeout(slowTimer.current);
    setWidth(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 250);
  }, [pathname, searchParams]);

  useEffect(
    () => () => {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-9999 h-0.5 bg-primary shadow-[0_0_8px_2px] shadow-primary/40 transition-[width] ease-out"
      style={{
        width: `${width}%`,
        transitionDuration: width === 100 ? "200ms" : "400ms",
      }}
    />
  );
}

export function NavigationProgress() {
  return (
    <Suspense>
      <NavigationProgressInner />
    </Suspense>
  );
}
