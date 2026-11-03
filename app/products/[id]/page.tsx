import {canonical} from '@/lib/seo';
import {notFound} from 'next/navigation';
import {readCatalog,publicCatalog} from '@/lib/store';
import {ProductDetail} from '@/components/product-detail';
import {ProductCard} from '@/components/product-card';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const d=publicCatalog(await readCatalog()),p=d.products.find(p=>p.id===id);return {alternates:p?{canonical:canonical('/products/'+p.id)}:undefined,title:p?p.name:'Product not found',description:p?.description};}
export default async function ProductPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{variant?:string}>}){const {id}=await params,{variant}=await searchParams,d=publicCatalog(await readCatalog()),p=d.products.find(p=>p.id===id);if(!p)notFound();return <main><ProductDetail product={p} reports={d.reports} initialVariant={variant}/><section className="related page-width"><p className="eyebrow" style={{marginBottom:15}}>EXPLORE MORE COLLECTIONS</p><h2>More from WICK'D.</h2><div className="product-grid">{d.products.filter(a=>a.id!==id).slice(0,4).map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div></section></main>;}
