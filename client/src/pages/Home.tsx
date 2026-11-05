import { FloatingPack, Heading, Logo, Marquee, Spark, Tilt } from "@/components/Bits";
import { Newsletter } from "@/components/Newsletter";
import { ProductCard } from "@/components/ProductCard";
import { PublicLayout } from "@/components/PublicLayout";
import { ReelVideo } from "@/components/ReelVideo";
import { StickerWall } from "@/components/StickerWall";
import { Syringe } from "@/components/Syringe";
import { accentStyle, strainLabel, useReveal, useSiteAccent, useTitle, type CatalogProduct } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { groupByLine, LINES } from "@shared/lines";
import { ArrowRight, ArrowUpRight, FlaskConical, Search } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

const BoxViewer = lazy(() => import("@/components/BoxViewer"));

/* ─── Hero: the flavour orbit ───────────────────────────────────────────── */

function Hero({ products }: { products: CatalogProduct[] }) {
  const groups = useMemo(() => groupByLine(products), [products]);
  const [lineIdx, setLineIdx] = useState(0);
  const [flavorIdx, setFlavorIdx] = useState(0);
  const auto = useRef(true);
  const line = groups[lineIdx];
  const current = line?.items[flavorIdx] ?? products[0];
  useSiteAccent(current?.accentColor);

  // Warm the cache with every hero shot so switching flavour is instant.
  useEffect(() => {
    for (const p of products) {
      if (!p.imageUrl) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = p.imageUrl;
    }
  }, [products]);

  // Cycles through the flavours on its own until the visitor picks one.
  useEffect(() => {
    if (!groups.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!auto.current) return;
      setFlavorIdx(i => {
        const len = groups[lineIdx]?.items.length ?? 1;
        if (i + 1 < len) return i + 1;
        setLineIdx(l => (l + 1) % groups.length);
        return 0;
      });
    }, 3800);
    return () => window.clearInterval(timer);
  }, [groups, lineIdx]);

  // Keep the active line and flavour chips in view inside their scrolling rows
  // (phones), without moving the page itself.
  const tabsRow = useRef<HTMLDivElement>(null);
  const flavorsRow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    for (const row of [tabsRow.current, flavorsRow.current]) {
      const on = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!row || !on || row.scrollWidth <= row.clientWidth) continue;
      const left = on.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
      row.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
  }, [lineIdx, flavorIdx]);

  const pickLine = (i: number) => {
    auto.current = false;
    setLineIdx(i);
    setFlavorIdx(0);
  };
  const pickFlavor = (i: number) => {
    auto.current = false;
    setFlavorIdx(i);
  };

  if (!current) return <section className="min-h-[90vh]" />;

  return (
    <section className="relative overflow-hidden">
      {/* Giant outlined name of the flavour, drifting behind the pack */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[4%] select-none overflow-hidden">
        <p key={current.slug} className="outline-text warp-in whitespace-nowrap text-center text-[clamp(5rem,19vw,17rem)] leading-none opacity-[0.16]">
          {current.name}
        </p>
      </div>

      {/* Phones: title, pack, then the pickers right under it, so the pack
          stays on screen while choosing. Desktop: copy left, pack right. */}
      <div className="container relative grid items-center pb-10 pt-3 lg:min-h-[calc(100svh-72px)] lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-0">
        <div className="max-lg:contents lg:order-1">
          <p className="label hidden items-center gap-2 text-white/70 lg:flex">
            <Spark className="h-3.5 w-3.5 text-[var(--accent)]" /> Smooth · Potent · Premium
          </p>
          <h1 className="sticker order-1 text-center text-[clamp(2.5rem,12vw,3.2rem)] lg:mt-4 lg:text-left lg:text-[clamp(3.2rem,9vw,7.4rem)]">
            Get <br className="hidden lg:inline" />
            <span className="inline-block -rotate-2">WICK'D.</span>
          </h1>
          <p className="order-6 mt-6 max-w-md text-white/75 lg:mt-5 lg:text-lg">
            Four lines, twenty-four flavors and a lab report for every batch. Pick a line, pick a flavor, watch it light up.
          </p>

          <div ref={tabsRow} role="tablist" aria-label="Product lines" className="no-scrollbar relative order-3 -mx-5 mt-1 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:mt-7 lg:px-0">
            {groups.map((g, i) => (
              <button key={g.name} role="tab" type="button" aria-selected={i === lineIdx} aria-pressed={i === lineIdx} onClick={() => pickLine(i)} className="chip flex-none">
                {g.info?.kind ?? g.name}
              </button>
            ))}
          </div>
          <div ref={flavorsRow} className="no-scrollbar relative order-4 -mx-5 mt-2.5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:mt-4 lg:flex-wrap lg:overflow-visible lg:px-0" aria-label="Flavors">
            {line?.items.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => pickFlavor(i)}
                aria-pressed={i === flavorIdx}
                style={accentStyle(p.accentColor)}
                className="chip flex-none !text-[0.72rem]"
              >
                <span className="dot" />
                {p.name}
              </button>
            ))}
          </div>

          <div className="order-5 mt-4 flex gap-3 lg:mt-8 lg:flex-wrap">
            <Link href={`/products/${current.slug}`} className="btn btn-accent max-lg:flex-1 max-lg:!px-4">
              <span className="truncate">See {current.name}</span> <ArrowRight className="h-5 w-5 flex-none" />
            </Link>
            <Link href="/products" className="btn btn-line max-lg:!px-4">
              All<span className="hidden sm:inline"> products</span>
            </Link>
          </div>
        </div>

        <div className="relative order-2 mx-auto my-3 w-[min(100%,40svh)] max-w-[34rem] lg:order-2 lg:my-0 lg:w-full">
          {/* rotating ring of text */}
          <svg viewBox="0 0 500 500" aria-hidden="true" className="spin-slow absolute inset-[-4%] h-[108%] w-[108%] opacity-80">
            <defs>
              <path id="ring" d="M250,250 m-215,0 a215,215 0 1,1 430,0 a215,215 0 1,1 -430,0" />
            </defs>
            <circle cx="250" cy="250" r="232" fill="none" stroke="var(--accent)" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 10" />
            <text fill="#fff" fontFamily="Fugaz One" fontSize="26" letterSpacing="6">
              <textPath href="#ring">
                WICK'D • {(line?.name ?? "").toUpperCase()} • {current.name.toUpperCase()} • {strainLabel(current.strain).toUpperCase()} • 21+ •
              </textPath>
            </text>
          </svg>
          <div className="relative aspect-square">
            <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_65%)] opacity-60 blur-2xl transition-colors duration-700" />
            <Tilt className="absolute inset-[6%]" max={16}>
              <FloatingPack src={current.imageUrl} alt={`${current.name} ${current.collection}`} eager animKey={current.slug} className="h-full w-full" />
            </Tilt>
            <span key={current.slug + "-b"} className="badge badge-accent pop-in absolute right-[2%] top-[10%] rotate-6 lg:right-[6%] lg:top-[12%] lg:!text-xs">
              {strainLabel(current.strain)}
            </span>
            <span className="pop-in absolute bottom-[6%] left-[-4%] -rotate-6 rounded-xl border-[3px] border-black bg-white px-2.5 py-1.5 text-black shadow-[3px_3px_0_#000] lg:bottom-[10%] lg:left-[2%] lg:rounded-2xl lg:px-3 lg:py-2 lg:shadow-[4px_4px_0_#000]" key={current.slug + "-s"}>
              <span className="block font-display text-sm leading-none lg:text-lg">{line?.info?.kind ?? line?.name}</span>
              <span className="block text-[0.55rem] font-extrabold uppercase tracking-[0.14em] lg:text-[0.62rem] lg:tracking-[0.18em]">{current.subtitle}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── The four lines ────────────────────────────────────────────────────── */

