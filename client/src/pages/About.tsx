import { Heading, Marquee, Spark, Tilt } from "@/components/Bits";
import { PublicLayout } from "@/components/PublicLayout";
import { accentStyle, useReveal, useTitle } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { groupByLine } from "@shared/lines";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

const ART = [
  { src: "/art/granddaddy-purple.webp", label: "Granddaddy Purple · Duo", rot: -5, accent: "#8b3cae" },
  { src: "/art/white-runtz.webp", label: "White Runtz · Duo", rot: 4, accent: "#e48498" },
  { src: "/art/northern-lights.webp", label: "Northern Lights · Duo", rot: -2, accent: "#139b96" },
];

export default function About() {
  useTitle("About Us");
  const products = trpc.catalog.publicProducts.useQuery().data ?? [];
  const groups = groupByLine(products);
  useReveal([products.length]);

  return (
    <PublicLayout>
      <section className="container pt-10 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <Heading as="h1" eyebrow="About us" title={<>Meet<br />WICK'D</>}>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              WICK'D is more than a collection of products. It's a world of bold visuals, distinctive varieties and unique presentations.
            </p>
            <p className="mt-4 max-w-xl text-white/70">
              From golden THC Badder syringes and Indoor Exotic Duo pouches to Diamond Infused Trio and Hashhole Tubes, every part of the WICK'D lineup
              brings its own character to the experience.
            </p>
          </Heading>
          <div className="reveal relative mx-auto h-[28rem] w-full max-w-md sm:h-[32rem]">
            {ART.map((a, i) => (
              <figure
                key={a.src}
                style={{ ...accentStyle(a.accent), rotate: `${a.rot}deg`, top: `${i * 12}%`, left: `${[0, 26, 10][i]}%`, zIndex: i }}
                className="card-sticker absolute w-[68%] overflow-hidden bg-black transition-transform duration-300 hover:z-10 hover:scale-105 hover:rotate-0"
              >
                <img src={a.src} alt={a.label} loading="lazy" className="aspect-square w-full object-cover" />
                <figcaption className="label border-t-[3px] border-black bg-[var(--accent)] px-3 py-2 text-white">{a.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <div className="marquee-band mt-20 rotate-[1deg] py-3">
        <Marquee
          items={["Your flavor", "Your format", "Smooth", "Potent", "Premium"].map(w => (
            <span key={w} className="font-display text-2xl uppercase sm:text-4xl">
              {w}
            </span>
          ))}
        />
      </div>

      <section className="container py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <Heading eyebrow="Your flavor. Your format." title={<>Variety is<br />the point</>}>
            <p className="mt-6 max-w-xl text-white/75">
              From the iconic Northern Lights and Granddaddy Purple to fruit-inspired names like Pineapple Punch and Lemon Cherry, WICK'D brings
              together a diverse lineup designed around variety and individuality.
            </p>
            <p className="mt-4 max-w-xl text-white/75">
              Different formats, distinctive packaging, and a lineup that's unmistakably WICK'D — with a lab report published for every batch we
              have tested.
            </p>
          </Heading>
          <div className="grid grid-cols-2 gap-4">
            {groups.map((g, i) => (
              <Link
                key={g.name}
                href={`/products?line=${g.info?.slug ?? ""}`}
                style={accentStyle(g.items[(i * 2 + 1) % g.items.length]?.accentColor)}
                className="reveal group nebula card-sticker relative flex aspect-[4/5] flex-col justify-between overflow-hidden p-5"
              >
                <span className="badge w-fit">{g.items.length} flavors</span>
                <Tilt className="absolute inset-x-6 bottom-16 top-12" max={10}>
                  <img src={g.items[(i * 2 + 1) % g.items.length]?.imageUrl ?? undefined} alt="" loading="lazy" className="glow-drop h-full w-full object-contain transition-transform duration-500 group-hover:scale-110" />
                </Tilt>
                <span className="relative font-display text-lg uppercase leading-tight">{g.name}</span>
                <span className="sr-only">Line {i + 1}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-10">
        <div className="reveal card-sticker grid gap-8 bg-white p-7 text-black sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="label flex items-center gap-2 text-black/55">
              <Spark className="h-3.5 w-3.5" /> A different side of WICK'D
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.8rem)] uppercase leading-[0.95]">More than packaging. A visual statement.</h2>
            <p className="mt-5 max-w-2xl text-black/70">
              Expressive artwork, striking colors and distinctive packaging give each collection a personality of its own. From the first glance to the
              smallest detail, the WICK'D aesthetic is made to stand out — different styles, all connected by one unmistakable identity.
            </p>
          </div>
          <Link href="/products" className="btn btn-accent">
            See the lineup <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
