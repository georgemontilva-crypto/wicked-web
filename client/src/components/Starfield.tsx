import { hexToRgb } from "@/lib/catalog";
import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; r: number; tw: number };

/**
 * The galaxy behind every page, like the art on the pouches: three depths of
 * stars drifting slowly, pulled a little towards the pointer, plus two nebula
 * clouds tinted with the current flavour (--accent on <html>).
 *
 * One canvas, fixed behind the content. It pauses while the tab is hidden and
 * draws a single still frame for visitors who prefer reduced motion.
 */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let raf = 0;
    let t = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollY = window.scrollY;
    let accent: [number, number, number] = [139, 69, 255];
    let shown: [number, number, number] = [...accent];

    const readAccent = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) accent = hexToRgb(v);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(420, (w * h) / 3800));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() < 0.7 ? 0.25 : Math.random() < 0.8 ? 0.6 : 1,
        r: Math.random() * 1.2 + 0.25,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const nebula = (cx: number, cy: number, rad: number, a: number) => {
      const [r, g, b] = shown;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
      grad.addColorStop(0.45, `rgba(${r},${g},${b},${a * 0.35})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    };

    const frame = () => {
      t += 1;
      if (t % 20 === 0) readAccent();
      // Ease the nebula colour towards the new flavour instead of snapping.
      shown = shown.map((c, i) => c + (accent[i] - c) * 0.04) as [number, number, number];
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const drift = Math.sin(t / 900);
      nebula(w * (0.78 + drift * 0.03), h * 0.18, Math.max(w, h) * 0.55, 0.22);
      nebula(w * (0.12 - drift * 0.03), h * 0.82, Math.max(w, h) * 0.5, 0.16);
      ctx.globalCompositeOperation = "source-over";

      for (const s of stars) {
        if (!still) {
          s.y -= s.z * 0.08;
          if (s.y < -4) {
            s.y = h + 4;
            s.x = Math.random() * w;
          }
        }
        const px = s.x + pointer.x * s.z * 18;
        const py = ((s.y - scrollY * s.z * 0.15) % (h + 8) + h + 8) % (h + 8) - 4 + pointer.y * s.z * 18;
        const twinkle = 0.55 + 0.45 * Math.sin(s.tw + t * 0.03 * s.z);
        ctx.globalAlpha = twinkle * (0.35 + s.z * 0.65);
        ctx.fillStyle = s.z === 1 && s.r > 1.2 ? `rgb(${shown[0]},${shown[1]},${shown[2]})` : "#fff";
        ctx.beginPath();
        ctx.arc(px, py, s.r * (0.6 + s.z * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!still) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / w - 0.5) * 2;
      pointer.ty = (e.clientY / h - 0.5) * 2;
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !still) raf = requestAnimationFrame(frame);
    };

    readAccent();
    shown = [...accent];
    resize();
    frame();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10" />;
}
