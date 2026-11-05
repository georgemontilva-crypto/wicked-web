import { useEffect, useId, useRef, useState } from "react";

/**
 * The THC Badder dosing syringe as a toy: drag the plunger (or use the arrow
 * keys) and the gold fills up to the 3 mL on the label. Purely visual — it
 * reads out the marking, not a dose recommendation.
 */
export function Syringe() {
  const [ml, setMl] = useState(0);
  const touched = useRef(false);
  const id = useId();

  // Fills itself once when it scrolls into view, until the visitor takes over.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMl(3);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || touched.current) return;
      io.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        if (touched.current) return;
        const p = Math.min(1, (now - start) / 1800);
        setMl(3 * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Barrel geometry (SVG units). 0 mL at the tip end, 3 mL at the top.
  const top = 120;
  const bottom = 520;
  const fillTop = bottom - (ml / 3) * (bottom - top);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg viewBox="0 0 220 700" className="h-[26rem] w-auto sm:h-[32rem]" role="img" aria-label={`Syringe filled to ${ml.toFixed(1)} mL`}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0" x2="1">
            <stop offset="0" stopColor="#ff9d1c" />
            <stop offset="0.45" stopColor="#ffd76a" />
            <stop offset="1" stopColor="#e07a00" />
          </linearGradient>
          <linearGradient id={`${id}-glass`} x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0.08" />
            <stop offset="0.8" stopColor="#fff" stopOpacity="0.04" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
          </linearGradient>
          <clipPath id={`${id}-barrel`}>
            <rect x="62" y={top} width="96" height={bottom - top} rx="10" />
          </clipPath>
        </defs>
        {/* plunger rod + thumb press, moves with the fill */}
        <g style={{ transform: `translateY(${fillTop - top}px)`, transition: "transform 0.08s linear" }}>
          <rect x="98" y="10" width="24" height={top - 0} rx="4" fill="#f6c9d9" stroke="#000" strokeWidth="5" />
          <rect x="52" y="0" width="116" height="26" rx="10" fill="#ffd1e3" stroke="#000" strokeWidth="6" />
          <rect x="66" y={top - 4} width="88" height="22" rx="5" fill="#2a2a2a" stroke="#000" strokeWidth="4" />
        </g>
        {/* finger flange */}
        <rect x="18" y={top - 18} width="184" height="20" rx="10" fill="#ffd1e3" stroke="#000" strokeWidth="6" />
        {/* gold */}
        <g clipPath={`url(#${id}-barrel)`}>
          <rect x="62" y={fillTop + 18} width="96" height={Math.max(0, bottom - fillTop - 18)} fill={`url(#${id}-gold)`} />
          <ellipse cx="110" cy={fillTop + 20} rx="48" ry="6" fill="#ffe7a3" opacity={ml > 0.05 ? 0.9 : 0} />
        </g>
        {/* barrel */}
        <rect x="62" y={top} width="96" height={bottom - top} rx="10" fill={`url(#${id}-glass)`} stroke="#000" strokeWidth="6" />
        {[1, 2, 3].map(n => {
          const y = bottom - (n / 3) * (bottom - top) + 18;
          return (
            <g key={n}>
              <line x1="128" x2="158" y1={y} y2={y} stroke="#000" strokeWidth="4" />
              <text x="168" y={y + 9} fontFamily="Montserrat Variable, sans-serif" fontWeight="800" fontSize="26" fill="#fff" stroke="#000" strokeWidth="5" paintOrder="stroke">
                {n}
              </text>
            </g>
          );
        })}
        {/* tip */}
        <path d={`M86 ${bottom} h48 l-10 40 h-28 z`} fill="#ffd1e3" stroke="#000" strokeWidth="6" strokeLinejoin="round" />
        <rect x="100" y={bottom + 40} width="20" height="60" rx="6" fill="#ffd1e3" stroke="#000" strokeWidth="6" />
        {/* drip */}
        <path
          d={`M110 ${bottom + 100} c-10 18 -10 30 0 34 c10 -4 10 -16 0 -34z`}
          fill={`url(#${id}-gold)`}
          stroke="#000"
          strokeWidth="4"
          style={{ transformOrigin: `110px ${bottom + 100}px`, transform: `scale(${ml > 2.9 ? 1 : 0})`, transition: "transform 0.5s cubic-bezier(.34,1.56,.64,1)" }}
        />
      </svg>
      <div className="mt-4 w-full max-w-xs">
        <label htmlFor={`${id}-range`} className="label flex items-center justify-between gap-4 text-white/70">
          <span>Pull the plunger</span>
          <span className="font-display text-2xl tracking-normal text-gold">{ml.toFixed(1)} mL</span>
        </label>
        <input
          id={`${id}-range`}
          type="range"
          min={0}
          max={3}
          step={0.1}
          value={ml}
          onChange={e => {
            touched.current = true;
            setMl(Number(e.target.value));
          }}
          className="mt-3 w-full accent-[#ffc23d]"
        />
      </div>
    </div>
  );
}
