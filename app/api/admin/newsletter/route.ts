import {readCatalog} from '@/lib/store';
import {requireAdmin,apiError} from '@/lib/security';
function cell(value:string){return '"'+value.replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';}
export async function GET(request:Request){try{await requireAdmin();const subscribers=(await readCatalog()).subscribers||[];if(new URL(request.url).searchParams.get('format')==='csv'){const csv='\uFEFFEmail,Subscribed at\r\n'+subscribers.map(s=>[s.email,s.createdAt].map(cell).join(',')).join('\r\n');return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="wickd-newsletter.csv"','Cache-Control':'no-store'}});}return Response.json({subscribers},{headers:{'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
