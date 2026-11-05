import { Heading } from "@/components/Bits";
import { ProductCard } from "@/components/ProductCard";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal, useSiteAccent, useTitle } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { STRAINS } from "@shared/const";
import { groupByLine, lineSlug } from "@shared/lines";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";

export default function Products() {
  useTitle("Products");
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const line = params.get("line") ?? "";
  const type = params.get("type") ?? "";
  const [q, setQ] = useState("");

  const { data: products = [], isLoading } = trpc.catalog.publicProducts.useQuery();
  const groups = useMemo(() => groupByLine(products), [products]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(search);
    if (value) next.set(key, value);
    else next.delete(key);
    const s = next.toString();
    navigate(`/products${s ? `?${s}` : ""}`, { replace: true });
  };

  const shown = products.filter(
    p =>
      (!line || lineSlug(p.collection) === line) &&
      (!type || p.strain === type) &&
      (!q.trim() || `${p.name} ${p.collection}`.toLowerCase().includes(q.trim().toLowerCase()))
  );
  const activeGroup = groups.find(g => lineSlug(g.name) === line);
  useSiteAccent(activeGroup?.items[0]?.accentColor ?? shown[0]?.accentColor);
  useReveal([shown.length, line]);

  const shownGroups = groupByLine(shown);

  return (
    <PublicLayout>
      <section className="container pt-10 sm:pt-16">
        <Heading as="h1" eyebrow={`${products.length} flavors · ${groups.length} lines`} title={activeGroup ? activeGroup.name : "The WICK'D lineup"}>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            {activeGroup?.info?.blurb ??
              "THC Badder syringes, Indoor Exotic Duo and Diamond Infused Trio pre-rolls, and Hashhole Tubes. Pick a line or a type, or search a flavor."}
          </p>
        </Heading>

        <div className="sticky top-[72px] z-30 -mx-5 mt-8 border-y border-white/10 bg-[#07030f]/80 px-5 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 xl:flex-wrap">
              <button type="button" className="chip" aria-pressed={!line} onClick={() => setParam("line", "")}>
                All
              </button>
              {groups.map(g => (
                <button key={g.name} type="button" className="chip" aria-pressed={line === lineSlug(g.name)} onClick={() => setParam("line", lineSlug(g.name))}>
                  {g.name} <span className="opacity-60">{g.items.length}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                {STRAINS.map(s => (
                  <button key={s} type="button" className="chip !px-3 !text-[0.7rem]" aria-pressed={type === s} onClick={() => setParam("type", type === s ? "" : s)}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative min-w-0 flex-1 lg:w-56 lg:flex-none">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <label htmlFor="q" className="sr-only">
                  Search flavors
                </label>
                <input id="q" value={q} onChange={e => setQ(e.target.value)} placeholder="Search flavor" className="field !rounded-full !py-2.5 !pl-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-sticker aspect-[3/4] animate-pulse bg-white/5" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="panel mx-auto max-w-md p-10 text-center">
            <p className="sticker text-3xl">Nothing here</p>
            <p className="mt-3 text-white/65">No flavor matches those filters.</p>
            <button
              type="button"
              className="btn btn-white mt-6"
              onClick={() => {
                setQ("");
                navigate("/products", { replace: true });
              }}
            >
              <X className="h-4 w-4" /> Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-20">
            {shownGroups.map(g => (
              <div key={g.name}>
                {!line && (
                  <div className="reveal mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="sticker text-[clamp(1.9rem,4vw,3rem)]">{g.name}</h2>
                      <p className="mt-2 font-semibold text-white/60">{g.info?.format}</p>
                    </div>
                    <button type="button" className="chip" onClick={() => setParam("line", lineSlug(g.name))}>
                      Only {g.info?.kind ?? g.name}
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
                  {g.items.map((p, i) => (
                    <div key={p.slug} className="reveal" style={{ transitionDelay: `${(i % 4) * 60}ms` }}>
                      <ProductCard product={p} eager={i < 4} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
