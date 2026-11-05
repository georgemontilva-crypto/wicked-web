import { Heading, Spark } from "@/components/Bits";
import { PdfModal, type ReportLike } from "@/components/PdfModal";
import { PublicLayout } from "@/components/PublicLayout";
import { accentStyle, formatDate, strainLabel, useReveal, useTitle } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { groupByLine, lineSlug } from "@shared/lines";
import { Download, FileText, FlaskConical, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";

type Row = ReportLike & { productName: string; slug: string; collection: string | null; strain: string | null; accentColor: string | null; imageUrl: string | null };

/**
 * Every published certificate, searchable by batch number or flavor. The QR on
 * a pack can point here with ?q=<batch> so the right report is waiting.
 */
export default function LabReports() {
  useTitle("Lab Reports");
  const search = useSearch();
  const [q, setQ] = useState(() => new URLSearchParams(search).get("q") ?? "");
  const [line, setLine] = useState("");
  const [open, setOpen] = useState<Row | null>(null);
  const { data = [], isLoading } = trpc.catalog.publicReports.useQuery();

  useEffect(() => {
    const fromUrl = new URLSearchParams(search).get("q");
    if (fromUrl !== null) setQ(fromUrl);
  }, [search]);

  const rows: Row[] = useMemo(
    () =>
      data.flatMap(p =>
        p.reports.map(r => ({
          ...r,
          productName: p.name,
          slug: p.slug,
          collection: p.collection,
          strain: p.strain,
          accentColor: p.accentColor,
          imageUrl: p.imageUrl,
        }))
      ),
    [data]
  );
  const lines = groupByLine(data).filter(g => g.items.some(p => p.reports.length));
  const needle = q.trim().toLowerCase();
  const shown = rows.filter(
    r =>
      (!line || lineSlug(r.collection) === line) &&
      (!needle || [r.productName, r.batch, r.collection, r.lab].filter(Boolean).join(" ").toLowerCase().includes(needle))
  );
  const pending = data.filter(p => !p.reports.length);
  useReveal([shown.length]);

  return (
    <PublicLayout>
      <section className="container pt-10 sm:pt-16">
        <Heading as="h1" eyebrow={`${rows.length} certificates · ACS Laboratory`} title={<>Lab<br />reports</>}>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            Find the certificate of analysis for your pack. Search the batch number printed on it, or the flavor name.
          </p>
        </Heading>

        <div className="mt-8 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <label htmlFor="report-q" className="sr-only">
              Batch number or flavor
            </label>
            <input
              id="report-q"
              autoFocus={!!q}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Batch number (e.g. WCD05252025) or flavor"
              className="field !rounded-full !py-4 !pl-14 !text-lg"
            />
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <button type="button" className="chip" aria-pressed={!line} onClick={() => setLine("")}>
              All
            </button>
            {lines.map(g => (
              <button key={g.name} type="button" className="chip" aria-pressed={line === lineSlug(g.name)} onClick={() => setLine(lineSlug(g.name))}>
                {g.info?.kind ?? g.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-10">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="panel mx-auto max-w-lg p-10 text-center">
            <FlaskConical className="mx-auto h-10 w-10 text-[var(--accent)]" />
            <p className="sticker mt-4 text-3xl">No match</p>
            <p className="mt-3 text-white/65">
              We couldn't find a report for “{q}”. Check the batch number on your pack, or{" "}
              <Link href="/contact?topic=Lab%20report" className="underline decoration-[var(--accent)] decoration-2 underline-offset-4">
                send us a message
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {shown.map((r, i) => (
              <li key={r.id} className="reveal min-w-0" style={{ ...accentStyle(r.accentColor), transitionDelay: `${(i % 2) * 60}ms` }}>
                <div className="group nebula card-sticker flex items-center gap-3 p-3.5 sm:gap-4 sm:p-5">
                  <Link href={`/products/${r.slug}`} className="relative h-20 w-14 flex-none sm:h-28 sm:w-24" aria-label={r.productName}>
                    <img src={r.imageUrl ?? undefined} alt="" loading="lazy" className="glow-drop h-full w-full object-contain transition-transform group-hover:scale-110 group-hover:-rotate-3" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="label truncate text-white/60">{r.collection}</p>
                    <p className="strain mt-1 text-lg leading-tight sm:truncate sm:text-xl">{r.productName}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
                      <span className="font-display tracking-wide text-white">#{r.batch}</span>
                      {r.testedOn && <span>{formatDate(r.testedOn)}</span>}
                      {r.strain && <span className="inline-flex items-center gap-1.5"><span className="dot" />{strainLabel(r.strain)}</span>}
                    </p>
                  </div>
                  <div className="flex flex-none flex-col gap-2 sm:flex-row">
                    <button type="button" onClick={() => setOpen(r)} aria-label={`View ${r.productName} report`} className="btn btn-accent !px-3 !py-2.5 !text-xs sm:!px-4">
                      <FileText className="h-4 w-4" /> <span className="hidden sm:inline">View</span>
                    </button>
                    <a href={r.fileUrl} download className="btn btn-line !px-3 !py-2.5 !text-xs sm:!px-4" aria-label={`Download ${r.productName} report`}>
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!needle && !line && pending.length > 0 && (
          <div className="reveal panel mt-12 p-6 sm:p-8">
            <p className="label flex items-center gap-2 text-white/60">
              <Spark className="h-3.5 w-3.5" /> Coming soon
            </p>
            <p className="mt-2 text-white/75">Reports on the way for:</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pending.map(p => (
                <Link key={p.slug} href={`/products/${p.slug}`} style={accentStyle(p.accentColor)} className="chip !text-[0.7rem]">
                  <span className="dot" /> {p.name} <span className="opacity-60">· {p.collection}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <PdfModal report={open} productName={open ? `${open.productName} · ${open.collection}` : undefined} onClose={() => setOpen(null)} />
    </PublicLayout>
  );
}
