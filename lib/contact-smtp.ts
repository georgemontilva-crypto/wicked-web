import 'server-only';
import nodemailer from 'nodemailer';
import {z} from 'zod';
import {contactEmailContent} from './contact-email';
import type {Message} from './catalog-types';

export function smtpOptions(env:NodeJS.ProcessEnv=process.env){
 const host=env.SMTP_HOST?.trim(),user=env.SMTP_USER?.trim(),pass=env.SMTP_PASSWORD,from=env.SMTP_FROM?.trim();
 const port=Number(env.SMTP_PORT||587);
 if(!host||!user||!pass||!from)return null;
 if(!Number.isInteger(port)||port<1||port>65535||!z.string().email().safeParse(from).success)throw new Error('Invalid SMTP configuration.');
 return {host,port,secure:port===465,requireTLS:port!==465,auth:{user,pass},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000,dnsTimeout:10000,disableFileAccess:true,disableUrlAccess:true,tls:{rejectUnauthorized:true}};
}

export async function sendContactEmail(message:Message,recipient:string):Promise<NonNullable<Message['emailStatus']>>{
 if(!recipient)return 'not-configured';
 let transport:ReturnType<typeof nodemailer.createTransport>|undefined;
 try{
  const options=smtpOptions();if(!options)return 'not-configured';
  if(!z.string().email().safeParse(recipient).success)return 'failed';
  transport=nodemailer.createTransport(options);
  const info=await transport.sendMail({from:{name:"WICK'D Contact",address:process.env.SMTP_FROM!.trim()},to:recipient,replyTo:message.email,subject:`WICK'D Contact — ${message.subject}`,messageId:`<contact-${message.id}@${process.env.SMTP_FROM!.split('@')[1]}>`,...contactEmailContent(message)});
  return info.accepted.length?'sent':'failed';
 }catch{console.error('Contact SMTP delivery failed. Message retained in admin inbox.');return 'failed';}
 finally{transport?.close();}
}
