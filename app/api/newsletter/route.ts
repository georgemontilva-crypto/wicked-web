import {z} from 'zod';
import {mutateCatalog} from '@/lib/store';
import {requireOrigin,jsonBody,rateLimit,apiError,HttpError} from '@/lib/security';
const schema=z.object({email:z.string().trim().email().max(200),consent:z.literal(true),website:z.string().max(200).optional()}).strict();
export async function POST(request:Request){try{requireOrigin(request);rateLimit(request,'newsletter',10);const parsed=schema.safeParse(await jsonBody(request,2000));if(!parsed.success)throw new HttpError(400,'Enter a valid email and agree to subscribe.');const {email,website}=parsed.data;if(!website)await mutateCatalog(d=>{d.subscribers??=[];const normalized=email.toLowerCase();if(d.subscribers.some(s=>s.email===normalized))return;if(d.subscribers.length>=50000)throw new HttpError(503,'Subscriptions are temporarily unavailable.');d.subscribers.push({id:crypto.randomUUID(),email:normalized,createdAt:new Date().toISOString()});});return Response.json({ok:true});}catch(e){return apiError(e);}}
