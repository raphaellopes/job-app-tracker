"use client";

import { useEffect, useRef } from "react";

/** Matches Tailwind `sm` (640px): overlay drawer is modal-only below this width. */
export const MOBILE_DRAWER_SCROLL_LOCK_MEDIA_QUERY = "(max-width: 639px)";

/**
 * Locks `document.body` scroll when `enabled` is true. Optionally only when `mediaQuery` matches.
 * Restores scroll position on unlock. Omit `mediaQuery` for full-viewport overlays (e.g. modals).
 */
export function useBodyScrollLock(enabled: boolean, mediaQuery?: string): void {
  const scrollLockYRef = useRef(0);
  const isLockedRef = useRef(false);

  useEffect(() => {
    const apply = () => {
      if (isLockedRef.current) {
        return;
      }
      scrollLockYRef.current = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollLockYRef.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      isLockedRef.current = true;
    };

    const release = () => {
      if (!isLockedRef.current) {
        return;
      }
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollLockYRef.current);
      isLockedRef.current = false;
    };

    if (mediaQuery === undefined) {
      if (enabled) {
        apply();
      } else {
        release();
      }
      return () => release();
    }

    const mq = window.matchMedia(mediaQuery);
    const sync = () => {
      if (enabled && mq.matches) {
        apply();
      } else {
        release();
      }
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      release();
    };
  }, [enabled, mediaQuery]);
}
