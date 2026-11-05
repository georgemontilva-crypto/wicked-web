import { isHexColor } from "@shared/const";
import type { inferRouterOutputs } from "@trpc/server";
import type { CSSProperties } from "react";
import { useEffect } from "react";
import type { AppRouter } from "../../../server/routers";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type CatalogProduct = RouterOutputs["catalog"]["publicProducts"][number];
export type ProductDetail = RouterOutputs["catalog"]["productBySlug"];
export type ReportProduct = RouterOutputs["catalog"]["publicReports"][number];
export type PublicVideo = RouterOutputs["videos"]["publicList"][number];

/**
 * Sets --accent for a subtree. Returns nothing when the stored value isn't a
 * plain hex colour, so the subtree keeps the site default instead of inheriting
 * a broken declaration.
 */
export function accentStyle(color: string | null | undefined): CSSProperties {
  if (!color || !isHexColor(color)) return {};
  return { "--accent": color } as CSSProperties;
}

export function strainLabel(strain: string | null | undefined): string {
  if (!strain) return "";
  return strain.charAt(0).toUpperCase() + strain.slice(1);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  // A bare YYYY-MM-DD parses as UTC midnight and can print as the day before
  // in the Americas; pin it to local noon so the date shown is the date typed.
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | WICK'D` : "WICK'D | Smooth. Potent. Premium.";
  }, [title]);
}

/**
 * Paints the whole site in one flavour's colour. The value lands on <html>, so
 * the starfield, the header, the marquee and every button follow it; leaving
 * the page puts the brand violet back.
 */
export function useSiteAccent(color: string | null | undefined) {
  useEffect(() => {
    const root = document.documentElement;
    if (color && isHexColor(color)) root.style.setProperty("--accent", color);
    else root.style.removeProperty("--accent");
  }, [color]);
  useEffect(
    () => () => {
      document.documentElement.style.removeProperty("--accent");
    },
    []
  );
}

/** Adds .is-in to elements with .reveal once they scroll into view. */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)"));
    if (!("IntersectionObserver" in window)) {
      items.forEach(el => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** "duo-white-runtz" → same flavour in another line, matched by name. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
