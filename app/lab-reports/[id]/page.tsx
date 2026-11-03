import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ChevronRight,Download} from 'lucide-react';
import {canonical} from '@/lib/seo';
import {readCatalog,publicCatalog} from '@/lib/store';
import {PdfViewer} from '@/components/pdf-viewer';
export const dynamic='force-dynamic';
async function find(id:string){const d=publicCatalog(await readCatalog()),report=d.reports.find(r=>r.id===id);if(!report)return null;const product=d.products.find(p=>p.id===report.productId)!,variant=product.variants.find(v=>v.id===report.variantId);return {report,product,variant};}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params,f=await find(id);return f?{title:f.report.title,description:f.product.name+(f.variant?' · '+f.variant.name:'')+' · Batch '+f.report.batch,alternates:{canonical:canonical('/lab-reports/'+id)}}:{};}
export default async function ReportView({params}:{params:Promise<{id:string}>}){const {id}=await params,f=await find(id);if(!f)notFound();const {report,product,variant}=f;return <main>
 <div className="breadcrumbs page-width"><Link href="/products">Products</Link><ChevronRight size={12}/><Link href={'/products/'+product.id+(variant?'?variant='+variant.id:'')}>{product.name}</Link><ChevronRight size={12}/><span>Lab report</span></div>
 <section className="report-view page-width">
  <header className="report-view-head">{variant?.images[0]&&<img src={variant.images[0]} alt={product.name+' — '+variant.name}/>}<div><p className="eyebrow">{product.name}{variant?' · '+variant.name:''}</p><h1>{report.title}</h1><div className="report-meta"><span>Batch: {report.batch}</span><span>{report.laboratory}</span><span>{report.date}</span></div></div><a className="button ghost" href={report.file} download><Download size={16}/>Download PDF</a></header>
  <PdfViewer src={report.file} title={report.title}/>
 </section>
</main>;}
