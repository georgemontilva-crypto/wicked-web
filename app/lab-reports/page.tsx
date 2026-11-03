import {canonical} from '@/lib/seo';
import {readCatalog,publicCatalog} from '@/lib/store';
import {ReportLibrary} from '@/components/report-library';
export const dynamic='force-dynamic';
export async function generateMetadata(){const {settings}=await readCatalog();return {alternates:{canonical:canonical('/lab-reports')},title:'Lab Reports',description:settings.reportsDescription};}
export default async function LabReports({searchParams}:{searchParams:Promise<{product?:string}>}){const {product}=await searchParams,d=publicCatalog(await readCatalog());return <main><div className="page-intro page-width"><h1 style={{whiteSpace:'pre-line'}}>{d.settings.reportsTitle}</h1><p>{d.settings.reportsDescription}</p></div><ReportLibrary products={d.products} reports={d.reports} initialProduct={product}/></main>;}
