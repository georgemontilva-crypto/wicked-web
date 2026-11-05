import { Logo, Spark } from "@/components/Bits";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState, type ReactNode } from "react";

type Kind = "logo" | "hemp" | "lab" | "texas" | "lock" | "21" | "spark" | "smooth" | "pack";
type Sticker = { id: number; kind: Kind; x: number; y: number; r: number; s: number; z: number; img?: string };

const SEAL: Record<string, string> = {
  hemp: "/brand/seal-hemp.svg",
  lab: "/brand/seal-lab.svg",
  texas: "/brand/seal-texas.svg",
  lock: "/brand/seal-lock.svg",
};

function Face({ s }: { s: Sticker }): ReactNode {
  switch (s.kind) {
    case "logo":
      return <Logo className="h-auto w-44 drop-shadow-[4px_4px_0_#000]" />;
    case "21":
      return (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-white font-display text-3xl text-black shadow-[4px_4px_0_#000]">
          21+
        </div>
      );
    case "spark":
      return (
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border-4 border-black bg-[var(--accent)] text-white shadow-[4px_4px_0_#000]">
          <Spark className="h-14 w-14" />
        </div>
      );
    case "smooth":
      return (
        <div className="rounded-2xl border-4 border-black bg-white px-5 py-3 text-center text-black shadow-[4px_4px_0_#000]">
          <p className="font-display text-2xl leading-none">SMOOTH</p>
          <p className="mt-1 text-[0.65rem] font-extrabold tracking-[0.3em]">POTENT · PREMIUM</p>
        </div>
      );
    case "pack":
      return <img src={s.img} alt="" className="glow-drop h-40 w-auto" draggable={false} />;
    default:
      return (
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
          <img src={SEAL[s.kind]} alt="" className="h-full w-full" draggable={false} />
        </div>
      );
  }
}

const KINDS: Kind[] = ["logo", "hemp", "lab", "texas", "lock", "21", "spark", "smooth"];

/**
 * A wall to slap WICK'D stickers on. Drag any sticker around; tap an empty
 * spot to stick a new one there. Nothing is saved — it's a toy.
 */
export function StickerWall({ packs }: { packs: string[] }) {
  const wall = useRef<HTMLDivElement>(null);
  const nextId = useRef(100);
  const topZ = useRef(20);
  const [stickers, setStickers] = useState<Sticker[]>(() => {
    const base: [Kind, number, number, number][] = [
      ["logo", 8, 14, -8],
      ["21", 70, 12, 10],
      ["lab", 84, 52, -6],
      ["smooth", 40, 60, 4],
      ["texas", 14, 64, 8],
      ["spark", 58, 24, -12],
      ["hemp", 30, 30, 14],
    ];
    const items: Sticker[] = base.map(([kind, x, y, r], i) => ({ id: i, kind, x, y, r, s: 1, z: i + 1 }));
    packs.slice(0, 3).forEach((img, i) =>
      items.push({ id: 50 + i, kind: "pack", img, x: [52, 88, 4][i], y: [8, 8, 34][i], r: [-10, 12, 6][i], s: 1, z: 10 + i })
    );
    return items;
  });
  const drag = useRef<{ id: number; dx: number; dy: number; moved: boolean } | null>(null);

  const toPct = useCallback((clientX: number, clientY: number) => {
    const r = wall.current!.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100 };
  }, []);

  const onDown = (e: React.PointerEvent, s: Sticker) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = toPct(e.clientX, e.clientY);
    drag.current = { id: s.id, dx: p.x - s.x, dy: p.y - s.y, moved: false };
    const z = ++topZ.current;
    setStickers(list => list.map(it => (it.id === s.id ? { ...it, z, s: 1.08 } : it)));
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    d.moved = true;
    const p = toPct(e.clientX, e.clientY);
    setStickers(list =>
      list.map(it =>
        it.id === d.id
          ? { ...it, x: Math.max(-5, Math.min(95, p.x - d.dx)), y: Math.max(-5, Math.min(92, p.y - d.dy)) }
          : it
      )
    );
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d) setStickers(list => list.map(it => (it.id === d.id ? { ...it, s: 1 } : it)));
  };
  const slap = (e: React.PointerEvent) => {
    if (e.target !== wall.current) return;
    const p = toPct(e.clientX, e.clientY);
    const pool: Kind[] = packs.length ? [...KINDS, "pack", "pack"] : KINDS;
    const kind = pool[Math.floor(Math.random() * pool.length)];
    const img = kind === "pack" ? packs[Math.floor(Math.random() * packs.length)] : undefined;
    const z = ++topZ.current;
    setStickers(list =>
      [...list, { id: nextId.current++, kind, img, x: p.x - 6, y: p.y - 8, r: Math.random() * 30 - 15, s: 1, z }].slice(-34)
    );
  };

  return (
    <div
      ref={wall}
      onPointerDown={slap}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="relative h-[34rem] touch-none select-none overflow-hidden rounded-[28px] border-[3px] border-black bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--accent)_40%,#1a0b30),#0b0418_70%)] shadow-[6px_6px_0_#000] sm:h-[38rem]"
      aria-label="Sticker wall: drag the stickers, tap an empty spot to add one"
      role="application"
    >
      <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-display text-[clamp(3rem,12vw,9rem)] leading-none text-white/[0.06]">
        STICK IT
      </p>
      {stickers.map(s => (
        <div
          key={s.id}
          onPointerDown={e => onDown(e, s)}
          className={cn("pop-in absolute cursor-grab active:cursor-grabbing")}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            zIndex: s.z,
            transform: `rotate(${s.r}deg) scale(${s.s})`,
            transition: "transform 0.25s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          <Face s={s} />
        </div>
      ))}
    </div>
  );
}
