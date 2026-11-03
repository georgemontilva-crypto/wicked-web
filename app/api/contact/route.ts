import {mutateCatalog} from '@/lib/store';
import {requireOrigin,jsonBody,rateLimit,apiError,HttpError} from '@/lib/security';
import {contactSchema} from '@/lib/validation';
import type {Message} from '@/lib/catalog-types';
import {sendContactEmail} from '@/lib/contact-smtp';
export const runtime='nodejs';
export async function POST(request:Request){try{
 requireOrigin(request);rateLimit(request,'contact',5);
 const parsed=contactSchema.safeParse(await jsonBody(request,10000));
 if(!parsed.success)throw new HttpError(400,'Please check your name, email and message.');
 const data=parsed.data;if(data.website)return Response.json({ok:true});
 const message:Message={id:crypto.randomUUID(),name:data.name,email:data.email,subject:data.subject,message:data.message,createdAt:new Date().toISOString(),read:false};
 const recipient=await mutateCatalog(d=>{if(d.messages.length>=5000)throw new HttpError(503,'The inbox is temporarily unavailable.');d.messages.unshift(message);return d.settings.contactRecipientEmail;});
 const status=await sendContactEmail(message,recipient);
 try{await mutateCatalog(d=>{const saved=d.messages.find(m=>m.id===message.id);if(saved)saved.emailStatus=status;});}catch{console.error('Unable to update SMTP status. Contact message was saved.');}
 return Response.json({ok:true});
}catch(e){return apiError(e);}}