function Lines({ products }: { products: CatalogProduct[] }) {
  const groups = groupByLine(products);
  return (
    <section className="container py-24">
      <Heading eyebrow="The lineup" title={<>Four ways<br />to get WICK'D</>} />
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {groups.map((g, i) => {
          const hero = g.items[i % g.items.length] ?? g.items[0];
          return (
            <Link
              key={g.name}
              href={`/products?line=${g.info?.slug ?? ""}`}
              style={accentStyle(hero?.accentColor)}
              className={cn(
                "reveal group nebula card-sticker relative flex min-h-[26rem] flex-col justify-between overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1.5 sm:p-8",
                i % 2 ? "sm:translate-y-10" : ""
              )}
            >
              <div className="relative z-10 max-w-[60%]">
                <span className="badge">{String(i + 1).padStart(2, "0")} · {g.items.length} flavors</span>
                <h3 className="sticker mt-4 text-[clamp(2rem,4vw,3rem)]">{g.name}</h3>
                <p className="mt-3 text-sm font-semibold text-white/80">{g.info?.format}</p>
              </div>
              <img
                src={(hero?.collection === "THC Badder" ? hero?.imageUrl : hero?.altImageUrl) ?? hero?.imageUrl ?? undefined}
                alt=""
                loading="lazy"
                className="glow-drop pointer-events-none absolute -bottom-2 right-0 h-[74%] w-auto max-w-[62%] object-contain object-right-bottom transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:-translate-y-3 group-hover:-rotate-3 group-hover:scale-105"
              />
              <span className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 font-display text-sm text-black shadow-[3px_3px_0_#000]">
                Explore <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ─── THC Badder: liquid gold ───────────────────────────────────────────── */

function Badder({ products }: { products: CatalogProduct[] }) {
  const badder = products.filter(p => p.collection === "THC Badder");
  const info = LINES[0];
  if (!badder.length) return null;
  return (
    <section className="relative overflow-hidden py-24" style={{ ["--accent" as string]: "#ffb01f" }}>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_40%,rgba(255,176,31,0.22),transparent_70%)]" />
      <div className="container grid items-center gap-12 lg:grid-cols-[1fr_auto_1fr]">
        <div className="reveal">
          <p className="label flex items-center gap-2 text-[#ffc23d]">
            <Spark className="h-3.5 w-3.5" /> New · THC Badder
          </p>
          <h2 className="sticker mt-3 text-[clamp(2.6rem,6vw,4.8rem)]">
            Three mL
            <br />
            of <span className="text-gold [-webkit-text-stroke:0]">liquid gold</span>
          </h2>
          <p className="mt-5 max-w-md text-white/75">{info.blurb}</p>
          <ul className="mt-6 grid max-w-md grid-cols-2 gap-3 text-sm">
            {["Dosing syringe included", "3 mL · 0.101 fl oz", "5-pack display", "Texas compliant"].map(f => (
              <li key={f} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 font-semibold">
                <Spark className="h-3.5 w-3.5 text-[#ffc23d]" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/products?line=thc-badder" className="btn btn-gold mt-8">
            Shop the six flavors <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="reveal mx-auto">
          <Syringe />
        </div>
        <div className="reveal grid grid-cols-3 gap-3 sm:gap-4">
          {badder.map((p, i) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              style={accentStyle(p.accentColor)}
              className={cn("group relative rounded-2xl border-[3px] border-black bg-[var(--accent)] p-2 shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-1 hover:rotate-2", i % 2 ? "translate-y-6" : "")}
            >
              <img src={p.altImageUrl ?? p.imageUrl ?? undefined} alt={p.name} loading="lazy" className="aspect-[3/5] w-full object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110" />
              <p className="mt-1 truncate text-center text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-black">{p.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Hashhole box in 3D ────────────────────────────────────────────────── */

function HashholeBox({ products }: { products: CatalogProduct[] }) {
  const tubes = products.filter(p => p.collection === "Hashhole Tubes");
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow(true), io.disconnect()), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [tubes.length]);
  if (!tubes.length) return null;
  const accent = tubes.find(t => t.name === "Gush Mintz")?.accentColor ?? "#26a08e";
  return (
    <section style={accentStyle(accent)} className="relative py-24">
      <div className="container">
        <div className="nebula card-sticker relative overflow-hidden">
          <div className="grid items-center lg:grid-cols-[1fr_1.2fr]">
            <div className="relative z-10 p-7 sm:p-12">
              <Heading eyebrow="Hashhole Tubes · 20 CT" title={<>Hold the<br />box</>}>
                <p className="mt-5 max-w-sm text-white/75">
                  Twenty tubes to a display, two flavors per box. Drag it — it turns a little and swings back to face you.
                </p>
              </Heading>
              <div className="mt-6 flex flex-wrap gap-2">
                {tubes.map(t => (
                  <Link key={t.slug} href={`/products/${t.slug}`} style={accentStyle(t.accentColor)} className="chip !text-[0.7rem]">
                    <span className="dot" /> {t.name}
                  </Link>
                ))}
              </div>
            </div>
            <div ref={ref} className="relative h-[24rem] sm:h-[32rem]">
              {show && (
                <Suspense fallback={<div className="flex h-full items-center justify-center text-white/50">Loading 3D…</div>}>
                  <BoxViewer accent={accent} />
                </Suspense>
              )}
              <span className="label pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-white/80">
                ← Drag →
              </span>
            </div>
          </div>
          <div className="clouds opacity-10" />
        </div>
      </div>
    </section>
  );
}

/* ─── Every flavour, side-scrolling ─────────────────────────────────────── */

function Lineup({ products }: { products: CatalogProduct[] }) {
  const strip = useRef<HTMLDivElement>(null);
  const nudge = (dir: number) => strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="py-20">
      <div className="container flex flex-wrap items-end justify-between gap-6">
        <Heading eyebrow={`${products.length} flavors`} title="The full galaxy" />
        <div className="reveal flex gap-2">
          <button type="button" onClick={() => nudge(-1)} aria-label="Scroll left" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[3px_3px_0_var(--accent)]">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="Scroll right" className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[3px_3px_0_var(--accent)]">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div ref={strip} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1.25rem,calc((100vw_-_1280px)/2_+_2rem))] pb-6 pt-2">
        {products.map(p => (
          <div key={p.slug} className="w-[15.5rem] flex-none snap-start sm:w-[17rem]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Lab reports call-out ──────────────────────────────────────────────── */

function LabCallout({ count }: { count: number }) {
  const [q, setQ] = useState("");
  const [, navigate] = useLocation();
  return (
    <section className="container py-20">
      <div className="reveal card-sticker relative overflow-hidden bg-white p-7 text-black sm:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="label flex items-center gap-2 text-black/60">
              <FlaskConical className="h-4 w-4" /> Certificates of analysis
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] uppercase leading-[0.92] text-black">
              Every batch.
              <br />
              <span className="text-[var(--accent)] [-webkit-text-stroke:2px_#000] [paint-order:stroke_fill]">Tested.</span>
            </h2>
            <p className="mt-4 max-w-md text-black/70">
              Type the batch number printed on your pack (like <strong>WCD05252025</strong>) or the flavor name, and read the full panel from ACS
              Laboratory.
            </p>
            <form
              className="mt-7 flex max-w-lg gap-2"
              onSubmit={e => {
                e.preventDefault();
                navigate(`/lab-reports${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
              }}
            >
              <label htmlFor="batch-q" className="sr-only">
                Batch number or flavor
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/40" />
                <input
                  id="batch-q"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Batch # or flavor"
                  className="w-full rounded-full border-[3px] border-black bg-white py-3.5 pl-12 pr-4 font-semibold text-black outline-none placeholder:text-black/35 focus:shadow-[0_0_0_4px_var(--accent-soft)]"
                />
              </div>
              <button type="submit" className="btn btn-accent">
                Search
              </button>
            </form>
          </div>
          <div className="relative grid grid-cols-2 gap-4 sm:gap-6">
            {["seal-lab", "seal-hemp", "seal-texas", "seal-lock"].map((s, i) => (
              <div
                key={s}
                className="flex aspect-square items-center justify-center rounded-[28px] border-[3px] border-black bg-[var(--accent)] p-7 shadow-[5px_5px_0_#000] transition-transform hover:rotate-0 hover:scale-105"
                style={{ rotate: `${[-6, 5, 4, -5][i]}deg` }}
              >
                <img src={`/brand/${s}.svg`} alt="" className="h-full w-full invert" />
              </div>
            ))}
            <div className="absolute -right-3 -top-5 rotate-12 rounded-full border-[3px] border-black bg-black px-4 py-2 font-display text-xl text-white shadow-[3px_3px_0_var(--accent)]">
              {count} reports
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function Home() {
  useTitle("");
  const products = trpc.catalog.publicProducts.useQuery().data ?? [];
  const videos = trpc.videos.publicList.useQuery().data ?? [];
  const reportCount = products.reduce((n, p) => n + p.reportCount, 0);
  useReveal([products.length, videos.length]);
  const packs = useMemo(() => products.filter((_, i) => i % 5 === 0).map(p => p.imageUrl!).filter(Boolean), [products]);

  return (
    <PublicLayout>
      <Hero products={products} />

      <div className="marquee-band -rotate-[1.2deg] py-3">
        <Marquee
          speed={26}
          items={["THC Badder", "Indoor Exotic Duo", "Diamond Infused Trio", "Hashhole Tubes", "Lab tested"].map(w => (
            <span key={w} className="font-display text-2xl uppercase sm:text-4xl">
              {w}
            </span>
          ))}
        />
      </div>

      <Lines products={products} />
      <Badder products={products} />
      <HashholeBox products={products} />
      <Lineup products={products} />
      <LabCallout count={reportCount} />

      {videos.length > 0 && (
        <section className="container py-20">
          <Heading eyebrow="On camera" title="WICK'D in motion" />
          <div className="no-scrollbar mt-10 flex snap-x gap-5 overflow-x-auto pb-4">
            {videos.map(v => (
              <ReelVideo key={v.id} src={v.fileUrl} poster={v.posterUrl} title={v.title} className="card-sticker w-[15rem] flex-none snap-start sm:w-[18rem]" />
            ))}
          </div>
        </section>
      )}

      <section className="container py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <Heading eyebrow="Join the orbit" title={<>Stick with<br />WICK'D</>}>
              <p className="mt-5 max-w-md text-white/75">New flavors, new drops and new lab reports, straight to your inbox. Meanwhile, slap a few stickers on the wall.</p>
            </Heading>
            <Newsletter big className="reveal mt-8" />
            <Logo className="reveal mt-10 hidden h-auto w-40 rotate-[-8deg] opacity-90 lg:block" />
          </div>
          <div className="reveal">
            <StickerWall key={packs.length} packs={packs} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
