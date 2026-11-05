import { PublicLayout } from "@/components/PublicLayout";
import { useTitle } from "@/lib/catalog";
import { Link } from "wouter";

export default function NotFound() {
  useTitle("Not found");
  return (
    <PublicLayout>
      <div className="container grid min-h-[65vh] place-items-center text-center">
        <div>
          <p className="outline-text text-[clamp(7rem,25vw,16rem)] leading-none">404</p>
          <h1 className="sticker -mt-6 text-5xl">Lost in space</h1>
          <p className="mt-4 text-white/65">This page drifted out of orbit.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-accent">
              Back home
            </Link>
            <Link href="/products" className="btn btn-line">
              Products
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
