import {NewsletterForm} from '@/components/newsletter-form';
import {canonical} from '@/lib/seo';
import Link from 'next/link';
import {FileText,ArrowUpRight} from 'lucide-react';
import {readCatalog,publicCatalog} from '@/lib/store';
import {Scene} from '@/components/scene';
import {ProductCard} from '@/components/product-card';
export const metadata={alternates:{canonical:canonical('/')}};
export const dynamic='force-dynamic';
export default async function Home(){
 const data=publicCatalog(await readCatalog()),s=data.settings;
 return <main>
  <section className="hero page-width"><div className="hero-copy"><h1>{s.heroTitle}</h1><p className="hero-description">{s.heroDescription}</p><div className="hero-actions"><Link className="button solid" href="/products">{s.homePrimaryLabel}<ArrowUpRight size={17}/></Link><Link className="button ghost" href="/lab-reports"><FileText size={17}/>{s.homeSecondaryLabel}</Link></div></div>{s.heroImage?<div className="hero-glass-art"><img src={s.heroImage} alt="WICK’D Indoor Exotic THC Pre-rolls product artwork" fetchPriority="high"/><div className="hero-glass-reflection" aria-hidden="true"/></div>:<Scene model={s.heroModel}/>}</section>
  <section className="collection-band"><div className="collection-section page-width"><div className="section-heading"><div><h2>{s.collectionTitle}</h2><p className="section-subtitle">{s.collectionDescription}</p></div><Link href="/products" className="text-link">{s.collectionLinkLabel}<ArrowUpRight size={17}/></Link></div><div className="product-grid">{data.products.slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}</div></div></section>
  <section className="product-showcase" aria-labelledby="showcase-title"><h2 id="showcase-title">{s.showcaseTitle}</h2><div className="showcase-model"><Scene model={s.heroModel} open/></div><p>{s.showcaseDescription}</p></section>
  <section className="feature-band"><div className="feature-block page-width">{s.featureImage&&<figure className="feature-figure"><div className="feature-image"><img src={s.featureImage} alt={s.featureCaption||'Product packaging detail'} loading="lazy"/></div>{s.featureCaption&&<figcaption>{s.featureCaption}</figcaption>}</figure>}<div className="feature-copy"><h2>{s.featureTitle}</h2><h3 className="section-subheading">{s.featureSubtitle}</h3><p className="feature-description">{s.featureDescription}</p><Link className="button solid" href={s.featureLink}>{s.featureButtonLabel}<ArrowUpRight size={17}/></Link></div></div></section>
  <NewsletterForm/>
 </main>;
}
