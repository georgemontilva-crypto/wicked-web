import { AgeGate } from "@/components/AgeGate";
import { BackToTop } from "@/components/BackToTop";
import { Logo, Marquee, Spark } from "@/components/Bits";
import { Newsletter } from "@/components/Newsletter";
import { Starfield } from "@/components/Starfield";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { DEFAULT_CONTACT } from "@shared/const";
import { LINES } from "@shared/lines";
import { FlaskConical, Instagram, Mail, Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Link, useLocation } from "wouter";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/lab-reports", label: "Lab Reports" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

function isActive(location: string, href: string) {
  return href === "/" ? location === "/" : location.startsWith(href);
}

function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          "transition-[background,backdrop-filter,border-color] duration-300",
          scrolled || open
            ? "border-b border-white/10 bg-[#07030f]/75 backdrop-blur-xl"
            : "border-b border-transparent"
        )}
      >
        <div className="container flex h-[72px] items-center justify-between gap-4">
          <Link href="/" aria-label="WICK'D home" className="group block">
            <Logo eager className="h-11 w-auto -rotate-3 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 sm:h-12" />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.slice(1).map(item => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(location, item.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-[0.8rem] font-bold uppercase tracking-[0.12em] transition-colors",
                  isActive(location, item.href)
                    ? "bg-white text-black"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/lab-reports" className="btn btn-accent hidden !px-5 !py-3 !text-[0.8rem] sm:inline-flex">
              <FlaskConical className="h-4 w-4" />
              Find my batch
            </Link>
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[3px_3px_0_var(--accent)] lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-[#07030f]/95 backdrop-blur-xl lg:hidden">
          <nav aria-label="Mobile" className="container flex flex-col gap-1 py-8">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(location, item.href) ? "page" : undefined}
                className="pop-in sticker block py-2 text-[2.6rem]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="container pb-10">
            <p className="label text-white/50">Lines</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {LINES.map(l => (
                <Link key={l.slug} href={`/products?line=${l.slug}`} className="chip">
                  {l.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer({ footerRef }: { footerRef: RefObject<HTMLElement | null> }) {
  const details = trpc.site.contactDetails.useQuery().data ?? DEFAULT_CONTACT;
  return (
    <footer ref={footerRef} className="relative mt-24">
      <div className="marquee-band py-3">
        <Marquee
          items={["Smooth", "Potent", "Premium", "21+ only", "Lab tested", "Texas compliant"].map(w => (
            <span key={w} className="font-display text-2xl uppercase tracking-wide sm:text-3xl">
              {w}
            </span>
          ))}
        />
      </div>
      <div className="relative bg-black">
        <div className="container grid gap-12 py-16 lg:grid-cols-[1.1fr_1fr_1fr]">
          <div>
            <Logo className="h-auto w-48 -rotate-3" />
            <p className="mt-5 max-w-sm text-white/60">
              THC Badder, Indoor Exotic Duo, Diamond Infused Trio and Hashhole Tubes. Every batch with its lab report.
            </p>
            <Newsletter className="mt-8" />
          </div>
          <div>
            <p className="label text-white/45">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map(n => (
                <li key={n.href}>
                  <Link href={n.href} className="font-semibold text-white/80 transition-colors hover:text-white">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="label mt-8 text-white/45">Lines</p>
            <ul className="mt-4 space-y-2.5">
              {LINES.map(l => (
                <li key={l.slug}>
                  <Link href={`/products?line=${l.slug}`} className="text-white/70 transition-colors hover:text-white">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label text-white/45">Contact</p>
            <ul className="mt-4 space-y-3 text-white/75">
              {details.company && <li className="font-semibold text-white">{details.company}</li>}
              {details.email && (
                <li>
                  <a href={`mailto:${details.email}`} className="inline-flex items-center gap-2 hover:text-white">
                    <Mail className="h-4 w-4" /> {details.email}
                  </a>
                </li>
              )}
              {details.phone && (
                <li>
                  <a href={`tel:${details.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 hover:text-white">
                    <Phone className="h-4 w-4" /> {details.phone}
                  </a>
                </li>
              )}
              {details.address && <li className="text-white/60">{details.address}</li>}
              {details.instagram && (
                <li>
                  <a href={details.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                    <Instagram className="h-4 w-4" /> Instagram
                  </a>
                </li>
              )}
              <li>
                <Link href="/contact" className="btn btn-white mt-2 !py-3 !text-sm">
                  Send a message
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container border-t border-white/10 py-8 text-[0.72rem] leading-relaxed text-white/45">
          <p>
            <strong className="text-white/70">FDA Disclosure:</strong> This product is not for use by or sale to persons under the age of 18 or 21
            depending on the laws of your governing state or territory. This product should be used only as directed on the label. It should not be
            used if you are pregnant or nursing. Consult with a physician before use, especially if you have a medical condition or use prescription
            medications. A doctor's advice should be sought before using any of these products. All trademarks and copyrights are property of their
            respective owners and are not affiliated with nor do they endorse this product. These statements have not been evaluated by the FDA.
            These products are not intended to diagnose, treat, cure or prevent any disease. By using this site you agree to follow the Privacy Policy
            and all Terms &amp; Conditions printed on this site. Void Where Prohibited By Law.
          </p>
          <p className="mt-5 flex flex-wrap items-center gap-2 font-display text-sm text-white/70">
            <Spark className="h-3.5 w-3.5" /> © {new Date().getFullYear()} WICK'D. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const footerRef = useRef<HTMLElement | null>(null);
  return (
    <div className="relative flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        Skip to content
      </a>
      <Starfield />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer footerRef={footerRef} />
      <BackToTop footerRef={footerRef} />
      <AgeGate />
    </div>
  );
}
