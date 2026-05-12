"use client";

import { useEffect } from "react";

export default function HydrationFix() {
  useEffect(() => {
    const attrs = ["hix-version", "hix-id"];
    const cleanup = () => {
      const body = document.body;
      if (body) {
        attrs.forEach((n) => { if (body.hasAttribute(n)) body.removeAttribute(n); });
      }
    };
    cleanup();
    const obs = new MutationObserver(cleanup);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: attrs,
      subtree: true,
      childList: true,
    });
    return () => obs.disconnect();
  }, []);
  return null;
}
