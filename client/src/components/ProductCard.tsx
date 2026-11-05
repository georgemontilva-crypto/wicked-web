import { accentStyle, strainLabel, type CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { lineInfo } from "@shared/lines";
import { FlaskConical } from "lucide-react";
import { Link } from "wouter";

/**
 * One flavour as a sticker card: its own nebula behind the cut-out pack, the
 * line on a black badge and the flavour name in Montserrat like the pouch.
 * Hovering pops the pack out of the card.
 */
export function ProductCard({ product, className, eager }: { product: CatalogProduct; className?: string; eager?: boolean }) {
  const info = lineInfo(product.collection);
  return (
    <Link
      href={`/products/${product.slug}`}
      style={accentStyle(product.accentColor)}
      className={cn(
        "group card-sticker nebula relative flex flex-col overflow-hidden transition-[transform,box-shadow] duration-300 [transition-timing-function:var(--ease-spring)] hover:-translate-y-1.5 hover:-rotate-[0.6deg] hover:shadow-[9px_10px_0_#000]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 p-4">
        <span className="badge">{info?.kind ?? product.collection}</span>
        {product.reportCount > 0 && (
          <span className="badge badge-accent" title="Lab report available">
            <FlaskConical className="h-3 w-3" /> COA
          </span>
        )}
      </div>
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[17rem] px-6">
        <div className="pack-shadow !bottom-0" />
        <img
          src={product.imageUrl ?? undefined}
          alt={`${product.name} ${product.collection ?? ""}`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="glow-drop relative h-full w-full select-none object-contain transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-hover:-translate-y-3 group-hover:scale-[1.07] group-hover:rotate-2"
        />
      </div>
      <div className="relative mt-auto border-t-[3px] border-black bg-black/55 p-4 backdrop-blur-sm">
        <h3 className="strain text-[1.35rem] text-white">{product.name}</h3>
        <p className="mt-1.5 flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white/65">
          <span className="dot" />
          {strainLabel(product.strain)}
          {product.subtitle && <span className="truncate text-white/45">· {product.subtitle}</span>}
        </p>
      </div>
    </Link>
  );
}
