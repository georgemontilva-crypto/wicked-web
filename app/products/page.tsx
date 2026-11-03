import {canonical} from '@/lib/seo';
import {readCatalog,publicCatalog} from '@/lib/store';
import {CatalogBrowser} from '@/components/catalog-browser';
export const dynamic='force-dynamic';export async function generateMetadata(){const {settings}=await readCatalog();return {alternates:{canonical:canonical('/products')},title:'Products',description:settings.productsDescription};}
export default async function Products(){const d=publicCatalog(await readCatalog());return <main><div className="page-intro page-width"><h1>{d.settings.productsTitle}</h1><p>{d.settings.productsDescription}</p></div><CatalogBrowser products={d.products}/></main>;}
