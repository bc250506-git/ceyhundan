"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Do not track admin panel visits
    if (pathname?.startsWith("/admin")) return;

    try {
      fetch("/api/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname, referrer: typeof document !== "undefined" ? document.referrer : "" }),
      }).catch(() => {});
    } catch (e) {}
  }, [pathname]);

  return null;
}
