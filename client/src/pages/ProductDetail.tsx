import { FloatingPack, Heading, Spark, Tilt } from "@/components/Bits";
import { PdfModal, type ReportLike } from "@/components/PdfModal";
import { ProductCard } from "@/components/ProductCard";
import { PublicLayout } from "@/components/PublicLayout";
import { accentStyle, formatDate, strainLabel, useReveal, useSiteAccent, useTitle } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { parseFacts } from "@shared/const";
import { lineInfo, lineSlug } from "@shared/lines";
import { ArrowLeft, ArrowRight, FileText, FlaskConical, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";

export default function ProductDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: p, isLoading, error } = trpc.catalog.productBySlug.useQuery({ slug }, { retry: false });
  const all = trpc.catalog.publicProducts.useQuery().data ?? [];
  const [view, setView] = useState<"pack" | "display">("pack");
  const [open, setOpen] = useState<ReportLike | null>(null);
  useTitle(p ? `${p.name} · ${p.collection}` : "Product");
  useSiteAccent(p?.accentColor);
  useReveal([p?.slug]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container grid min-h-[70vh] place-items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-[var(--accent)]" />
        </div>
      </PublicLayout>
    );
  }
  if (error || !p) {
    return (
      <PublicLayout>
        <div className="container grid min-h-[60vh] place-items-center text-center">
          <div>
            <p className="sticker text-5xl">Lost in space</p>
            <p className="mt-4 text-white/65">That flavor isn't here.</p>
            <Link href="/products" className="btn btn-accent mt-8">
              All products
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const info = lineInfo(p.collection);
  const siblings = all.filter(o => o.collection === p.collection);
  const at = siblings.findIndex(o => o.slug === p.slug);
  const prev = siblings[(at - 1 + siblings.length) % siblings.length];
  const next = siblings[(at + 1) % siblings.length];
  const sameName = all.filter(o => o.name === p.name && o.slug !== p.slug);
  const facts = parseFacts(p.facts);
  const img = view === "display" && p.altImageUrl ? p.altImageUrl : p.imageUrl;
  // THC Badder leads with its 5-pack display (the sharper shot); the rest lead with the pouch or tube.
  const photoLabels =
    p.collection === "THC Badder" ? ["Display", "Pouch"] : [p.collection === "Hashhole Tubes" ? "Tube" : "Pouch", "Display"];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-6 select-none overflow-hidden">
          <p key={p.slug} className="outline-text warp-in whitespace-nowrap text-center text-[clamp(5rem,18vw,16rem)] leading-none opacity-40">
            {p.name}
          </p>
        </div>
        <div className="container relative pb-16 pt-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/60">
            <Link href="/products" className="inline-flex items-center gap-1.5 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Products
            </Link>
            <span>/</span>
            <Link href={`/products?line=${lineSlug(p.collection)}`} className="hover:text-white">
              {p.collection}
            </Link>
          </nav>

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div className="relative">
              <div className="relative mx-auto aspect-square w-full max-w-[36rem]">
                <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_65%)] opacity-60 blur-2xl" />
                <Tilt className="absolute inset-[4%]" max={14}>
                  <FloatingPack src={img} alt={`${p.name} ${view === "display" ? "display" : "pack"}`} eager animKey={`${p.slug}-${view}`} className="h-full w-full" />
                </Tilt>
              </div>
              {p.altImageUrl && (
                <div className="mt-2 flex justify-center gap-2" role="group" aria-label="Photo">
                  <button type="button" className="chip" aria-pressed={view === "pack"} onClick={() => setView("pack")}>
                    {photoLabels[0]}
                  </button>
                  <button type="button" className="chip" aria-pressed={view === "display"} onClick={() => setView("display")}>
                    {photoLabels[1]}
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge">{p.collection}</span>
                {p.strain && <span className="badge badge-accent">{strainLabel(p.strain)}</span>}
              </div>
              <h1 className="sticker mt-4 text-[clamp(3rem,7.5vw,6rem)]">{p.name}</h1>
              {p.subtitle && <p className="mt-3 text-lg font-bold uppercase tracking-[0.14em] text-white/75">{p.subtitle}</p>}
              {p.description && <p className="mt-5 max-w-xl text-lg text-white/80">{p.description}</p>}

              {siblings.length > 1 && (
                <div className="mt-7">
                  <p className="label text-white/50">Other {info?.kind ?? ""} flavors</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {siblings.map(o => (
                      <Link key={o.slug} href={`/products/${o.slug}`} style={accentStyle(o.accentColor)} aria-current={o.slug === p.slug ? "true" : undefined} className="chip !text-[0.72rem]">
                        <span className="dot" /> {o.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {p.reports[0] ? (
                  <button type="button" className="btn btn-accent" onClick={() => setOpen(p.reports[0])}>
                    <FlaskConical className="h-5 w-5" /> View lab report
                  </button>
                ) : (
                  <span className="btn btn-line pointer-events-none opacity-80">
                    <FlaskConical className="h-5 w-5" /> Lab report coming soon
                  </span>
                )}
                <Link href={`/contact?topic=${encodeURIComponent("Product question")}`} className="btn btn-line">
                  <Mail className="h-5 w-5" /> Ask about it
                </Link>
              </div>
            </div>
          </div>

          {siblings.length > 1 && (
            <div className="mt-12 flex items-center justify-between gap-3">
              <Link href={`/products/${prev.slug}`} style={accentStyle(prev.accentColor)} className="group inline-flex items-center gap-3 rounded-full border-2 border-white/15 bg-black/40 py-2 pl-2 pr-5 backdrop-blur transition-colors hover:border-[var(--accent)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[var(--accent)]">
                  <ArrowLeft className="h-5 w-5" />
                </span>
                <span className="strain text-sm">{prev.name}</span>
              </Link>
              <Link href={`/products/${next.slug}`} style={accentStyle(next.accentColor)} className="group inline-flex items-center gap-3 rounded-full border-2 border-white/15 bg-black/40 py-2 pl-5 pr-2 backdrop-blur transition-colors hover:border-[var(--accent)]">
                <span className="strain text-sm">{next.name}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[var(--accent)]">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="container grid gap-6 py-10 lg:grid-cols-2">
        <div className="reveal card-sticker bg-white p-7 text-black sm:p-9">
          <p className="label text-black/55">On the label</p>
          <h2 className="mt-2 font-display text-4xl uppercase">Product facts</h2>
          <dl className="mt-6 divide-y-2 divide-black/10">
            {facts.map(f => (
              <div key={f.label} className="flex items-start justify-between gap-6 py-3">
                <dt className="text-sm font-bold uppercase tracking-[0.08em] text-black/60">{f.label}</dt>
                <dd className="text-right font-extrabold">{f.value}</dd>
              </div>
            ))}
            {p.strain && (
              <div className="flex items-start justify-between gap-6 py-3">
                <dt className="text-sm font-bold uppercase tracking-[0.08em] text-black/60">Type</dt>
                <dd className="text-right font-extrabold">{strainLabel(p.strain)}</dd>
              </div>
            )}
          </dl>
          <p className="mt-5 text-xs text-black/50">Transcribed from the packaging. The label on your product is the reference.</p>
        </div>

        <div className="reveal nebula card-sticker p-7 sm:p-9">
          <p className="label flex items-center gap-2 text-white/70">
            <Spark className="h-3.5 w-3.5" /> Certificate of analysis
          </p>
          <h2 className="sticker mt-2 text-4xl">Lab reports</h2>
          {p.reports.length ? (
            <ul className="mt-6 space-y-3">
              {p.reports.map(r => (
                <li key={r.id}>
                  <button type="button" onClick={() => setOpen(r)} className="group flex w-full items-center gap-4 rounded-2xl border-2 border-black bg-black/55 p-4 text-left shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border-2 border-black bg-[var(--accent)]">
                      <FileText className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg">Batch {r.batch ?? "—"}</span>
                      <span className="block text-sm text-white/65">
                        {[r.lab, r.testedOn && formatDate(r.testedOn)].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-white/75">
              The report for this flavor is on its way. Check back soon, or{" "}
              <Link href="/contact" className="underline decoration-[var(--accent)] decoration-2 underline-offset-4">
                ask us
              </Link>
              .
            </p>
          )}
          <Link href="/lab-reports" className="btn btn-white mt-7">
            All lab reports
          </Link>
        </div>
      </section>

      {sameName.length > 0 && (
        <section className="container py-14">
          <Heading eyebrow="Same flavor" title={`${p.name} in other formats`} />
          <div className={cn("mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4")}>
            {sameName.map(o => (
              <ProductCard key={o.slug} product={o} />
            ))}
          </div>
        </section>
      )}

      <PdfModal report={open} productName={`${p.name} · ${p.collection}`} onClose={() => setOpen(null)} />
    </PublicLayout>
  );
}
