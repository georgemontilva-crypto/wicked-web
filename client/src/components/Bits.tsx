import { cn } from "@/lib/utils";
import { useEffect, useRef, type ReactNode } from "react";

/** The vector logo, traced from the brand artwork. */
export function Logo({ className, eager }: { className?: string; eager?: boolean }) {
  return (
    <img
      src="/brand/logo.svg"
      alt="WICK'D"
      width={1677}
      height={732}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("select-none", className)}
      draggable={false}
    />
  );
}

/**
 * Tilts its child towards the pointer in 3D, like turning a pouch in your
 * hand. Touch screens get a slow idle sway instead. Never more than `max`
 * degrees, so the front of the pack stays readable.
 */
export function Tilt({
  children,
  className,
  max = 14,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let rx = 0;
    let ry = 0;
    let tx = 0;
    let ty = 0;
    let idle = true;
    let t = Math.random() * 100;
    const loop = () => {
      t += 0.012;
      if (idle) {
        tx = Math.sin(t) * max * 0.35;
        ty = Math.cos(t * 0.8) * max * 0.2;
      }
      rx += (tx - rx) * 0.08;
      ry += (ty - ry) * 0.08;
      el.style.transform = `perspective(1100px) rotateY(${rx}deg) rotateX(${-ry}deg)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      idle = false;
      tx = Math.max(-1, Math.min(1, x)) * max;
      ty = Math.max(-1, Math.min(1, y)) * max;
    };
    const onLeave = () => {
      idle = true;
    };
    const zone = el.parentElement ?? el;
    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerleave", onLeave);
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div ref={ref} className={cn("will-change-transform [transform-style:preserve-3d]", className)}>
      {children}
    </div>
  );
}

/** Product cut-out floating over its own shadow. */
export function FloatingPack({
  src,
  alt,
  className,
  imgClassName,
  eager,
  animKey,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  /** Changing it replays the "warp in" when the flavour changes. */
  animKey?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="pack-shadow" />
      <div className="float relative h-full w-full">
        {src && (
          <img
            key={animKey ?? src}
            src={src}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className={cn("warp-in glow-drop relative h-full w-full select-none object-contain", imgClassName)}
          />
        )}
      </div>
    </div>
  );
}

/** A band of repeating words that slides sideways forever. */
export function Marquee({
  items,
  className,
  speed = 32,
}: {
  items: ReactNode[];
  className?: string;
  speed?: number;
}) {
  const row = (hidden?: boolean) => (
    <div aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-10">
          {item}
          <Spark />
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("marquee", className)} style={{ ["--marquee-speed" as string]: `${speed}s` }}>
      {row()}
      {row(true)}
      {row(true)}
    </div>
  );
}

/** Four-point star, the sparkle printed around the logo on the boxes. */
export function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5 flex-none", className)}>
      <path
        d="M12 0c.9 6.2 2.6 9.9 12 12-9.4 2.1-11.1 5.8-12 12-.9-6.2-2.6-9.9-12-12C9.4 9.9 11.1 6.2 12 0z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Section heading: small label, big sticker title. */
export function Heading({
  eyebrow,
  title,
  className,
  as: Tag = "h2",
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  className?: string;
  as?: "h1" | "h2";
  children?: ReactNode;
}) {
  return (
    <div className={cn("reveal", className)}>
      {eyebrow && (
        <p className="label flex items-center gap-2 text-[color-mix(in_oklab,var(--accent)_65%,white)]">
          <Spark className="h-3.5 w-3.5" />
          {eyebrow}
        </p>
      )}
      <Tag className="sticker mt-3 text-[clamp(2.4rem,6vw,4.6rem)]">{title}</Tag>
      {children}
    </div>
  );
}
