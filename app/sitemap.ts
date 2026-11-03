import type {MetadataRoute} from 'next';
import {canonical} from '@/lib/seo';
import {readCatalog,publicCatalog} from '@/lib/store';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const {products}=publicCatalog(await readCatalog());
 return ['/', '/about', '/products', '/contact', '/lab-reports', ...products.map(p=>'/products/'+p.id)].map(path=>({url:canonical(path)}));
}
